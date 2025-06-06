import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { generateFlowerFieldTexture, generateStarSkyTexture } from "https://web.tecnico.ulisboa.pt/ist1105900/cg/cg-trabalhoC/js/texture.js";
import { Moon } from "https://web.tecnico.ulisboa.pt/ist1105900/cg/cg-trabalhoC/js/moon.js";
import { OakTree } from "https://web.tecnico.ulisboa.pt/ist1105900/cg/cg-trabalhoC/js/oakTree.js";
import { AlentejoHouse } from "https://web.tecnico.ulisboa.pt/ist1105900/cg/cg-trabalhoC/js/house.js";
import { createOvni } from 'https://web.tecnico.ulisboa.pt/ist1105900/cg/cg-trabalhoC/js/ovni.js';


//////////////////////
/* GLOBAL CONSTANTS */
//////////////////////
const COLORS = Object.freeze({
  darkBlue: new THREE.Color(0x00008b),
  darkPurple: new THREE.Color(0x632cd4),
  lilac: new THREE.Color(0xc8a2c8),
  green: new THREE.Color(0x55cc55),
  darkGreen: new THREE.Color(0x5e8c61),
  brown: new THREE.Color(0xa96633),
  white: new THREE.Color(0xffffff),
  moonYellow: new THREE.Color(0xebc815),
});

const LIGHT_INTENSITY = Object.freeze({
  ambient: 0.15,
  directional: 1.2,
});

const TERRAIN_HALF_SIZE = 64;
const TERRAIN_HEIGHT_MAP_PATH = 'https://web.tecnico.ulisboa.pt/ist1105900/cg/cg-trabalhoC/assets/heightmap.png';

// Manual offset to adjust tree positioning
const TREE_Y_OFFSET = -1.5;
const HOUSE_Y_OFFSET = 1;

const GEOMETRY = {
  terrain: new THREE.PlaneGeometry(TERRAIN_HALF_SIZE * 2, TERRAIN_HALF_SIZE * 2, 128, 128),
  skyDome: new THREE.SphereGeometry(200, 64, 64),
};

const MATERIAL_PARAMS = {
  terrain: () => ({
    map: fieldTexture,
    side: THREE.DoubleSide,
  }),
  skyDome: () => ({ 
    map: skyTexture,
    side: THREE.BackSide 
  }),
};

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let rootGroup;
let scene, renderer, loader;
let terrainMesh, skydome;
let terrainHeightMap, fieldTexture, skyTexture;
let moon;
let clock;
let oakTreeGroups = [];
let alentejoHouse;
let houseGroup;
let ovni;
const ovniMovement = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
const OVNI_ANGULAR_SPEED = (2 * Math.PI) / 10; // 1 rotação em 10s
const OVNI_LINEAR_SPEED = 5; // unidades por segundo

// Camera and controls
let camera, controls;

// Material and lighting management
let currentMaterialType = 'phong'; // default to phong
let lightingEnabled = true;
let sceneObjects = [];

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createAlentejoHouse() {
  alentejoHouse = new AlentejoHouse();
  houseGroup = alentejoHouse.createHouse(
    2,                                    // escala
    new THREE.Vector3(0, 40, 0),       // posição inicial
    new THREE.Euler(0, Math.PI / 4, 0)   // rotação (45 graus)
  );
  
  rootGroup.add(houseGroup);
}

function getTerrainHeight(x, z, imageData, canvasWidth, canvasHeight, heightScale) {
  let u = (x + TERRAIN_HALF_SIZE) / (2 * TERRAIN_HALF_SIZE);
  let v = (z + TERRAIN_HALF_SIZE) / (2 * TERRAIN_HALF_SIZE);
  
  u = Math.max(0, Math.min(1, u));
  v = Math.max(0, Math.min(1, v));
  
  const pixelX = Math.floor(u * (canvasWidth - 1));
  const pixelY = Math.floor(v * (canvasHeight - 1));
  const pixelIndex = (pixelY * canvasWidth + pixelX) * 4;
  const heightValue = imageData.data[pixelIndex] / 255;
  
  return heightValue * heightScale;
}

