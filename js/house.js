import * as THREE from "three";

export class AlentejoHouse {
  constructor() {
    this.houseGroup = new THREE.Group();
    this.materials = {
      wall: new THREE.MeshPhongMaterial({ color: 0xffffff }), // Traditional Alentejo white
      roof: new THREE.MeshPhongMaterial({ color: 0xff6600 }), // Orange roof tiles
      door: new THREE.MeshPhongMaterial({ color: 0x0066cc }), // Blue door
      window: new THREE.MeshPhongMaterial({ color: 0x0066cc }), // Blue windows
      trim: new THREE.MeshPhongMaterial({ color: 0x3366ff }), // Blue trim
    };
  }

  createHouse(scale = 1, position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0)) {
    this.houseGroup = new THREE.Group();
    
    // Create house components
    this.createMainWalls();
    this.createRoof();
    this.createDoor();
    this.createWindows();
    this.createTrim();
    
    // Apply transformations
    this.houseGroup.scale.setScalar(scale);
    this.houseGroup.position.copy(position);
    this.houseGroup.rotation.copy(rotation);
    
    return this.houseGroup;
  }

  createMainWalls() {
    // House dimensions
    const width = 8;
    const height = 4;
    const depth = 6;
    
    // Front wall (with door and window)
    const frontWallGeometry = new THREE.BufferGeometry();
    const frontVertices = new Float32Array([
      // Main wall (excluding door and window openings)
      -width/2, 0, depth/2,  width/2, 0, depth/2,  width/2, height, depth/2,
      -width/2, 0, depth/2,  width/2, height, depth/2,  -width/2, height, depth/2,
    ]);
    frontWallGeometry.setAttribute('position', new THREE.BufferAttribute(frontVertices, 3));
    frontWallGeometry.computeVertexNormals();
    
    const frontWall = new THREE.Mesh(frontWallGeometry, this.materials.wall);
    this.houseGroup.add(frontWall);

    // Back wall
    const backWallGeometry = new THREE.BufferGeometry();
    const backVertices = new Float32Array([
      width/2, 0, -depth/2,  -width/2, 0, -depth/2,  -width/2, height, -depth/2,
      width/2, 0, -depth/2,  -width/2, height, -depth/2,  width/2, height, -depth/2,
    ]);
    backWallGeometry.setAttribute('position', new THREE.BufferAttribute(backVertices, 3));
    backWallGeometry.computeVertexNormals();
    
    const backWall = new THREE.Mesh(backWallGeometry, this.materials.wall);
    this.houseGroup.add(backWall);

    // Left wall
    const leftWallGeometry = new THREE.BufferGeometry();
    const leftVertices = new Float32Array([
      -width/2, 0, -depth/2,  -width/2, 0, depth/2,  -width/2, height, depth/2,
      -width/2, 0, -depth/2,  -width/2, height, depth/2,  -width/2, height, -depth/2,
    ]);
    leftWallGeometry.setAttribute('position', new THREE.BufferAttribute(leftVertices, 3));
    leftWallGeometry.computeVertexNormals();
    
    const leftWall = new THREE.Mesh(leftWallGeometry, this.materials.wall);
    this.houseGroup.add(leftWall);

    // Right wall (with window)
    const rightWallGeometry = new THREE.BufferGeometry();
    const rightVertices = new Float32Array([
      width/2, 0, depth/2,  width/2, 0, -depth/2,  width/2, height, -depth/2,
      width/2, 0, depth/2,  width/2, height, -depth/2,  width/2, height, depth/2,
    ]);
    rightWallGeometry.setAttribute('position', new THREE.BufferAttribute(rightVertices, 3));
    rightWallGeometry.computeVertexNormals();
    
    const rightWall = new THREE.Mesh(rightWallGeometry, this.materials.wall);
    this.houseGroup.add(rightWall);
  }

  createRoof() {
    const roofHeight = 2;
    const width = 8; // With eaves
    const depth = 6;
    const wallHeight = 4;
    
    // LEFT ROOF SLOPE - Inclined rectangular plane
    const leftRoofGeometry = new THREE.BufferGeometry();
    const leftRoofVertices = new Float32Array([
      // Left roof slope rectangle
      -width/2, wallHeight, depth/2,           // front bottom
      0, wallHeight + roofHeight, depth/2,     // front top (ridge)
      0, wallHeight + roofHeight, -depth/2,    // back top (ridge)
      
      -width/2, wallHeight, depth/2,           // front bottom
      0, wallHeight + roofHeight, -depth/2,    // back top (ridge)
      -width/2, wallHeight, -depth/2,          // back bottom
    ]);
    leftRoofGeometry.setAttribute('position', new THREE.BufferAttribute(leftRoofVertices, 3));
    leftRoofGeometry.computeVertexNormals();
    
    const leftRoof = new THREE.Mesh(leftRoofGeometry, this.materials.roof);
    this.houseGroup.add(leftRoof);

    // RIGHT ROOF SLOPE - Inclined rectangular plane
    const rightRoofGeometry = new THREE.BufferGeometry();
    const rightRoofVertices = new Float32Array([
      // Right roof slope rectangle
      0, wallHeight + roofHeight, depth/2,     // front top (ridge)
      width/2, wallHeight, depth/2,            // front bottom
      width/2, wallHeight, -depth/2,           // back bottom
      
      0, wallHeight + roofHeight, depth/2,     // front top (ridge)
      width/2, wallHeight, -depth/2,           // back bottom
      0, wallHeight + roofHeight, -depth/2,    // back top (ridge)
    ]);
    rightRoofGeometry.setAttribute('position', new THREE.BufferAttribute(rightRoofVertices, 3));
    rightRoofGeometry.computeVertexNormals();
    
    const rightRoof = new THREE.Mesh(rightRoofGeometry, this.materials.roof);
    this.houseGroup.add(rightRoof);

    // FRONT TRIANGLE - Closes the front gable
    const frontTriangleGeometry = new THREE.BufferGeometry();
    const frontTriangleVertices = new Float32Array([
      -width/2, wallHeight, depth/2,        // left corner
      width/2, wallHeight, depth/2,         // right corner
      0, wallHeight + roofHeight, depth/2,  // top
    ]);
    frontTriangleGeometry.setAttribute('position', new THREE.BufferAttribute(frontTriangleVertices, 3));
    frontTriangleGeometry.computeVertexNormals();
    
    const frontTriangle = new THREE.Mesh(frontTriangleGeometry, this.materials.roof);
    this.houseGroup.add(frontTriangle);

    // BACK TRIANGLE - Closes the back gable
    const backTriangleGeometry = new THREE.BufferGeometry();
    const backTriangleVertices = new Float32Array([
      width/2, wallHeight, -depth/2,        // right corner
      -width/2, wallHeight, -depth/2,       // left corner (reversed order for correct normal)
      0, wallHeight + roofHeight, -depth/2, // top
    ]);
    backTriangleGeometry.setAttribute('position', new THREE.BufferAttribute(backTriangleVertices, 3));
    backTriangleGeometry.computeVertexNormals();
    
    const backTriangle = new THREE.Mesh(backTriangleGeometry, this.materials.roof);
    this.houseGroup.add(backTriangle);
  }

  createDoor() {
    // Door on the front wall
    const doorWidth = 1.2;
    const doorHeight = 2.5;
    const doorDepth = 0.1;
    
    const doorGeometry = new THREE.BufferGeometry();
    const doorVertices = new Float32Array([
      // Front face of the door
      -doorWidth/2, 0, 3.05,  doorWidth/2, 0, 3.05,  doorWidth/2, doorHeight, 3.05,
      -doorWidth/2, 0, 3.05,  doorWidth/2, doorHeight, 3.05,  -doorWidth/2, doorHeight, 3.05,
    ]);
    doorGeometry.setAttribute('position', new THREE.BufferAttribute(doorVertices, 3));
    doorGeometry.computeVertexNormals();
    
    const door = new THREE.Mesh(doorGeometry, this.materials.door);
    door.position.set(0, 0, 0); // Position on the front wall
    this.houseGroup.add(door);
  }

  createWindows() {
    const windowWidth = 1;
    const windowHeight = 1;
    
    // Window 1: Next to the door (between door and center)
    const frontWindow1Geometry = new THREE.BufferGeometry();
    const frontWindow1Vertices = new Float32Array([
      -windowWidth/2, 1.5, 3.05,  windowWidth/2, 1.5, 3.05,  windowWidth/2, 2.5, 3.05,
      -windowWidth/2, 1.5, 3.05,  windowWidth/2, 2.5, 3.05,  -windowWidth/2, 2.5, 3.05,
    ]);
    frontWindow1Geometry.setAttribute('position', new THREE.BufferAttribute(frontWindow1Vertices, 3));
    frontWindow1Geometry.computeVertexNormals();
    
    const frontWindow1 = new THREE.Mesh(frontWindow1Geometry, this.materials.window);
    frontWindow1.position.set(-2.5, 0, 0); // Position between door (-1.5) and center (0)
    this.houseGroup.add(frontWindow1);

    // Window 2: Right side of the front wall
    const frontWindow2Geometry = new THREE.BufferGeometry();
    const frontWindow2Vertices = new Float32Array([
      -windowWidth/2, 1.5, 3.05,  windowWidth/2, 1.5, 3.05,  windowWidth/2, 2.5, 3.05,
      -windowWidth/2, 1.5, 3.05,  windowWidth/2, 2.5, 3.05,  -windowWidth/2, 2.5, 3.05,
    ]);
    frontWindow2Geometry.setAttribute('position', new THREE.BufferAttribute(frontWindow2Vertices, 3));
    frontWindow2Geometry.computeVertexNormals();
    
    const frontWindow2 = new THREE.Mesh(frontWindow2Geometry, this.materials.window);
    frontWindow2.position.set(2, 0, 0); // Right side position
    this.houseGroup.add(frontWindow2);

    // Window on the left side wall
    const leftWindowGeometry = new THREE.BufferGeometry();
    const leftWindowVertices = new Float32Array([
      -4.05, 1.5, -windowWidth/2,  -4.05, 1.5, windowWidth/2,  -4.05, 2.5, windowWidth/2,
      -4.05, 1.5, -windowWidth/2,  -4.05, 2.5, windowWidth/2,  -4.05, 2.5, -windowWidth/2,
    ]);
    leftWindowGeometry.setAttribute('position', new THREE.BufferAttribute(leftWindowVertices, 3));
    leftWindowGeometry.computeVertexNormals();
    
    const leftWindow = new THREE.Mesh(leftWindowGeometry, this.materials.window);
    this.houseGroup.add(leftWindow);

    // Window on the right side wall
    const rightWindowGeometry = new THREE.BufferGeometry();
    const rightWindowVertices = new Float32Array([
      4.05, 1.5, windowWidth/2,  4.05, 1.5, -windowWidth/2,  4.05, 2.5, -windowWidth/2,
      4.05, 1.5, windowWidth/2,  4.05, 2.5, -windowWidth/2,  4.05, 2.5, windowWidth/2,
    ]);
    rightWindowGeometry.setAttribute('position', new THREE.BufferAttribute(rightWindowVertices, 3));
    rightWindowGeometry.computeVertexNormals();
    
    const rightWindow = new THREE.Mesh(rightWindowGeometry, this.materials.window);
    this.houseGroup.add(rightWindow);

    // Window 1 on the back wall (left side)
    const backWindow1Geometry = new THREE.BufferGeometry();
    const backWindow1Vertices = new Float32Array([
      windowWidth/2, 1.5, -3.05,  -windowWidth/2, 1.5, -3.05,  -windowWidth/2, 2.5, -3.05,
      windowWidth/2, 1.5, -3.05,  -windowWidth/2, 2.5, -3.05,  windowWidth/2, 2.5, -3.05,
    ]);
    backWindow1Geometry.setAttribute('position', new THREE.BufferAttribute(backWindow1Vertices, 3));
    backWindow1Geometry.computeVertexNormals();
    
    const backWindow1 = new THREE.Mesh(backWindow1Geometry, this.materials.window);
    backWindow1.position.set(-2, 0, 0); // Left side of back wall
    this.houseGroup.add(backWindow1);

    // Window 2 on the back wall (right side)
    const backWindow2Geometry = new THREE.BufferGeometry();
    const backWindow2Vertices = new Float32Array([
      windowWidth/2, 1.5, -3.05,  -windowWidth/2, 1.5, -3.05,  -windowWidth/2, 2.5, -3.05,
      windowWidth/2, 1.5, -3.05,  -windowWidth/2, 2.5, -3.05,  windowWidth/2, 2.5, -3.05,
    ]);
    backWindow2Geometry.setAttribute('position', new THREE.BufferAttribute(backWindow2Vertices, 3));
    backWindow2Geometry.computeVertexNormals();
    
    const backWindow2 = new THREE.Mesh(backWindow2Geometry, this.materials.window);
    backWindow2.position.set(2, 0, 0); // Right side of back wall
    this.houseGroup.add(backWindow2);
  }

  createTrim() {
    // Blue trim at the base (3D baseboard with thickness)
    const trimHeight = 0.3;
    const trimThickness = 0.2; // Baseboard thickness
    const width = 8;
    const depth = 6;
    
    // Front trim - rectangular parallelepiped
    const frontTrimGeometry = new THREE.BoxGeometry(width, trimHeight, trimThickness);
    const frontTrim = new THREE.Mesh(frontTrimGeometry, this.materials.trim);
    frontTrim.position.set(0, trimHeight/2, depth/2 + trimThickness/2);
    this.houseGroup.add(frontTrim);

    // Back trim - rectangular parallelepiped
    const backTrimGeometry = new THREE.BoxGeometry(width, trimHeight, trimThickness);
    const backTrim = new THREE.Mesh(backTrimGeometry, this.materials.trim);
    backTrim.position.set(0, trimHeight/2, -depth/2 - trimThickness/2);
    this.houseGroup.add(backTrim);

    // Left trim - rectangular parallelepiped
    const leftTrimGeometry = new THREE.BoxGeometry(trimThickness, trimHeight, depth);
    const leftTrim = new THREE.Mesh(leftTrimGeometry, this.materials.trim);
    leftTrim.position.set(-width/2 - trimThickness/2, trimHeight/2, 0);
    this.houseGroup.add(leftTrim);

    // Right trim - rectangular parallelepiped
    const rightTrimGeometry = new THREE.BoxGeometry(trimThickness, trimHeight, depth);
    const rightTrim = new THREE.Mesh(rightTrimGeometry, this.materials.trim);
    rightTrim.position.set(width/2 + trimThickness/2, trimHeight/2, 0);
    this.houseGroup.add(rightTrim);
  }

  // Method to switch between different material types
  setMaterialType(materialType) {
    const createMaterial = (color) => {
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
    };

    this.materials = {
      wall: createMaterial(0xffffff),
      roof: createMaterial(0xff6600),
      door: createMaterial(0x0066cc),
      window: createMaterial(0x0066cc),
      trim: createMaterial(0x3366ff),
    };

    // Update materials of all meshes
    this.houseGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const currentColor = child.material.color.clone();
        child.material.dispose();
        child.material = createMaterial(currentColor.getHex());
      }
    });
  }

  // Method to position the house on terrain based on heightmap
  positionOnTerrain(x, z, heightmapData, canvasWidth, canvasHeight, heightScale, terrainHalfSize) {
    let u = (x + terrainHalfSize) / (2 * terrainHalfSize);
    let v = (z + terrainHalfSize) / (2 * terrainHalfSize);
    
    u = Math.max(0, Math.min(1, u));
    v = Math.max(0, Math.min(1, v));
    
    const pixelX = Math.floor(u * (canvasWidth - 1));
    const pixelY = Math.floor(v * (canvasHeight - 1));
    const pixelIndex = (pixelY * canvasWidth + pixelX) * 4;
    const heightValue = heightmapData[pixelIndex] / 255;
    
    this.houseGroup.position.set(x, heightValue * heightScale, z);
  }
}