import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface SpatialSceneProps {
  imageSrc: string;
  depthSrc: string;
  isFullscreen?: boolean;
}

function SpatialPhoto({
  imageSrc,
  depthSrc,
  isFullscreen = false,
}: SpatialSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();

  const imageTexture = useLoader(
    THREE.TextureLoader,
    imageSrc
  );

  const depthTexture = useLoader(
    THREE.TextureLoader,
    depthSrc
  );

  // Safely cast image to HTMLImageElement to fix compilation
  const imgElement = imageTexture.image as HTMLImageElement;
  const imageAspect = (imgElement?.width || 1) / (imgElement?.height || 1);

  const planeWidth = 4;
  const planeHeight = planeWidth / imageAspect;

  // Handle camera FOV updates cleanly when screen state toggles
  useEffect(() => {
    let active = true;

    if ('fov' in camera) {
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
    const targetX = pointer.x * 0.18;
    const targetY = pointer.y * 0.1;

    // Smoothly drift the camera
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Smoothly update the uParallax uniform to match the camera's inertia
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms && material.uniforms.uParallax) {
        material.uniforms.uParallax.value.x += (pointer.x - material.uniforms.uParallax.value.x) * 0.05;
        material.uniforms.uParallax.value.y += (pointer.y - material.uniforms.uParallax.value.y) * 0.05;
      }
    }
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uImage: {
          value: imageTexture,
        },
        uDepth: {
          value: depthTexture,
        },
        uDisplacement: {
          value: 0.65,
        },
        uParallax: {
          value: new THREE.Vector2(0, 0),
        },
      },

      vertexShader: `
        uniform sampler2D uDepth;
        uniform float uDisplacement;
        uniform vec2 uParallax;

        varying vec2 vUv;

        void main() {
          vUv = uv;

          vec3 pos = position;

          float depth =
            texture2D(
              uDepth,
              uv
            ).r;

          depth = smoothstep(
            0.05,
            0.95,
            depth
          );

          depth = pow(
            depth,
            1.4
          );

          float centeredDepth = depth - 0.5;

          // Apply physical 3D displacement
          pos.z += centeredDepth * uDisplacement;

          // Apply depth-dependent lateral parallax drift
          pos.x += centeredDepth * uParallax.x * 0.05;
          pos.y += centeredDepth * uParallax.y * 0.03;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(pos, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D uImage;

        varying vec2 vUv;

        void main() {
          gl_FragColor =
            texture2D(
              uImage,
              vUv
            );
        }
      `,
    });
  }, [imageTexture, depthTexture]);

  return (
    <mesh
      ref={meshRef}
      material={material}
    >
      <planeGeometry
        args={[
          planeWidth,
          planeHeight,
          300,
          300,
        ]}
      />
    </mesh>
  );
}

export default function SpatialScene({
  imageSrc,
  depthSrc,
  isFullscreen = false,
}: SpatialSceneProps) {
  return (
    <div 
      className={`w-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "h-full min-h-[70vh]" : "h-[500px]"
      }`}
    >
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
          />
        </Suspense>
      </Canvas>
    </div>
  );
}