function createScene() {
  scene = new THREE.Scene();
  rootGroup = createGroup({ y: -5, parent: scene });
  scene.background = new THREE.Color(0x1a1a2e);

  createLights();
  
  moon = new Moon();
  moon.createMoon(rootGroup);
  
  createTerrain();
  createOakTrees();
  createSkyDome();
  createAlentejoHouse();
  ovni = createOvni(new THREE.Vector3(0, 20, 0), scene);


}

function createOakTrees() {
  const oakTree1 = new OakTree();
  const treeGroup1 = oakTree1.createOakTree(3, new THREE.Vector3(24, 0, 34), new THREE.Euler(0, 0, 0), rootGroup);
  oakTreeGroups.push(treeGroup1);
  sceneObjects.push({ type: 'tree', group: treeGroup1, instance: oakTree1 });
  
  const oakTree2 = new OakTree();
  const treeGroup2 = oakTree2.createOakTree(1.5, new THREE.Vector3(-28, 0, 17), new THREE.Euler(0, Math.PI / 2, 0), rootGroup);
  oakTreeGroups.push(treeGroup2);
  sceneObjects.push({ type: 'tree', group: treeGroup2, instance: oakTree2 });
  
  const oakTree3 = new OakTree();
  const treeGroup3 = oakTree3.createOakTree(4, new THREE.Vector3(-41, 0, -14), new THREE.Euler(0, Math.PI / 6, 0), rootGroup);
  oakTreeGroups.push(treeGroup3);
  sceneObjects.push({ type: 'tree', group: treeGroup3, instance: oakTree3 });
  
  const oakTree4 = new OakTree();
  const treeGroup4 = oakTree4.createOakTree(4, new THREE.Vector3(-14, 0, -23), new THREE.Euler(0, -Math.PI / 2, 0), rootGroup);
  oakTreeGroups.push(treeGroup4);
  sceneObjects.push({ type: 'tree', group: treeGroup4, instance: oakTree4 });
  
  const oakTree5 = new OakTree();
  const treeGroup5 = oakTree5.createOakTree(8, new THREE.Vector3(15, 0, -26), new THREE.Euler(0, Math.PI / 3, 0), rootGroup);
  oakTreeGroups.push(treeGroup5);
  sceneObjects.push({ type: 'tree', group: treeGroup5, instance: oakTree5 });
}

function createTerrain() {
 
  // Correct orientation (XZ plane)
  GEOMETRY.terrain.rotateX(-Math.PI / 2);
  
  const material = new THREE.MeshPhongMaterial({ 
    map: fieldTexture,
    side: THREE.DoubleSide,
    wireframe: false
  });
  
  terrainMesh = new THREE.Mesh(GEOMETRY.terrain, material);
  terrainMesh.position.set(0, 0, 0);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = false;
  
  rootGroup.add(terrainMesh);
}

function createSkyDome() {
  const material = new THREE.MeshBasicMaterial({ 
    ...MATERIAL_PARAMS.skyDome() 
  });
  
  skydome = new THREE.Mesh(GEOMETRY.skyDome, material);
  rootGroup.add(skydome);
}

function createLights() {
  const ambientLight = new THREE.AmbientLight(COLORS.moonYellow, LIGHT_INTENSITY.ambient);
  rootGroup.add(ambientLight);
}

////////////
/* UPDATE */
////////////
function update() {
  if (!scene) return; // Don't update if scene isn't ready
  
  const deltaTime = clock.getDelta();
  
  // Update the moon
  if (moon) {
    moon.update(deltaTime);
  }
  if (ovni) {
    // Rotação contínua
    ovni.mesh.rotation.y += OVNI_ANGULAR_SPEED * deltaTime;

    // Movimento com teclas
    const dir = new THREE.Vector3();
    if (ovniMovement.ArrowUp) dir.z -= 1;
    if (ovniMovement.ArrowDown) dir.z += 1;
    if (ovniMovement.ArrowLeft) dir.x -= 1;
    if (ovniMovement.ArrowRight) dir.x += 1;

    if (dir.lengthSq() > 0) {
      dir.normalize();
      ovni.mesh.position.addScaledVector(dir, OVNI_LINEAR_SPEED * deltaTime);
    }
  }
}

