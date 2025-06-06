import * as THREE from "three";

/**
 * Class to create and manage the moon in the scene
 */
export class Moon {
  constructor() {
    // Moon configuration
    this.MOON_RADIUS = 8;
    this.SPHERE_SEGMENTS = 32;
    
    // Moon specific colors
    this.COLORS = {
      moonYellow: new THREE.Color(0xebc815),
      white: new THREE.Color(0xffffff),
      moonGlow: new THREE.Color(0xfff9c4),
    };
    
    // Light configuration
    this.LIGHT_INTENSITY = {
      directional: 1.2,
      pointLight: 0.2,
      emissive: 0.4,
      emissiveToggled: 0.1,
    };
    
    // Moon position in the sky
    this.MOON_POSITION = new THREE.Vector3(-60, 80, -40);
    
    // Moon state
    this.mesh = null;
    this.directionalLight = null;
    this.pointLight = null;
    this.lightEnabled = true;
  }

  /**
   * Creates the moon and its lights, adding them to the parent group
   */
  createMoon(parentGroup) {
    // Create the moon
    this.createMoonMesh();
    this.createDirectionalLight();
    
    // Add everything to parent group
    if (this.mesh) {
      parentGroup.add(this.mesh);
    }
    if (this.directionalLight) {
      parentGroup.add(this.directionalLight);
      parentGroup.add(this.directionalLight.target);
    }
    
    return this;
  }

  /**
   * Creates the moon as a bright sphere
   */
  createMoonMesh() {
    // Moon geometry
    const moonGeometry = new THREE.SphereGeometry(this.MOON_RADIUS, this.SPHERE_SEGMENTS, this.SPHERE_SEGMENTS);
    
    // Emissive material for bright moon
    const moonMaterial = this.createMaterial(this.COLORS.white.getHex(), 'phong', {
      emissive: this.COLORS.moonGlow,
      emissiveIntensity: this.LIGHT_INTENSITY.emissive,
      shininess: 10
    });

    // Create moon mesh
    this.mesh = new THREE.Mesh(moonGeometry, moonMaterial);
    this.mesh.position.copy(this.MOON_POSITION);
    
    // Add point light inside moon to simulate glow
    this.pointLight = new THREE.PointLight(
      this.COLORS.white, 
      this.LIGHT_INTENSITY.pointLight, 
      100
    );
    this.pointLight.position.copy(this.MOON_POSITION);
    this.mesh.add(this.pointLight);
  }

  /**
   * Creates the global directional light for the scene
   */
  createDirectionalLight() {
    // Main directional light
    this.directionalLight = new THREE.DirectionalLight(
      this.COLORS.moonYellow, 
      this.LIGHT_INTENSITY.directional
    );
    
    // Position with non-zero angle relative to xOy plane
    // Direction: diagonal from the moon
    this.directionalLight.position.set(-50, 60, -30);
    this.directionalLight.target.position.set(0, 0, 0);
    
    // Configure shadows
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 200;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
  }

  /**
   * Toggles the directional light on/off
   */
  toggleDirectionalLight() {
    if (this.directionalLight) {
      this.lightEnabled = !this.lightEnabled;
      this.directionalLight.intensity = this.lightEnabled ? this.LIGHT_INTENSITY.directional : 0;
      
      // Also adjust moon emissivity
      if (this.mesh && this.mesh.material) {
        this.mesh.material.emissiveIntensity = this.lightEnabled ? 
          this.LIGHT_INTENSITY.emissive : 
          this.LIGHT_INTENSITY.emissiveToggled;
      }
      
      // Also adjust point light
      if (this.pointLight) {
        this.pointLight.intensity = this.lightEnabled ? 
          this.LIGHT_INTENSITY.pointLight : 
          this.LIGHT_INTENSITY.pointLight * 0.3;
      }
    }
  }

  /**
   * Updates the moon (for animations)
   */
  update(deltaTime) {
    // Smooth moon rotation around its own axis
    if (this.mesh) {
      this.mesh.rotation.y += 0.002;
    }
  }

  /**
   * Cleans up moon resources
   */
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    if (this.directionalLight) {
      this.directionalLight.dispose();
    }
  }

  /**
   * Creates a material based on type
   */
  createMaterial(color, materialType = 'phong', options = {}) {
    let material;
    switch(materialType) {
      case 'lambert':
        material = new THREE.MeshLambertMaterial({ 
          color,
          flatShading: true
        });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({ 
          color,
          shininess: options.shininess || 10,
          specular: 0x222222,
          flatShading: false
        });
        break;
      case 'toon':
        material = new THREE.MeshToonMaterial({ 
          color,
        });
        break;
      default:
        material = new THREE.MeshPhongMaterial({ color });
    }
    
    // Preserve emissive properties for moon
    if (options.emissive) {
      material.emissive = options.emissive;
      material.emissiveIntensity = options.emissiveIntensity || 0.4;
    }
    
    return material;
  }

  /**
   * Updates the moon's material type
   */
  setMaterialType(materialType) {
    if (this.mesh && this.mesh.material) {
      const currentColor = this.mesh.material.color.clone();
      const currentEmissive = this.mesh.material.emissive.clone();
      const currentEmissiveIntensity = this.mesh.material.emissiveIntensity;
      
      this.mesh.material.dispose();
      this.mesh.material = this.createMaterial(currentColor.getHex(), materialType, {
        emissive: currentEmissive,
        emissiveIntensity: currentEmissiveIntensity,
        shininess: 10
      });
    }
  }
}