import * as THREE from "three";

export function generateFlowerFieldTexture(width = 512, height = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Light green background
  ctx.fillStyle = "#90ee90";
  ctx.fillRect(0, 0, width, height);

  // Flower colors: white, yellow, lilac, light blue
  const flowerColors = ["#ffffff", "#ffff00", "#c8a2c8", "#add8e6"];

  // Generate hundreds of small flowers
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function generateStarSkyTexture(width = 512, height = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Dark-blue to purple gradient
    const gradient = ctx.createLinearGradient(0, height*0.4, 0, height);
    gradient.addColorStop(0, "#00008b");
    gradient.addColorStop(1, "#632cd4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

  // White stars
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}