/////////////
/* DISPLAY */
/////////////
function render() {
  if (scene && camera) {
    renderer.render(scene, camera);
  }
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  loader = new THREE.TextureLoader();
  clock = new THREE.Clock();
  
  // Generate textures
  fieldTexture = generateFlowerFieldTexture(1024, 1024);
  skyTexture = generateStarSkyTexture(1024, 1024);

  // Setup renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  
  // VR Setup
  document.body.appendChild(VRButton.createButton(renderer));
  renderer.xr.enabled = true;

  // Setup camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-32, 40, -50);

  // Setup controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  createScene();

  // Load heightmap and apply it automatically
  terrainHeightMap = loader.load(TERRAIN_HEIGHT_MAP_PATH, () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = terrainHeightMap.image.width;
    canvas.height = terrainHeightMap.image.height;
    
    ctx.drawImage(terrainHeightMap.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const positions = terrainMesh.geometry.attributes.position;
    const heightScale = 8;
    
    // Apply heightmap to terrain vertices
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      let u = (x + TERRAIN_HALF_SIZE) / (2 * TERRAIN_HALF_SIZE);
      let v = (z + TERRAIN_HALF_SIZE) / (2 * TERRAIN_HALF_SIZE);
      
      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));
      
      const pixelX = Math.floor(u * (canvas.width - 1));
      const pixelY = Math.floor(v * (canvas.height - 1));
      const pixelIndex = (pixelY * canvas.width + pixelX) * 4;
      const heightValue = imageData.data[pixelIndex] / 255;
      
      positions.setY(i, heightValue * heightScale);
    }
    
    positions.needsUpdate = true;
    terrainMesh.geometry.computeVertexNormals();
    
    // Position trees using same heightmap data
    oakTreeGroups.forEach((treeGroup) => {
      const x = treeGroup.position.x;
      const z = treeGroup.position.z;
      
      let u = (x + TERRAIN_HALF_SIZE) / (2 * TERRAIN_HALF_SIZE);
      let v = (z + TERRAIN_HALF_SIZE) / (2 * TERRAIN_HALF_SIZE);
      
      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));
      
      const pixelX = Math.floor(u * (canvas.width - 1));
      const pixelY = Math.floor(v * (canvas.height - 1));
      const pixelIndex = (pixelY * canvas.width + pixelX) * 4;
      const heightValue = imageData.data[pixelIndex] / 255;
      
      treeGroup.position.y = heightValue * heightScale + TREE_Y_OFFSET;
    });

    if (houseGroup) {
      const houseX = houseGroup.position.x;
      const houseZ = houseGroup.position.z;
      
      const houseTerrainHeight = getTerrainHeight(houseX, houseZ, imageData, canvas.width, canvas.height, heightScale);
      houseGroup.position.y = houseTerrainHeight + HOUSE_Y_OFFSET;
    }
  });

  // Event listeners
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
  switch (e.key.toLowerCase()) {
    case '1':
      // Regenerate flower field texture
      if (terrainMesh) {
        if (terrainMesh.material.map) {
          terrainMesh.material.map.dispose();
        }
        fieldTexture = generateFlowerFieldTexture(1024, 1024);
        terrainMesh.material.map = fieldTexture;
        terrainMesh.material.needsUpdate = true;
      }
      break;
        
    case '2':
      // Regenerate star sky texture  
      if (skydome) {
        if (skydome.material.map) {
          skydome.material.map.dispose();
        }
        skyTexture = generateStarSkyTexture(1024, 1024);
        skydome.material.map = skyTexture;
        skydome.material.needsUpdate = true;
      }
      break;

    case 'd':
      // Toggle moon's directional light
      if (moon) {
        moon.toggleDirectionalLight();
      }
      break;
    case 'q':
      // Phong Flat shading
      updateAllMaterials('lambert');
      break;
    case 'w':
      // Phong Smooth shading
      updateAllMaterials('phong');
      break;
      
    case 'e':
      // Cartoon shading
      updateAllMaterials('toon');
      break;

    case 'r':
      toggleLighting();
      break;

    case 'p':
      ovni?.togglePointLights();
      break;

    case 's':
      ovni?.toggleSpotlight();
      break;
  }
  if (e.key in ovniMovement) {
    ovniMovement[e.key] = true;
  }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  if (e.key in ovniMovement) {
    ovniMovement[e.key] = false;
  }
}

