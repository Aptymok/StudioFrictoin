/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — Subterranean Testing Chamber 3D Scene
 * Built with Three.js according to the threejs skill guidelines:
 * - Composite 3-12 part procedural model (Apparatus A + Subterranean Chamber)
 * - Studio PBR lighting with RoomEnvironment + PMREMGenerator + warm key / cool fill
 * - Procedural CanvasTextures (zero 404 external texture dependencies)
 * - Damped camera transitions and 60fps loop in isolated WebGL container
 * - Collapsible bottom control dock (<= 15% viewport footprint)
 * - Inescapable DEMO_SYNTHETIC provenance stamp
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  Eye, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Maximize2, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Play,
  Pause,
  Compass
} from 'lucide-react';

interface ThreeSubterraneanChamberProps {
  onCaptureSnapshot?: (dataUrl: string) => void;
}

export const ThreeSubterraneanChamber: React.FC<ThreeSubterraneanChamberProps> = ({
  onCaptureSnapshot,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [isOscillating, setIsOscillating] = useState(true);
  const [explodedRatio, setExplodedRatio] = useState(0); // 0 to 1
  const [cameraView, setCameraView] = useState<'general' | 'apparatus' | 'axonometric'>('general');

  // Mutable refs to pass UI state into Three.js render loop without remounting canvas
  const stateRef = useRef({
    wireframe: wireframeMode,
    oscillating: isOscillating,
    exploded: explodedRatio,
    cameraView,
  });

  useEffect(() => {
    stateRef.current = {
      wireframe: wireframeMode,
      oscillating: isOscillating,
      exploded: explodedRatio,
      cameraView,
    };
  }, [wireframeMode, isOscillating, explodedRatio, cameraView]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.045);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio PBR Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x18181b, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfef3c7, 1.8);
    dirLight.position.set(5, 7, 4);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 20;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
      const d = 5;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
    }
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xb45309, 1.2, 10);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // 4. Procedural Textures (Zero external 404 dependencies)
    // Wood texture for workbench
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256;
    woodCanvas.height = 256;
    const woodCtx = woodCanvas.getContext('2d')!;
    woodCtx.fillStyle = '#261b14';
    woodCtx.fillRect(0, 0, 256, 256);
    woodCtx.fillStyle = '#1c130d';
    for (let i = 0; i < 256; i += 8) {
      woodCtx.fillRect(0, i, 256, 2);
    }
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.colorSpace = THREE.SRGBColorSpace;

    // Measurement scale texture
    const scaleCanvas = document.createElement('canvas');
    scaleCanvas.width = 128;
    scaleCanvas.height = 512;
    const scaleCtx = scaleCanvas.getContext('2d')!;
    scaleCtx.fillStyle = '#d6cebe';
    scaleCtx.fillRect(0, 0, 128, 512);
    scaleCtx.fillStyle = '#1c1917';
    scaleCtx.font = 'bold 20px monospace';
    scaleCtx.fillText('mm - 1934', 16, 32);
    for (let y = 50; y < 500; y += 15) {
      scaleCtx.fillRect(10, y, y % 45 === 0 ? 50 : 25, 2);
      if (y % 45 === 0) {
        scaleCtx.fillText(String((500 - y) / 10), 65, y + 6);
      }
    }
    const scaleTexture = new THREE.CanvasTexture(scaleCanvas);
    scaleTexture.colorSpace = THREE.SRGBColorSpace;

    // Stone floor texture
    const stoneCanvas = document.createElement('canvas');
    stoneCanvas.width = 256;
    stoneCanvas.height = 256;
    const stoneCtx = stoneCanvas.getContext('2d')!;
    stoneCtx.fillStyle = '#18181b';
    stoneCtx.fillRect(0, 0, 256, 256);
    stoneCtx.strokeStyle = '#27272a';
    stoneCtx.lineWidth = 2;
    for (let x = 0; x < 256; x += 32) {
      stoneCtx.beginPath();
      stoneCtx.moveTo(x, 0);
      stoneCtx.lineTo(x, 256);
      stoneCtx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      stoneCtx.beginPath();
      stoneCtx.moveTo(0, y);
      stoneCtx.lineTo(256, y);
      stoneCtx.stroke();
    }
    const stoneTexture = new THREE.CanvasTexture(stoneCanvas);
    stoneTexture.colorSpace = THREE.SRGBColorSpace;
    stoneTexture.wrapS = THREE.RepeatWrapping;
    stoneTexture.wrapT = THREE.RepeatWrapping;
    stoneTexture.repeat.set(6, 6);

    // 5. Build Subterranean Cavern Environment
    const floorGeo = new THREE.PlaneGeometry(18, 18);
    const floorMat = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Cavern Wall Wireframe Outline
    const caveBoxGeo = new THREE.BoxGeometry(16, 8, 16);
    const caveWireMat = new THREE.MeshBasicMaterial({
      color: 0x9a3412,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const caveWire = new THREE.Mesh(caveBoxGeo, caveWireMat);
    caveWire.position.y = 4;
    scene.add(caveWire);

    // 6. Composite Procedural Model of APPARATUS A (3-12 parts in a THREE.Group)
    const apparatusGroup = new THREE.Group();
    apparatusGroup.position.set(0, 0, 0);
    scene.add(apparatusGroup);

    // Part 1: Heavy Oak Table Bench
    const tableTopGeo = new THREE.BoxGeometry(3.6, 0.15, 2.2);
    const tableMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.7,
      metalness: 0.05,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.y = 1.1;
    tableTop.castShadow = !isSoftwareGl;
    tableTop.receiveShadow = !isSoftwareGl;
    apparatusGroup.add(tableTop);

    // 4 Table Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.1, 12);
    const legPositions = [
      [-1.6, 0.55, -0.9],
      [1.6, 0.55, -0.9],
      [-1.6, 0.55, 0.9],
      [1.6, 0.55, 0.9],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, tableMat);
      leg.position.set(x, y, z);
      leg.castShadow = !isSoftwareGl;
      apparatusGroup.add(leg);
    });

    // Part 2: Cast Iron Galvanometer Base Plate
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.5,
      metalness: 0.85,
    });
    const basePlateGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
    const basePlate = new THREE.Mesh(basePlateGeo, ironMat);
    basePlate.position.set(0, 1.22, 0);
    basePlate.castShadow = !isSoftwareGl;
    apparatusGroup.add(basePlate);

    // Exploded movable sub-group for upper instruments
    const upperInstrumentsGroup = new THREE.Group();
    apparatusGroup.add(upperInstrumentsGroup);

    // Part 3: Brass Acoustic Horn (Trompeta de latón)
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.22,
      metalness: 0.88,
    });
    const hornPoints = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const radius = 0.04 + Math.pow(t, 2.5) * 0.45;
      const h = t * 0.9;
      hornPoints.push(new THREE.Vector2(radius, h));
    }
    const hornGeo = new THREE.LatheGeometry(hornPoints, 24);
    const horn = new THREE.Mesh(hornGeo, brassMat);
    horn.rotation.z = Math.PI / 2;
    horn.position.set(-0.2, 1.8, 0.1);
    horn.castShadow = !isSoftwareGl;
    upperInstrumentsGroup.add(horn);

    // Part 4: Brass Horn Stand & Vertical Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 16);
    const pillar = new THREE.Mesh(pillarGeo, brassMat);
    pillar.position.set(-0.2, 1.5, 0.1);
    upperInstrumentsGroup.add(pillar);

    // Part 5: Glass Dome / Vacuum Tube Enclosure
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.5,
      depthWrite: false,
    });
    const domeGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.65, 24);
    const dome = new THREE.Mesh(domeGeo, glassMat);
    dome.position.set(0.65, 1.6, -0.15);
    upperInstrumentsGroup.add(dome);

    // Part 6: Glowing Vacuum Tubes inside dome
    const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16);
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const tube1 = new THREE.Mesh(tubeGeo, filamentMat);
    tube1.position.set(0.6, 1.5, -0.15);
    const tube2 = new THREE.Mesh(tubeGeo, filamentMat);
    tube2.position.set(0.72, 1.5, -0.15);
    upperInstrumentsGroup.add(tube1);
    upperInstrumentsGroup.add(tube2);

    // Part 7: Calibrated Measurement Scale Rule
    const scaleMat = new THREE.MeshStandardMaterial({
      map: scaleTexture,
      roughness: 0.5,
      metalness: 0.1,
    });
    const scaleGeo = new THREE.BoxGeometry(0.18, 1.1, 0.02);
    const scaleRule = new THREE.Mesh(scaleGeo, scaleMat);
    scaleRule.position.set(0.9, 1.8, 0.25);
    scaleRule.castShadow = !isSoftwareGl;
    upperInstrumentsGroup.add(scaleRule);

    // Part 8: Oscillating Pendulum Bob (Aparato A 35.2 Hz reference)
    const pendulumGroup = new THREE.Group();
    pendulumGroup.position.set(0.9, 2.3, 0.32);
    upperInstrumentsGroup.add(pendulumGroup);

    const wireGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.65, 8);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.9, roughness: 0.1 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.y = -0.325;
    pendulumGroup.add(wire);

    const bobGeo = new THREE.SphereGeometry(0.07, 24, 16);
    const bob = new THREE.Mesh(bobGeo, brassMat);
    bob.position.y = -0.65;
    bob.castShadow = !isSoftwareGl;
    pendulumGroup.add(bob);

    // Contact Shadow below the table
    const shadowGeo = new THREE.PlaneGeometry(4, 2.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.01;
    scene.add(contactShadow);

    // 7. Interactive Orbit & Drag Handlers
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 7.2, theta: 0.8, phi: 1.1 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.006;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.006));
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      spherical.radius = Math.max(2.5, Math.min(12, spherical.radius + e.deltaY * 0.005));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel);

    // 8. Animation & Render Loop with Damped Camera Transitions
    let frameId = 0;
    const clock = new THREE.Clock();
    const targetLookAt = new THREE.Vector3(0, 1.4, 0);
    const currentLookAt = new THREE.Vector3(0, 1.4, 0);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Read mutable state
      const { wireframe, oscillating, exploded, cameraView: targetView } = stateRef.current;

      // Toggle wireframe on materials
      tableMat.wireframe = wireframe;
      ironMat.wireframe = wireframe;
      brassMat.wireframe = wireframe;

      // Harmonic oscillation of the pendulum bob (emulates 35.2 Hz resonance in scaled animation)
      if (oscillating) {
        pendulumGroup.rotation.z = Math.sin(elapsed * 6) * 0.12;
      }

      // Smooth Exploded View animation: lifts upper instruments
      const targetExplodeY = exploded * 0.8;
      upperInstrumentsGroup.position.y = THREE.MathUtils.damp(
        upperInstrumentsGroup.position.y,
        targetExplodeY,
        6,
        delta
      );

      // Camera preset transitions
      let targetRadius = spherical.radius;
      let targetTheta = spherical.theta;
      let targetPhi = spherical.phi;
      let targetCenter = new THREE.Vector3(0, 1.4, 0);

      if (targetView === 'apparatus') {
        targetRadius = 3.8;
        targetCenter.set(0.2, 1.6, 0);
      } else if (targetView === 'axonometric') {
        targetRadius = 8.5;
        targetTheta = Math.PI / 4;
        targetPhi = Math.PI / 3;
      }

      // Smooth camera position damping
      const cx = targetCenter.x + targetRadius * Math.sin(targetPhi) * Math.sin(targetTheta);
      const cy = targetCenter.y + targetRadius * Math.cos(targetPhi);
      const cz = targetCenter.z + targetRadius * Math.sin(targetPhi) * Math.cos(targetTheta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cx, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cy, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cz, 5, delta);

      currentLookAt.lerp(targetCenter, 0.05);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);

      renderer.dispose();
      woodTexture.dispose();
      scaleTexture.dispose();
      stoneTexture.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleCapture = () => {
    const canvas = mountRef.current?.querySelector('canvas');
    if (canvas && onCaptureSnapshot) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onCaptureSnapshot(dataUrl);
    }
  };

  return (
    <div className="relative w-full h-[620px] bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Static Top-Left Epistemic Stamp (No pulsating dots) */}
      <div className="absolute top-4 left-4 bg-neutral-950/90 border border-amber-800/80 px-3 py-1.5 rounded text-xs font-mono text-neutral-300 pointer-events-none flex items-center gap-2 shadow-lg">
        <span className="text-amber-400 font-bold">[3D THREE.JS]</span>
        <span>Aparato A y Bóveda Subterránea</span>
        <span className="text-[10px] text-amber-500/90 bg-amber-950/60 border border-amber-800/50 px-1 rounded">
          DEMO_SYNTHETIC
        </span>
      </div>

      {/* Snapshot Button Top-Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={handleCapture}
          className="px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono uppercase tracking-wider rounded transition-colors shadow-md flex items-center gap-1.5"
          title="Capturar fotograma para Laboratorio Visual"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Capturar Fotograma</span>
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock (<= 15% footprint) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-neutral-950/95 border border-neutral-800 rounded-lg shadow-2xl transition-all">
        {/* Collapse / Expand Tab */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800/80 text-xs text-neutral-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Muelle de Control Espacial PBR</span>
          </div>
          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="flex items-center gap-1 hover:text-neutral-200 transition-colors font-mono text-[11px]"
          >
            <span>{isControlsOpen ? 'Minimizar' : 'Expandir Controles'}</span>
            {isControlsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dock Controls Body */}
        {isControlsOpen && (
          <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            {/* Camera Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase text-neutral-500 block">Vistas de Cámara:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCameraView('general')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    cameraView === 'general'
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setCameraView('apparatus')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    cameraView === 'apparatus'
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Aparato A
                </button>
                <button
                  onClick={() => setCameraView('axonometric')}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    cameraView === 'axonometric'
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Axonometría
                </button>
              </div>
            </div>

            {/* Exploded View Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-neutral-500 uppercase">
                <span>Despiece Explotado:</span>
                <span className="text-amber-400">{Math.round(explodedRatio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedRatio}
                onChange={(e) => setExplodedRatio(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Animation & Wireframe Toggles */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
              <button
                onClick={() => setIsOscillating(!isOscillating)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-[11px] transition-colors ${
                  isOscillating
                    ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
                title="Pausar / Reanudar oscilación armónica de 35.2 Hz"
              >
                {isOscillating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>35.2 Hz</span>
              </button>

              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-[11px] transition-colors ${
                  wireframeMode
                    ? 'bg-amber-950/50 border-amber-700 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
                title="Conmutar malla alámbrica / sombreado PBR"
              >
                <Layers className="w-3 h-3" />
                <span>Malla</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
