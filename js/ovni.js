import * as THREE from "three";

export function createOvni(initialPosition, scene) {
  const ovniGroup = new THREE.Group();
  ovniGroup.position.copy(initialPosition);
  scene.add(ovniGroup);

  // Corpo achatado
  const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
  bodyGeometry.scale(3.5, 1, 3.5);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xf03a47 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  ovniGroup.add(body);

  // Cockpit: calote
  const cockpitGeometry = new THREE.SphereGeometry(1.5, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2);
  const cockpitMaterial = new THREE.MeshPhongMaterial({
    color: 0x84cae7,
    transparent: true,
    opacity: 0.75,
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.set(0, 1, 0);
  ovniGroup.add(cockpit);

  // Cilindro achatado na base
  const cylinderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
  cylinderGeometry.scale(1, 0.2, 1);
  const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x1e90ff });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, -0.95, 0);
  ovniGroup.add(cylinder);

  // Spotlight (holofote)
  const spotlight = new THREE.SpotLight(0xc9e4e7, 50, 50, Math.PI / 9, 0.3);
  spotlight.castShadow = true;
  spotlight.position.set(0, -0.95, 0);

  const spotlightTarget = new THREE.Object3D();
  spotlightTarget.position.set(0, -10, 0);
    ovniGroup.add(spotlightTarget);
  spotlight.target = spotlightTarget;
  ovniGroup.add(spotlight);

  // Esferas pequenas com luzes pontuais
  const pointLights = [];
  const smallSphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
  const smallSphereMat = new THREE.MeshPhongMaterial({ color: 0xc9e4e7 });

  const radius = 3;
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = -0.6;

    const smallSphere = new THREE.Mesh(smallSphereGeo, smallSphereMat);
    smallSphere.position.set(x, y, z);
    ovniGroup.add(smallSphere);

    const light = new THREE.PointLight(0xc9e4e7, 0.4, 25);
    light.position.set(x, y, z);
    ovniGroup.add(light);
    pointLights.push(light);
  }

  return {
    mesh: ovniGroup,
    spotlight,
    pointLights,
    toggleSpotlight: () => {
      spotlight.visible = !spotlight.visible;
    },
    togglePointLights: () => {
      pointLights.forEach((l) => (l.visible = !l.visible));
    },
  };
}