///////////////
/* UTILITIES */
///////////////
function createGroup({ x = 0, y = 0, z = 0, scale = [1, 1, 1], parent }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.set(...scale);
  parent.add(group);
  return group;
}

/////////////////////
/* MATERIAL MANAGEMENT */
/////////////////////
function createMaterial(color, materialType = currentMaterialType) {
  switch(materialType) {
    case 'lambert':
      return new THREE.MeshLambertMaterial({ 
        color,
        flatShading: true // Phong Flat shading
      });
    case 'phong':
      return new THREE.MeshPhongMaterial({ 
        color,
        shininess: 100,
        specular: 0x222222,
        flatShading: false // Phong Smooth shading
      });
    case 'toon':
      return new THREE.MeshToonMaterial({ 
        color,
      });
    default:
      return new THREE.MeshPhongMaterial({ color });
  }
}

function updateAllMaterials(materialType) {
  currentMaterialType = materialType;
  
  // Update house materials
  if (alentejoHouse) {
    alentejoHouse.setMaterialType(materialType);
  }
  
  // Update tree materials using the tree instances
  sceneObjects.forEach(obj => {
    if (obj.type === 'tree' && obj.instance) {
      obj.instance.setMaterialType(obj.group, materialType);
    }
  });
  
  // Update moon material (preserve emissive properties)
  if (moon && moon.setMaterialType) {
    moon.setMaterialType(materialType);
  }
  
  // Update ovni materials
  if (ovni && ovni.mesh) {
    ovni.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const currentColor = child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff);
        const newMaterial = createMaterial(currentColor.getHex(), materialType);
        
        // Preserve transparency (cockpit)
        if (child.material.transparent) {
          newMaterial.transparent = true;
          newMaterial.opacity = child.material.opacity;
        }
        
        child.material.dispose();
        child.material = newMaterial;
      }
    });
  }
  
  // Update terrain material
  if (terrainMesh) {
    const newMaterial = createMaterial(0xffffff, materialType);
    if (terrainMesh.material.map) {
      newMaterial.map = terrainMesh.material.map;
    }
    newMaterial.side = THREE.DoubleSide;
    
    terrainMesh.material.dispose();
    terrainMesh.material = newMaterial;
  }
}

function toggleLighting() {
  lightingEnabled = !lightingEnabled;
  
  // Toggle directional light from moon
  if (moon && moon.directionalLight) {
    moon.directionalLight.intensity = lightingEnabled ? moon.LIGHT_INTENSITY.directional : 0;
  }
  
  // Toggle ambient light
  scene.traverse((child) => {
    if (child instanceof THREE.AmbientLight) {
      child.intensity = lightingEnabled ? LIGHT_INTENSITY.ambient : 0;
    }
  });
  
  // Toggle ovni lights
  if (ovni) {
    if (ovni.spotlight) {
      ovni.spotlight.intensity = lightingEnabled ? 50 : 0;
    }
    if (ovni.pointLights) {
      ovni.pointLights.forEach(light => {
        light.intensity = lightingEnabled ? 0.4 : 0;
      });
    }
  }
  
  // Update moon emissive intensity to make it still visible when lighting is off
  if (moon && moon.mesh && moon.mesh.material) {
    moon.mesh.material.emissiveIntensity = lightingEnabled ? 
      moon.LIGHT_INTENSITY.emissive : 
      moon.LIGHT_INTENSITY.emissiveToggled;
  }
  
  // Update moon's point light
  if (moon && moon.pointLight) {
    moon.pointLight.intensity = lightingEnabled ? 
      moon.LIGHT_INTENSITY.pointLight : 
      moon.LIGHT_INTENSITY.pointLight * 0.3;
  }
}

init();
animate();