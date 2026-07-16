# spatial_scenes 

An interactive web showcase that projects ordinary 2D images into dynamic "3D spatial" scenes-similar to the fluid, high-end visual experiences seen on Apple's spatial scenes feature.

## About the Project

This project was built to explore the boundaries of spatial depth in a web browser. By mapping 2D textures onto dynamically deformed 3D meshes, it creates a living, interactive parallax depth field that reacts directly to your cursor.

> **Developer Note:** Please forgive any rough edges or bugs! I whipped this entire prototype up in a single day with the help of Gemini to quickly prove and bring this concept to life.

---

## Video Demo

https://github.com/user-attachments/assets/ab1ddb6d-caa4-4abf-9025-ed51d89608e1 

---

## The Stack

This prototype is built on a modern, ultra-fast frontend stack and is deployed as a static site:

* **Frontend Library:** [React](https://react.dev) for the user interface components
* **3D Engine:** [Three.js](https://threejs.org) (via React Three Fiber) to project the spatial meshes and compute real-time pointer interactions
* **Language & Runtime:** [TypeScript](https://www.typescriptlang.org/) for end-to-end safety, built with [Bun](https://bun.sh) for lightning-fast package management
* **Deployment:** Hosted and continuously deployed on [Cloudflare Pages](https://pages.cloudflare.com/) for instant, global delivery

---

## Attributions & Credits

The magic behind the depth rendering in this project is powered by **Apple's Depth Pro** model. Deep appreciation goes to the researchers and developers who open-sourced this incredible machine learning model.

* **Depth Pro Model:** [Apple ML Depth Pro on GitHub](https://github.com/apple/ml-depth-pro)