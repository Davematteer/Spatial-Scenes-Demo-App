import React, { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

// iOS Safari exposes a non-standard permission gate for motion sensors.
type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function getOrientationEvent(): OrientationEventWithPermission | undefined {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window
    ? (window.DeviceOrientationEvent as OrientationEventWithPermission)
    : undefined;
}

interface SpatialSceneProps {
  imageSrc: string;
  depthSrc: string;
  isFullscreen?: boolean;
}

function SpatialPhoto({
  imageSrc,
  depthSrc,
  isFullscreen = false,
  tiltRef,
}: SpatialSceneProps & { tiltRef: React.RefObject<{ x: number; y: number; isSupported: boolean }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();

  const imageTexture = useLoader(THREE.TextureLoader, imageSrc);
  const depthTexture = useLoader(THREE.TextureLoader, depthSrc);

  const imgElement = imageTexture.image as HTMLImageElement;
  const imageAspect = (imgElement?.width || 1) / (imgElement?.height || 1);

  const planeWidth = 4;
  const planeHeight = planeWidth / imageAspect;

  // Handle camera FOV updates cleanly when screen state toggles
  useEffect(() => {
    let active = true;

    if ("fov" in camera) {
      requestAnimationFrame(() => {
        if (!active) return;
        const pCamera = camera as THREE.PerspectiveCamera;
        pCamera.fov = isFullscreen ? 55 : 40;
        pCamera.updateProjectionMatrix();
      });
    }

    return () => {
      active = false;
    };
  }, [isFullscreen, camera]);

  useMemo(() => {
    imageTexture.wrapS = THREE.ClampToEdgeWrapping;
    imageTexture.wrapT = THREE.ClampToEdgeWrapping;

    depthTexture.wrapS = THREE.ClampToEdgeWrapping;
    depthTexture.wrapT = THREE.ClampToEdgeWrapping;

    imageTexture.minFilter = THREE.LinearFilter;
    imageTexture.magFilter = THREE.LinearFilter;

    depthTexture.minFilter = THREE.LinearFilter;
    depthTexture.magFilter = THREE.LinearFilter;
  }, [imageTexture, depthTexture]);

  useFrame(() => {
    // If mobile tilt data is active, use it. Otherwise, fall back to desktop pointer.
    const inputX = tiltRef.current.isSupported ? tiltRef.current.x : pointer.x;
    const inputY = tiltRef.current.isSupported ? tiltRef.current.y : pointer.y;

    // Wider bounds so small motions still read clearly
    const targetX = inputX * 0.18;
    const targetY = inputY * 0.12;

    // Tracking speed; higher feels more responsive
    const smoothFactor = 0.08;

    camera.position.x += (targetX - camera.position.x) * smoothFactor;
    camera.position.y += (-targetY - camera.position.y) * smoothFactor;
    camera.lookAt(0, 0, 0);

    // Smoothly update the uParallax uniform to match the input's inertia
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms && material.uniforms.uParallax) {
        material.uniforms.uParallax.value.x += (inputX - material.uniforms.uParallax.value.x) * smoothFactor;
        material.uniforms.uParallax.value.y += (inputY - material.uniforms.uParallax.value.y) * smoothFactor;
      }
    }
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uImage: { value: imageTexture },
        uDepth: { value: depthTexture },
        uDisplacement: { value: 0.4 }, // Balanced displacement
        uParallax: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        uniform sampler2D uDepth;
        uniform float uDisplacement;
        uniform vec2 uParallax;

        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // 5-Tap Box Blur on the depth texture directly in the shader
          float depth = (
            texture2D(uDepth, uv + vec2(-0.001, 0.0)).r +
            texture2D(uDepth, uv + vec2( 0.001, 0.0)).r +
            texture2D(uDepth, uv + vec2(0.0, -0.001)).r +
            texture2D(uDepth, uv + vec2(0.0,  0.001)).r +
            texture2D(uDepth, uv).r
          ) / 5.0;

          // Inverse depth curve smoothing
          depth = smoothstep(0.05, 0.95, depth);
          depth = pow(depth, 1.4);

          float centeredDepth = depth - 0.5;

          // Edge Attenuation to kill tearing along sharp depth transitions
          float d1 = texture2D(uDepth, uv).r;
          float d2 = texture2D(uDepth, uv + vec2(0.002, 0.0)).r;
          float edge = abs(d1 - d2);
          float attenuation = 1.0 - smoothstep(0.05, 0.15, edge);

          // Apply attenuation to limit displacement near sharp object edges
          centeredDepth *= attenuation;

          // Apply physical 3D displacement
          pos.z += centeredDepth * uDisplacement;

          // Depth-dependent parallax drift
          pos.x += centeredDepth * uParallax.x * 0.045;
          pos.y += centeredDepth * uParallax.y * 0.03;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uImage;
        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(uImage, vUv);
        }
      `,
    });
  }, [imageTexture, depthTexture]);

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[planeWidth, planeHeight, 500, 500]} />
    </mesh>
  );
}

export default function SpatialScene({
  imageSrc,
  depthSrc,
  isFullscreen = false,
}: SpatialSceneProps) {
  // Store live tilt data inside a Ref to avoid performance-killing React state updates
  const tiltRef = useRef({ x: 0, y: 0, isSupported: false });
  const initialOrientation = useRef<{ beta: number | null; gamma: number | null }>({ beta: null, gamma: null });

  const [requiresPermission, setRequiresPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // 1. Detect if this is an iOS device requiring explicit motion permission
  useEffect(() => {
    if (typeof getOrientationEvent()?.requestPermission === "function") {
      setRequiresPermission(true);
    } else {
      // Android / standard web environments don't require permission gates
      setPermissionGranted(true);
    }
  }, []);

  // 2. Setup the Orientation Event Listener
  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      tiltRef.current.isSupported = true;

      // Dynamic Calibration: Locks baseline holding posture on first reading
      if (initialOrientation.current.beta === null) {
        initialOrientation.current.beta = beta;
        initialOrientation.current.gamma = gamma;
      }

      // Calculate displacement relative to holding angle
      let deltaBeta = beta - (initialOrientation.current.beta ?? 60);
      let deltaGamma = gamma - (initialOrientation.current.gamma ?? 0);

      // Tilting 8 degrees reaches max displacement.
      const maxAngle = 8;
      deltaBeta = Math.max(-maxAngle, Math.min(maxAngle, deltaBeta));
      deltaGamma = Math.max(-maxAngle, Math.min(maxAngle, deltaGamma));

      // Map to normalized swing range (-1.0 to 1.0)
      tiltRef.current.x = deltaGamma / maxAngle;
      tiltRef.current.y = deltaBeta / maxAngle;
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [permissionGranted]);

  // 3. User-gesture handler to unlock iOS gyroscope
  const handleRequestPermission = async () => {
    const orientationEvent = getOrientationEvent();
    if (typeof orientationEvent?.requestPermission === "function") {
      try {
        const status = await orientationEvent.requestPermission();
        if (status === "granted") {
          setPermissionGranted(true);
          setRequiresPermission(false);
        }
      } catch (err) {
        console.warn("Failed to obtain sensor access authorization:", err);
      }
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "h-full min-h-[70vh]" : "h-[500px]"
      }`}
    >
      {/* iOS Gesture Trigger Overlay */}
      {requiresPermission && !permissionGranted && (
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-white text-sm font-medium">
            Allow motion access to tilt the scene with your device.
          </p>
          <button
            onClick={handleRequestPermission}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Enable Motion
          </button>
        </div>
      )}

      <Canvas
        dpr={[1, 2]}
        camera={{
          position: [0, 0, 4],
          fov: 40,
        }}
      >
        <ambientLight intensity={1} />

        <Suspense fallback={null}>
          <SpatialPhoto
            imageSrc={imageSrc}
            depthSrc={depthSrc}
            isFullscreen={isFullscreen}
            tiltRef={tiltRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}