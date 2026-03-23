(function () {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const CYAN = new THREE.Color(0x00f0ff);
  const MAGENTA = new THREE.Color(0xff00aa);

  // PARTICLES
  const PARTICLE_COUNT = 800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

    const color = Math.random() > 0.5 ? CYAN : MAGENTA;
    colors[i * 3]     = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // CENTRAL ICOSAHEDRONS
  const outerIco = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.2, 1),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })
  );
  scene.add(outerIco);

  const innerIco = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff00aa,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    })
  );
  scene.add(innerIco);

  // ORBITAL RINGS
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.005, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.15 })
  );
  ring1.rotation.x = Math.PI / 2;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.003, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0xff00aa, transparent: true, opacity: 0.08 })
  );
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.z = Math.PI / 6;
  scene.add(ring2);

  // MOUSE TRACKING
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  //ANIMATION LOOP
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    //Rotate icosahedrons
    outerIco.rotation.x = t * 0.1 + mouseY * 0.1;
    outerIco.rotation.y = t * 0.15 + mouseX * 0.1;

    innerIco.rotation.x = -t * 0.12 + mouseY * 0.05;
    innerIco.rotation.y = -t * 0.18 + mouseX * 0.05;

    //Rotate rings
    ring1.rotation.z = t * 0.05;
    ring2.rotation.z = -t * 0.03;
    ring2.rotation.x = Math.PI / 3 + Math.sin(t * 0.2) * 0.1;

    //Pulse opacity
    outerIco.material.opacity = 0.1 + Math.sin(t * 0.8) * 0.04;
    innerIco.material.opacity = 0.06 + Math.sin(t * 1.2 + 1) * 0.03;

    //Floating particles
    const posArray = particleGeometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArray[i * 3 + 1] += Math.sin(t + i * 0.1) * 0.001;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    //Subtle camera follow
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  //RESIZE HANDLER
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
