import * as THREE from "three";

/**
 * Class to create and manage oak trees in the scene
 */
export class OakTree {
  
  constructor() {
    // Define tree-specific constants
    this.CYLINDER_SEGMENTS = 32;
    this.SPHERE_SEGMENTS = 32;
    
    // Tree-specific colors
    this.COLORS = {
      brown: new THREE.Color(0xa96633),
      darkGreen: new THREE.Color(0x5e8c61),
    };
    
    // Tree geometries
    this.GEOMETRY = {
      treeTrunk: new THREE.CylinderGeometry(0.5, 0.5, 1, this.CYLINDER_SEGMENTS),
      treePrimaryBranch: new THREE.CylinderGeometry(0.5, 0.5, 4, this.CYLINDER_SEGMENTS),
      treeSecondaryBranch: new THREE.CylinderGeometry(0.4, 0.4, 4, this.CYLINDER_SEGMENTS),
      treeLeaf: new THREE.SphereGeometry(1, this.SPHERE_SEGMENTS, this.SPHERE_SEGMENTS),
    };
    
    // Scaling for leaves (ellipsoids)
    this.ELLIPSOID_SCALING = {
      treePrimaryBranchLeaf: new THREE.Vector3(2.3, 1.1, 1.5),
      treeSecondaryBranchLeaf: new THREE.Vector3(3, 1.375, 2.5),
    };
    
    // Tree materials
    this.MATERIAL_PARAMS = {
      treeTrunk: () => ({ color: this.COLORS.brown }),
      treePrimaryBranch: () => ({ color: this.COLORS.brown }),
      treeSecondaryBranch: () => ({ color: this.COLORS.brown }),
      treeLeaf: () => ({ color: this.COLORS.darkGreen }),
    };
  }
  
  /**
   * Creates a named mesh with material
   */
  createTreeMesh(name, parent, materialType = 'phong') {
    const params = this.MATERIAL_PARAMS[name]();
    const material = this.createMaterial(params.color, materialType);
    const mesh = new THREE.Mesh(this.GEOMETRY[name], material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  
  /**
   * Creates a material based on type
   */
  createMaterial(color, materialType = 'phong') {
    switch(materialType) {
      case 'lambert':
        return new THREE.MeshLambertMaterial({ 
          color,
          flatShading: true
        });
      case 'phong':
        return new THREE.MeshPhongMaterial({ 
          color,
          shininess: 100,
          specular: 0x222222,
          flatShading: false
        });
      case 'toon':
        return new THREE.MeshToonMaterial({ 
          color,
        });
      default:
        return new THREE.MeshPhongMaterial({ color });
    }
  }
  
  /**
   * Updates all materials in a tree group to the specified type
   */
  setMaterialType(treeGroup, materialType) {
    treeGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const currentColor = child.material.color.clone();
        child.material.dispose();
        child.material = this.createMaterial(currentColor.getHex(), materialType);
      }
    });
  }
  
  /**
   * Creates an oak tree with the given parameters and places it in the scene.
   */
  createOakTree(trunkHeight, position, rotation, parentGroup) {
    // Create tree group
    const treeGroup = new THREE.Group();
    treeGroup.position.copy(position);
    treeGroup.rotation.copy(rotation);
    parentGroup.add(treeGroup);

    // Create trunk
    const oakTrunk = this.createTreeMesh('treeTrunk', treeGroup);
    oakTrunk.scale.setY(trunkHeight);
    oakTrunk.position.setY(trunkHeight / 2); // Cylinder is centered by default

    // Create primary branch
    const primaryBranch = this.createTreeMesh('treePrimaryBranch', treeGroup);

    const primaryBranchIncl = Math.PI / 6; // 30 degrees
    // Calculate position to perfectly align branch base with trunk
    const primaryBranchX =
      Math.sin(primaryBranchIncl) *
        (this.GEOMETRY.treePrimaryBranch.parameters.height / 2 +
          this.GEOMETRY.treePrimaryBranch.parameters.radiusBottom / Math.tan(primaryBranchIncl)) -
      this.GEOMETRY.treeTrunk.parameters.radiusTop;
    const primaryBranchY =
      Math.cos(primaryBranchIncl) *
        (this.GEOMETRY.treePrimaryBranch.parameters.height / 2 +
          this.GEOMETRY.treePrimaryBranch.parameters.radiusBottom * Math.tan(primaryBranchIncl)) -
      this.GEOMETRY.treeTrunk.parameters.radiusTop;

    primaryBranch.position.set(primaryBranchX, trunkHeight + primaryBranchY, 0);
    primaryBranch.rotation.set(0, 0, -primaryBranchIncl);

    // Create secondary branch
    const secondaryBranch = this.createTreeMesh('treeSecondaryBranch', treeGroup);

    const secondaryBranchIncl = Math.PI / 3; // 60 degrees
    // Position secondary branch so its base is inside the primary branch
    secondaryBranch.position.set(
      -this.GEOMETRY.treeSecondaryBranch.parameters.height / 4,
      trunkHeight + this.GEOMETRY.treeSecondaryBranch.parameters.height / 2,
      0
    );
    secondaryBranch.rotation.set(0, 0, secondaryBranchIncl);

    // Position leaf above primary branch top
    const primaryBranchLeaf = this.createTreeMesh('treeLeaf', treeGroup);
    primaryBranchLeaf.position.set(
      primaryBranchX * 2,
      trunkHeight + primaryBranchY * 2 + this.ELLIPSOID_SCALING.treePrimaryBranchLeaf.y / 2,
      0
    );
    primaryBranchLeaf.scale.copy(this.ELLIPSOID_SCALING.treePrimaryBranchLeaf);

    // Position leaf above secondary branch top
    const secondaryBranchLeaf = this.createTreeMesh('treeLeaf', treeGroup);
    secondaryBranchLeaf.position.set(
      (-this.GEOMETRY.treeSecondaryBranch.parameters.height * 2) / 3,
      trunkHeight + primaryBranchY * 2 + this.ELLIPSOID_SCALING.treePrimaryBranchLeaf.y / 2,
      0
    );
    secondaryBranchLeaf.scale.copy(this.ELLIPSOID_SCALING.treeSecondaryBranchLeaf);
    
    return treeGroup;
  }
  
  /**
   * Cleans up tree resources
   */
  dispose() {
    Object.values(this.GEOMETRY).forEach(geometry => {
      if (geometry.dispose) {
        geometry.dispose();
      }
    });
  }
}