'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function HeroBanner3D({ onFireworksLaunch }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [igniteCount, setIgniteCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff3aa, 2.0);
    mainLight.position.set(10, 15, 12);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xff4422, 1.2);
    fillLight.position.set(-10, -8, 8);
    scene.add(fillLight);

    // Dynamic point light for firework flashes
    const flashLight = new THREE.PointLight(0xffd700, 0, 30);
    scene.add(flashLight);

    // --- Textures helper for glowing spark particles ---
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.2, 'rgba(255,230,120,0.9)');
      grad.addColorStop(0.5, 'rgba(255,100,20,0.4)');
      grad.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(pCanvas);
    };
    const sparkTexture = createParticleTexture();

    // --- 3D Festive Elements Group ---
    const festiveGroup = new THREE.Group();
    scene.add(festiveGroup);

    // Position festive group to the right side on desktop, center-bottom on mobile
    const updateGroupPosition = () => {
      const aspect = container.clientWidth / container.clientHeight;
      if (aspect > 1.1) {
        festiveGroup.position.set(5.2, -0.4, 0);
        festiveGroup.scale.set(1, 1, 1);
      } else {
        festiveGroup.position.set(0, 0.8, -2);
        festiveGroup.scale.set(0.8, 0.8, 0.8);
      }
    };
    updateGroupPosition();

    // 1. 3D Rocket Firecracker
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(0, 0.5, 0);
    festiveGroup.add(rocketGroup);

    // Rocket Body (Cylinder with bright red metallic foil)
    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 3.8, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      metalness: 0.5,
      roughness: 0.25,
      emissive: 0x330000,
    });
    const rocketBody = new THREE.Mesh(bodyGeo, bodyMat);
    rocketGroup.add(rocketBody);

    // Golden bands on body
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xffd500,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x554400,
    });
    [-1.2, 0, 1.2].forEach((yPos) => {
      const ringGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.25, 32);
      const ring = new THREE.Mesh(ringGeo, bandMat);
      ring.position.y = yPos;
      rocketGroup.add(ring);
    });

    // Rocket Cone / Nose (Golden & Red cone)
    const coneGeo = new THREE.ConeGeometry(0.85, 1.6, 32);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x443300,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 2.7;
    rocketGroup.add(cone);

    // Rocket Wooden Stabilizer Stick
    const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.5, 12);
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.8,
    });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(0.65, -2.8, 0);
    rocketGroup.add(stick);

    // Fuse Cord at bottom
    const fuseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.set(0, -2.2, 0);
    fuse.rotation.z = 0.3;
    rocketGroup.add(fuse);

    // Fuse Active Sparks Particle Emitter
    const fuseSparkCount = 30;
    const fuseSparkGeo = new THREE.BufferGeometry();
    const fuseSparkPositions = new Float32Array(fuseSparkCount * 3);
    const fuseSparkLifes = new Float32Array(fuseSparkCount);
    for (let i = 0; i < fuseSparkCount; i++) {
      fuseSparkPositions[i * 3] = (Math.random() - 0.5) * 0.2;
      fuseSparkPositions[i * 3 + 1] = -2.6 - Math.random() * 0.4;
      fuseSparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      fuseSparkLifes[i] = Math.random();
    }
    fuseSparkGeo.setAttribute('position', new THREE.BufferAttribute(fuseSparkPositions, 3));
    const fuseSparkMat = new THREE.PointsMaterial({
      size: 0.4,
      map: sparkTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffcc33,
    });
    const fuseSparks = new THREE.Points(fuseSparkGeo, fuseSparkMat);
    rocketGroup.add(fuseSparks);

    // 2. 3D Spinning Ground Chakra (Sudarshan Wheel)
    const chakraGroup = new THREE.Group();
    chakraGroup.position.set(-2.8, -2.2, 1.2);
    chakraGroup.rotation.x = 0.55;
    chakraGroup.rotation.z = -0.2;
    festiveGroup.add(chakraGroup);

    const chakraGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.18, 48);
    const chakraMat = new THREE.MeshStandardMaterial({
      color: 0xdd1100,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x330000,
    });
    const chakraBody = new THREE.Mesh(chakraGeo, chakraMat);
    chakraGroup.add(chakraBody);

    // Golden Spiral Star Blades on Chakra
    const spokeCount = 8;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spokeGeo = new THREE.BoxGeometry(0.18, 0.2, 1.4);
      const spokeMat = new THREE.MeshStandardMaterial({
        color: 0xffd500,
        metalness: 0.8,
        roughness: 0.2,
      });
      const spoke = new THREE.Mesh(spokeGeo, spokeMat);
      spoke.position.set(Math.cos(angle) * 0.8, 0.05, Math.sin(angle) * 0.8);
      spoke.rotation.y = -angle + 0.3;
      chakraGroup.add(spoke);
    }

    // Chakra Center Golden Dome
    const centerDomeGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const centerDome = new THREE.Mesh(centerDomeGeo, bandMat);
    centerDome.position.y = 0.12;
    chakraGroup.add(centerDome);

    // Chakra Swirling Sparks
    const chakraSparkCount = 70;
    const chakraSparkGeo = new THREE.BufferGeometry();
    const chakraSparkPositions = new Float32Array(chakraSparkCount * 3);
    const chakraSparkVelocities = [];
    for (let i = 0; i < chakraSparkCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 1.4 + Math.random() * 1.5;
      chakraSparkPositions[i * 3] = Math.cos(ang) * r;
      chakraSparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      chakraSparkPositions[i * 3 + 2] = Math.sin(ang) * r;
      chakraSparkVelocities.push({
        angle: ang,
        radius: r,
        speed: 0.04 + Math.random() * 0.05,
      });
    }
    chakraSparkGeo.setAttribute('position', new THREE.BufferAttribute(chakraSparkPositions, 3));
    const chakraSparkMat = new THREE.PointsMaterial({
      size: 0.45,
      map: sparkTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffea00,
    });
    const chakraSparks = new THREE.Points(chakraSparkGeo, chakraSparkMat);
    chakraGroup.add(chakraSparks);

    // 3. Ambient Floating 3D Golden Stars / Lanterns
    const starCount = 35;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      const starGeo = new THREE.OctahedronGeometry(0.18 + Math.random() * 0.15, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: [0xffe066, 0xffaa00, 0xff4444, 0xffffff][Math.floor(Math.random() * 4)],
        emissive: 0xaa6600,
        metalness: 0.8,
        roughness: 0.2,
      });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.position.set(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10 - 2
      );
      scene.add(starMesh);
      stars.push({
        mesh: starMesh,
        speed: 0.01 + Math.random() * 0.02,
        rotSpeed: 0.015 + Math.random() * 0.03,
        baseY: starMesh.position.y,
        seed: Math.random() * 100,
      });
    }

    // --- Fireworks Particle System ---
    const fireworks = [];
    const colors = [
      0xff1e56, // Crimson
      0xffac00, // Gold Orange
      0x00f5d4, // Cyan
      0x7b2cbf, // Royal Violet
      0xfee440, // Electric Yellow
      0x38b000, // Emerald
      0xffffff, // Diamond White
    ];

    const createFirework = (originX, originY, originZ, chosenColor) => {
      const particleCount = 110;
      const colorVal = chosenColor || colors[Math.floor(Math.random() * colors.length)];
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = originX;
        positions[i * 3 + 1] = originY;
        positions[i * 3 + 2] = originZ;

        // Spherical explosion distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = 0.14 + Math.random() * 0.28;

        velocities.push({
          x: speed * Math.sin(phi) * Math.cos(theta),
          y: speed * Math.sin(phi) * Math.sin(theta),
          z: speed * Math.cos(phi),
        });
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        size: 0.65,
        map: sparkTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: colorVal,
        opacity: 1,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Flash illumination
      flashLight.position.set(originX, originY, originZ + 2);
      flashLight.color.setHex(colorVal);
      flashLight.intensity = 4.5;

      fireworks.push({
        points,
        geometry,
        material,
        velocities,
        life: 1.0,
        decay: 0.016 + Math.random() * 0.012,
      });
    };

    // Auto-launch initial fireworks
    createFirework(-4, 3, 0, 0xffd700);
    createFirework(3, 4, -2, 0xff2a2a);

    // Periodic auto fireworks
    let lastAutoFirework = 0;

    // --- Interactive Launch Rocket Streak ---
    const rocketsInFlight = [];
    const launchRocket = (targetX, targetY) => {
      const startX = targetX * 0.6 + (Math.random() - 0.5) * 2;
      const startY = -10;
      const startZ = (Math.random() - 0.5) * 3;

      const trailGeo = new THREE.BufferGeometry();
      const trailPos = new Float32Array(15 * 3);
      for (let i = 0; i < 15; i++) {
        trailPos[i * 3] = startX;
        trailPos[i * 3 + 1] = startY;
        trailPos[i * 3 + 2] = startZ;
      }
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
      const trailMat = new THREE.PointsMaterial({
        size: 0.45,
        map: sparkTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: 0xffa500,
      });
      const trailMesh = new THREE.Points(trailGeo, trailMat);
      scene.add(trailMesh);

      rocketsInFlight.push({
        trailMesh,
        trailGeo,
        trailMat,
        x: startX,
        y: startY,
        z: startZ,
        targetX,
        targetY,
        progress: 0,
        speed: 0.035,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    // --- Mouse Parallax & Interaction ---
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (clientX === undefined || clientY === undefined) return;

      mouse.targetX = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };

    // Click to ignite firework at cursor
    const handleClick = (e) => {
      // Don't trigger if clicked on a button or link
      if (e.target.closest('a, button, input, select')) return;

      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Map normalized coordinates into 3D world space coordinates
      const worldX = normX * 9;
      const worldY = normY * 5;

      launchRocket(worldX, worldY);
      setIgniteCount((c) => c + 1);
    };

    window.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      updateGroupPosition();
    };
    window.addEventListener('resize', handleResize);

    // --- Expose firework salute trigger to parent if needed ---
    if (onFireworksLaunch) {
      onFireworksLaunch.current = () => {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const rx = (Math.random() - 0.5) * 12;
            const ry = 1 + Math.random() * 5;
            createFirework(rx, ry, (Math.random() - 0.5) * 4);
          }, i * 180);
        }
      };
    }

    // --- Animation Loop ---
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 3D Camera slight tilt
      camera.position.x = mouse.x * 1.8;
      camera.position.y = mouse.y * 1.2;
      camera.lookAt(0, 0, 0);

      // Rocket hovering & gentle waving motion
      rocketGroup.position.y = 0.4 + Math.sin(elapsedTime * 2.2) * 0.25;
      rocketGroup.rotation.y = Math.sin(elapsedTime * 1.5) * 0.35 + mouse.x * 0.4;
      rocketGroup.rotation.z = Math.sin(elapsedTime * 1.8) * 0.08 - mouse.x * 0.2;
      rocketGroup.rotation.x = mouse.y * 0.3;

      // Fuse sparks animation
      const fPos = fuseSparkGeo.attributes.position.array;
      for (let i = 0; i < fuseSparkCount; i++) {
        fPos[i * 3 + 1] -= 0.015;
        fPos[i * 3] += (Math.random() - 0.5) * 0.02;
        fPos[i * 3 + 2] += (Math.random() - 0.5) * 0.02;
        if (fPos[i * 3 + 1] < -3.2) {
          fPos[i * 3] = (Math.random() - 0.5) * 0.15;
          fPos[i * 3 + 1] = -2.3;
          fPos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
        }
      }
      fuseSparkGeo.attributes.position.needsUpdate = true;

      // Chakra continuous rapid spinning & spark swirl
      chakraGroup.rotation.y += 0.065;
      const cPos = chakraSparkGeo.attributes.position.array;
      for (let i = 0; i < chakraSparkCount; i++) {
        chakraSparkVelocities[i].angle += chakraSparkVelocities[i].speed;
        chakraSparkVelocities[i].radius += 0.02;
        if (chakraSparkVelocities[i].radius > 3.4) {
          chakraSparkVelocities[i].radius = 1.3;
        }
        cPos[i * 3] = Math.cos(chakraSparkVelocities[i].angle) * chakraSparkVelocities[i].radius;
        cPos[i * 3 + 2] = Math.sin(chakraSparkVelocities[i].angle) * chakraSparkVelocities[i].radius;
      }
      chakraSparkGeo.attributes.position.needsUpdate = true;

      // Floating Stars rotation & bobbing
      stars.forEach((s) => {
        s.mesh.rotation.x += s.rotSpeed;
        s.mesh.rotation.y += s.rotSpeed;
        s.mesh.position.y = s.baseY + Math.sin(elapsedTime * 1.5 + s.seed) * 0.4;
      });

      // Update In-flight rockets
      for (let i = rocketsInFlight.length - 1; i >= 0; i--) {
        const r = rocketsInFlight[i];
        r.progress += r.speed;
        r.x += (r.targetX - r.x) * 0.1;
        r.y += (r.targetY - r.y) * 0.1;

        const posArray = r.trailGeo.attributes.position.array;
        // Shift trail points back
        for (let j = 14; j > 0; j--) {
          posArray[j * 3] = posArray[(j - 1) * 3];
          posArray[j * 3 + 1] = posArray[(j - 1) * 3 + 1];
          posArray[j * 3 + 2] = posArray[(j - 1) * 3 + 2];
        }
        posArray[0] = r.x;
        posArray[1] = r.y;
        posArray[2] = r.z;
        r.trailGeo.attributes.position.needsUpdate = true;

        if (r.progress >= 1.0 || Math.abs(r.y - r.targetY) < 0.3) {
          // Detonate!
          createFirework(r.x, r.y, r.z, r.color);
          scene.remove(r.trailMesh);
          r.trailGeo.dispose();
          r.trailMat.dispose();
          rocketsInFlight.splice(i, 1);
        }
      }

      // Update Fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.life -= fw.decay;
        fw.material.opacity = Math.max(0, fw.life);

        const pos = fw.geometry.attributes.position.array;
        for (let j = 0; j < fw.velocities.length; j++) {
          const v = fw.velocities[j];
          pos[j * 3] += v.x;
          pos[j * 3 + 1] += v.y;
          pos[j * 3 + 2] += v.z;

          // Gravity & Drag
          v.y -= 0.004;
          v.x *= 0.985;
          v.z *= 0.985;
        }
        fw.geometry.attributes.position.needsUpdate = true;

        if (fw.life <= 0) {
          scene.remove(fw.points);
          fw.geometry.dispose();
          fw.material.dispose();
          fireworks.splice(i, 1);
        }
      }

      // Fade out flash light
      if (flashLight.intensity > 0) {
        flashLight.intensity *= 0.92;
        if (flashLight.intensity < 0.05) flashLight.intensity = 0;
      }

      // Periodic auto firework
      if (elapsedTime - lastAutoFirework > 3.2) {
        lastAutoFirework = elapsedTime;
        const randX = (Math.random() - 0.5) * 14;
        const randY = 1.5 + Math.random() * 4.5;
        const randZ = (Math.random() - 0.5) * 4;
        createFirework(randX, randY, randZ);
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup on unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);

      // Dispose Geometries and Materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      sparkTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-3d-wrapper">
      <canvas ref={canvasRef} className="hero-3d-canvas" />
      <div className="hero-3d-hint">
        <span className="sparkle-icon">✨</span> Click anywhere to launch 3D fireworks!
        {igniteCount > 0 && <span className="ignite-badge">Launched: {igniteCount} 🎆</span>}
      </div>
    </div>
  );
}

