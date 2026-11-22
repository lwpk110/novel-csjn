import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  EyeOff,
  Pause,
  Play,
  Route,
} from 'lucide-react';
import {
  CameraPreset,
  CHASING_ROUTE_ARC_IDS,
  MAP_CAMERA_PRESETS,
  WORLD_LANDMARKS_3D,
  WorldLandmark3D,
} from '../data/worldMapData';
import {
  buildLandmarkModel,
  createArchitecturalTileTexture,
  createContactShadowTexture,
  createLandmarkLabelSprite,
  createTerrainPBRMaps,
  getTerrainHeight,
} from './three/worldMapGeometry';
import { MapSectorKey } from '../types/novel';

interface WorldMap3DProps {
  onJumpToArc: (arcId: string) => void;
}

// Pre-allocated module-scope math helpers (Zero GC in the animation loop)
const _travelPos = new THREE.Vector3();
const _chaserPos = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _rayMouse = new THREE.Vector2();

function buildPolarTerrainGeometry(radius: number, radialSegs: number, angularSegs: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let rIdx = 0; rIdx <= radialSegs; rIdx++) {
    const t = rIdx / radialSegs;
    const r = t * radius;
    for (let aIdx = 0; aIdx <= angularSegs; aIdx++) {
      const theta = (aIdx / angularSegs) * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = getTerrainHeight(x, z);
      positions.push(x, y, z);
      uvs.push(x / (radius * 2) + 0.5, 1 - (z / (radius * 2) + 0.5));
    }
  }

  const stride = angularSegs + 1;
  for (let rIdx = 0; rIdx < radialSegs; rIdx++) {
    for (let aIdx = 0; aIdx < angularSegs; aIdx++) {
      const a = rIdx * stride + aIdx;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createSoftCloudRingTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const rad = 120 + ((i * 29) % 75);
    const x = size / 2 + Math.cos(angle) * rad;
    const y = size / 2 + Math.sin(angle) * rad;
    const r = 36 + (i % 5) * 14;
    const g = ctx.createRadialGradient(x, y, 4, x, y, r);
    g.addColorStop(0, 'rgba(241, 245, 249, 0.22)');
    g.addColorStop(0.6, 'rgba(226, 232, 240, 0.08)');
    g.addColorStop(1, 'rgba(226, 232, 240, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const WorldMap3D: React.FC<WorldMap3DProps> = ({ onJumpToArc }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [selectedArcId, setSelectedArcId] = useState<string>('arc-convergence');
  const [hoveredArcId, setHoveredArcId] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<MapSectorKey | 'all'>('all');
  const [activePresetId, setActivePresetId] = useState<string>('overview');
  const [showPath, setShowPath] = useState<boolean>(true);
  const [showChasingPath, setShowChasingPath] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [autoOrbit, setAutoOrbit] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  const selectedLandmark = useMemo(
    () =>
      WORLD_LANDMARKS_3D.find((l) => l.arcId === selectedArcId) ||
      WORLD_LANDMARKS_3D[WORLD_LANDMARKS_3D.length - 1],
    [selectedArcId]
  );

  const hoveredLandmark = useMemo(
    () => (hoveredArcId ? WORLD_LANDMARKS_3D.find((l) => l.arcId === hoveredArcId) || null : null),
    [hoveredArcId]
  );

  // Refs for syncing React HUD toggles into the live Three.js loop without remounting
  const showPathRef = useRef(showPath);
  const showChasingPathRef = useRef(showChasingPath);
  const showLabelsRef = useRef(showLabels);
  const autoOrbitRef = useRef(autoOrbit);
  const sectorFilterRef = useRef(sectorFilter);
  const selectedArcIdRef = useRef(selectedArcId);
  const hoveredArcIdRef = useRef(hoveredArcId);

  const cameraGoalRef = useRef<{
    active: boolean;
    camPos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    camPos: new THREE.Vector3(0, 26, 36),
    target: new THREE.Vector3(0, 1.2, 0),
  });

  const refreshVisualStateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    showPathRef.current = showPath;
    showChasingPathRef.current = showChasingPath;
    showLabelsRef.current = showLabels;
    autoOrbitRef.current = autoOrbit;
    sectorFilterRef.current = sectorFilter;
    selectedArcIdRef.current = selectedArcId;
    hoveredArcIdRef.current = hoveredArcId;
    refreshVisualStateRef.current?.();
  }, [showPath, showChasingPath, showLabels, autoOrbit, sectorFilter, selectedArcId, hoveredArcId]);

  // Keyboard shortcut 'H' to toggle Cinema / Zen HUD dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const flyToLandmark = (lm: WorldLandmark3D) => {
    setSelectedArcId(lm.arcId);
    const baseY = lm.stratum === 'surface' ? getTerrainHeight(lm.position[0], lm.position[2]) : lm.position[1];
    const targetY = baseY + 1.05;
    const offsetX = lm.position[0] > 8 ? -7.2 : lm.position[0] < -8 ? 7.2 : 5.4;
    const offsetZ = lm.position[2] > 9 ? 9.2 : 11.0;

    cameraGoalRef.current.target.set(lm.position[0], targetY, lm.position[2]);
    cameraGoalRef.current.camPos.set(
      lm.position[0] + offsetX,
      Math.max(4.5, targetY + 6.4),
      lm.position[2] + offsetZ
    );
    cameraGoalRef.current.active = true;
  };

  const applyCameraPreset = (preset: CameraPreset) => {
    setActivePresetId(preset.id);
    setSectorFilter(preset.sectorFilter);
    cameraGoalRef.current.camPos.set(...preset.cameraPos);
    cameraGoalRef.current.target.set(...preset.target);
    cameraGoalRef.current.active = true;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection per Three.js specification
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 660;

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Scene, Camera, Fog & Studio RoomEnvironment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0E14');
    scene.fog = new THREE.FogExp2('#0D1119', 0.0095);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.3, 240);
    camera.position.set(0, 26, 36);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.78;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 7;
    controls.maxDistance = 62;
    controls.maxPolarAngle = Math.PI / 2.04;
    controls.autoRotateSpeed = 0.5;
    controls.update();

    const cancelCameraGoal = () => {
      cameraGoalRef.current.active = false;
    };
    controls.addEventListener('start', cancelCameraGoal);

    // Optional hardware-GPU selective UnrealBloom post-processing
    let composer: EffectComposer | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.setSize(width, height);
      composer.addPass(new RenderPass(scene, camera));
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.34,
        0.45,
        0.86
      );
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    }

    const disposables: { dispose: () => void }[] = [envTarget];
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // 3.5 Atmospheric Celestial Gradient Sky Dome
    const skyGeo = new THREE.SphereGeometry(110, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uZenith: { value: new THREE.Color('#080C14') },
        uHorizon: { value: new THREE.Color('#1D2432') },
        uWarmGlow: { value: new THREE.Color('#3B2618') },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        uniform vec3 uZenith;
        uniform vec3 uHorizon;
        uniform vec3 uWarmGlow;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 col = mix(uHorizon, uZenith, pow(h, 1.15));
          float azimuth = clamp(dir.x * 0.5 + 0.5, 0.0, 1.0) * (1.0 - abs(dir.y));
          col = mix(col, uWarmGlow, azimuth * 0.28);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);
    disposables.push(skyGeo, skyMat);

    // 4. Studio + Atmospheric Sector Lighting
    const hemiLight = new THREE.HemisphereLight('#C6DCF7', '#26201A', 0.72);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF3D6', 1.95);
    keyLight.position.set(18, 28, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 4;
    keyLight.shadow.camera.far = 75;
    keyLight.shadow.camera.left = -25;
    keyLight.shadow.camera.right = 25;
    keyLight.shadow.camera.top = 25;
    keyLight.shadow.camera.bottom = -25;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#C81E1E', 0.52);
    rimLight.position.set(-22, 14, -22);
    scene.add(rimLight);

    const polarDayLight = new THREE.PointLight('#FDE047', 1.5, 28);
    polarDayLight.position.set(10, 9.5, -7);
    scene.add(polarDayLight);

    const polarNightLight = new THREE.PointLight('#7C3AED', 1.75, 26);
    polarNightLight.position.set(8, -1.2, 7.5);
    scene.add(polarNightLight);

    // 5. High-Res Sculpted Polar Diorama Terrain + PBR Maps + Water Plane
    const terrainGeo = buildPolarTerrainGeometry(22, 72, 128);
    const { map: terrainMap, bumpMap: terrainBump, roughnessMap: terrainRough } =
      createTerrainPBRMaps(maxAniso);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainMap,
      bumpMap: terrainBump,
      bumpScale: 0.14,
      roughnessMap: terrainRough,
      roughness: 0.88,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    disposables.push(terrainGeo, terrainMap, terrainBump, terrainRough, terrainMat);

    // Abyssal Sea & Dark River Water Layer tucked in Southeast Basin
    const waterGeo = new THREE.CircleGeometry(21.7, 64);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: '#0D2B3E',
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: 0.78,
    });
    const waterDisc = new THREE.Mesh(waterGeo, waterMat);
    waterDisc.rotation.x = -Math.PI / 2;
    waterDisc.position.y = -0.34;
    waterDisc.receiveShadow = true;
    scene.add(waterDisc);
    disposables.push(waterGeo, waterMat);

    // 5.5 Triple-Ring Mechanical Bronze Astrolabe Table Frame (浑天仪三重铜环)
    const tableSkirtGeo = new THREE.CylinderGeometry(22.15, 22.8, 1.35, 96, 1, true);
    const tableSkirtMat = new THREE.MeshStandardMaterial({
      color: '#1A1817',
      roughness: 0.6,
      metalness: 0.55,
      side: THREE.DoubleSide,
    });
    const tableSkirt = new THREE.Mesh(tableSkirtGeo, tableSkirtMat);
    tableSkirt.position.y = -0.98;
    scene.add(tableSkirt);

    const bronzeRingMat = new THREE.MeshStandardMaterial({
      color: '#B89242',
      roughness: 0.24,
      metalness: 0.9,
    });
    const darkBronzeMat = new THREE.MeshStandardMaterial({
      color: '#5C4422',
      roughness: 0.36,
      metalness: 0.85,
    });

    const bezelGeo = new THREE.TorusGeometry(22.18, 0.26, 14, 128);
    const bezelRing = new THREE.Mesh(bezelGeo, bronzeRingMat);
    bezelRing.rotation.x = Math.PI / 2;
    bezelRing.position.y = -0.34;
    scene.add(bezelRing);

    const outerAstrolabeGeo = new THREE.TorusGeometry(23.5, 0.14, 12, 128);
    const outerAstrolabe = new THREE.Mesh(outerAstrolabeGeo, darkBronzeMat);
    outerAstrolabe.rotation.x = Math.PI / 2;
    outerAstrolabe.position.y = -0.38;
    scene.add(outerAstrolabe);

    const gimbalGeo = new THREE.TorusGeometry(24.6, 0.08, 10, 128);
    const gimbalRing = new THREE.Mesh(gimbalGeo, bronzeRingMat);
    gimbalRing.rotation.set(Math.PI / 2.22, 0.14, 0);
    gimbalRing.position.y = -0.2;
    scene.add(gimbalRing);

    // 4 Cardinal Compass Finials on the Astrolabe Rim
    const finialGeo = new THREE.OctahedronGeometry(0.42, 0);
    [
      [23.5, 0],
      [-23.5, 0],
      [0, 23.5],
      [0, -23.5],
    ].forEach(([fx, fz], idx) => {
      const f = new THREE.Mesh(
        finialGeo,
        idx === 2
          ? new THREE.MeshStandardMaterial({
              color: '#C81E1E',
              roughness: 0.25,
              metalness: 0.6,
              emissive: '#991B1B',
              emissiveIntensity: 0.45,
            })
          : bronzeRingMat
      );
      f.position.set(fx, -0.34, fz);
      f.scale.set(1, 1.5, 1);
      scene.add(f);
    });

    // Dark Void Floor Ring below Table
    const horizonGeo = new THREE.RingGeometry(24.2, 105, 64);
    const horizonMat = new THREE.MeshStandardMaterial({
      color: '#0A0D14',
      roughness: 0.94,
      metalness: 0.08,
    });
    const horizonRing = new THREE.Mesh(horizonGeo, horizonMat);
    horizonRing.rotation.x = -Math.PI / 2;
    horizonRing.position.y = -1.78;
    scene.add(horizonRing);
    disposables.push(
      tableSkirtGeo,
      tableSkirtMat,
      bronzeRingMat,
      darkBronzeMat,
      bezelGeo,
      outerAstrolabeGeo,
      gimbalGeo,
      finialGeo,
      horizonGeo,
      horizonMat
    );

    // 6. Subterranean Nine-Nether Chamber + Celestial Orbit & Cloud Strata
    const netherDiskGeo = new THREE.CylinderGeometry(4.4, 3.6, 0.55, 24);
    const netherDiskMat = new THREE.MeshStandardMaterial({
      color: '#19162B',
      roughness: 0.65,
      metalness: 0.3,
    });
    const netherPlatform = new THREE.Mesh(netherDiskGeo, netherDiskMat);
    netherPlatform.position.set(6.8, -4.9, 5.5);
    scene.add(netherPlatform);

    const netherRimGeo = new THREE.TorusGeometry(4.3, 0.08, 8, 32);
    const netherRim = new THREE.Mesh(netherRimGeo, bronzeRingMat);
    netherRim.rotation.x = Math.PI / 2;
    netherRim.position.set(6.8, -4.65, 5.5);
    scene.add(netherRim);

    const tetherPoints = [
      new THREE.Vector3(6.8, getTerrainHeight(6.8, 5.5), 5.5),
      new THREE.Vector3(6.8, -4.6, 5.5),
    ];
    const tetherGeo = new THREE.BufferGeometry().setFromPoints(tetherPoints);
    const tetherMat = new THREE.LineBasicMaterial({
      color: '#EF4444',
      transparent: true,
      opacity: 0.78,
    });
    const netherTether = new THREE.Line(tetherGeo, tetherMat);
    scene.add(netherTether);

    // Celestial Floating Ring + Soft Drifting Cloud Ring under Heaven/Skywhale
    const skyRingGeo = new THREE.TorusGeometry(5.8, 0.09, 10, 64);
    const skyRingMat = new THREE.MeshStandardMaterial({
      color: '#D4AF37',
      roughness: 0.22,
      metalness: 0.9,
      emissive: '#F59E0B',
      emissiveIntensity: 0.32,
    });
    const celestialRing = new THREE.Mesh(skyRingGeo, skyRingMat);
    celestialRing.rotation.x = Math.PI / 2.15;
    celestialRing.position.set(6.8, 5.1, -9.2);
    scene.add(celestialRing);

    const cloudTex = createSoftCloudRingTexture();
    const cloudGeo = new THREE.PlaneGeometry(16, 16);
    const cloudMat = new THREE.MeshBasicMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cloudStrata = new THREE.Mesh(cloudGeo, cloudMat);
    cloudStrata.rotation.x = -Math.PI / 2;
    cloudStrata.position.set(6.8, 3.65, -9.2);
    scene.add(cloudStrata);

    disposables.push(
      netherDiskGeo,
      netherDiskMat,
      netherRimGeo,
      tetherGeo,
      tetherMat,
      skyRingGeo,
      skyRingMat,
      cloudTex,
      cloudGeo,
      cloudMat
    );

    // 7. Instanced Sculpted Pine/Peach Trees & Crystal Rock Spires
    const treeCount = 54;
    const treeGeo = new THREE.ConeGeometry(0.24, 0.85, 7);
    treeGeo.translate(0, 0.425, 0);
    const treeMat = new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0.04 });
    const treeInstances = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
    treeInstances.castShadow = !isSoftwareGl;
    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();

    for (let i = 0; i < treeCount; i++) {
      const angle = Math.PI * 0.58 + (i / treeCount) * Math.PI * 0.88;
      const rad = 5.2 + ((i * 37) % 14);
      const tx = Math.cos(angle) * rad;
      const tz = Math.sin(angle) * rad;
      const ty = getTerrainHeight(tx, tz);
      const sc = 0.72 + ((i * 19) % 10) * 0.045;
      dummy.position.set(tx, ty - 0.05, tz);
      dummy.rotation.y = (i * 1.1) % (Math.PI * 2);
      dummy.scale.set(sc, sc * (0.9 + (i % 3) * 0.16), sc);
      dummy.updateMatrix();
      treeInstances.setMatrixAt(i, dummy.matrix);
      tmpColor.set(i % 6 === 0 ? '#E11D48' : i % 2 === 0 ? '#2F523B' : '#43684A');
      treeInstances.setColorAt(i, tmpColor);
    }
    treeInstances.instanceMatrix.needsUpdate = true;
    if (treeInstances.instanceColor) treeInstances.instanceColor.needsUpdate = true;
    treeInstances.computeBoundingSphere();
    scene.add(treeInstances);
    disposables.push(treeGeo, treeMat);

    const spireCount = 38;
    const spireGeo = new THREE.ConeGeometry(0.28, 1.32, 5);
    spireGeo.translate(0, 0.62, 0);
    const spireMat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.48 });
    const spireInstances = new THREE.InstancedMesh(spireGeo, spireMat, spireCount);
    for (let i = 0; i < spireCount; i++) {
      const isDay = i % 2 === 0;
      const baseAngle = isDay ? -Math.PI * 0.44 : Math.PI * 0.06;
      const angle = baseAngle + ((i * 23) % 10) * 0.13;
      const rad = 7.4 + ((i * 29) % 12);
      const sx = Math.cos(angle) * rad;
      const sz = Math.sin(angle) * rad;
      const sy = getTerrainHeight(sx, sz);
      const sc = 0.62 + ((i * 13) % 8) * 0.075;
      dummy.position.set(sx, sy - 0.08, sz);
      dummy.rotation.set((i % 3 - 1) * 0.08, i * 0.7, (i % 2 - 0.5) * 0.08);
      dummy.scale.set(sc, sc * 1.2, sc);
      dummy.updateMatrix();
      spireInstances.setMatrixAt(i, dummy.matrix);
      tmpColor.set(isDay ? '#D4A742' : '#2E3A4D');
      spireInstances.setColorAt(i, tmpColor);
    }
    spireInstances.instanceMatrix.needsUpdate = true;
    if (spireInstances.instanceColor) spireInstances.instanceColor.needsUpdate = true;
    spireInstances.computeBoundingSphere();
    scene.add(spireInstances);
    disposables.push(spireGeo, spireMat);

    // 8. Ambient Celestial Star / Spirit Mote Field
    const starCount = 160;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const a = (i / starCount) * Math.PI * 2 + (i % 7) * 0.35;
      const r = 12 + (i % 30);
      starPos[i * 3] = Math.cos(a) * r;
      starPos[i * 3 + 1] = 1.8 + (i % 18) * 0.95;
      starPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#F8FAFC',
      size: 0.15,
      transparent: true,
      opacity: 0.58,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    disposables.push(starGeo, starMat);

    // 9. Build All 15 High-Detail Architectural Landmarks & Raycast Hit Targets
    const contactShadowTex = createContactShadowTexture();
    const tileBumpTex = createArchitecturalTileTexture();
    disposables.push(contactShadowTex, tileBumpTex);

    const hitMeshes: THREE.Mesh[] = [];
    const landmarkEntries: {
      data: WorldLandmark3D;
      group: THREE.Group;
      sprite: THREE.Sprite;
      ringMesh: THREE.Mesh;
      hoverRingMesh: THREE.Mesh;
      worldPos: THREE.Vector3;
    }[] = [];

    const ringGeo = new THREE.RingGeometry(1.52, 1.72, 36);
    const ringMatBase = new THREE.MeshBasicMaterial({
      color: '#C81E1E',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const hoverRingGeo = new THREE.RingGeometry(1.76, 1.88, 36);
    const hoverRingMatBase = new THREE.MeshBasicMaterial({
      color: '#FDE047',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
    });
    disposables.push(ringGeo, ringMatBase, hoverRingGeo, hoverRingMatBase);

    WORLD_LANDMARKS_3D.forEach((lm) => {
      const groundY =
        lm.stratum === 'surface' ? getTerrainHeight(lm.position[0], lm.position[2]) : lm.position[1];
      const { group, hitMesh, labelAnchorY } = buildLandmarkModel(lm, contactShadowTex, tileBumpTex);
      group.position.set(lm.position[0], groundY, lm.position[2]);
      scene.add(group);
      hitMeshes.push(hitMesh);

      const ringMesh = new THREE.Mesh(ringGeo, ringMatBase.clone());
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.06;
      ringMesh.visible = lm.arcId === selectedArcIdRef.current;
      group.add(ringMesh);

      const hoverRingMesh = new THREE.Mesh(hoverRingGeo, hoverRingMatBase.clone());
      hoverRingMesh.rotation.x = -Math.PI / 2;
      hoverRingMesh.position.y = 0.05;
      hoverRingMesh.visible = false;
      group.add(hoverRingMesh);

      const sprite = createLandmarkLabelSprite(
        lm.indexLabel,
        lm.name,
        lm.accentHex,
        lm.arcId === selectedArcIdRef.current
      );
      sprite.position.set(0, labelAnchorY, 0);
      group.add(sprite);

      landmarkEntries.push({
        data: lm,
        group,
        sprite,
        ringMesh,
        hoverRingMesh,
        worldPos: new THREE.Vector3(lm.position[0], groundY + 0.68, lm.position[2]),
      });
    });

    // 10. Chronological Protagonist Trajectory ("红尘缩地步跨世路线") + Armillary Beacon
    const pathCurve = new THREE.CatmullRomCurve3(
      landmarkEntries.map((entry) => entry.worldPos.clone()),
      false,
      'catmullrom',
      0.35
    );
    const pathGeo = new THREE.TubeGeometry(pathCurve, 240, 0.068, 8, false);
    const pathMat = new THREE.MeshStandardMaterial({
      color: '#C81E1E',
      roughness: 0.28,
      metalness: 0.45,
      emissive: '#DC2626',
      emissiveIntensity: 0.72,
      transparent: true,
      opacity: 0.86,
    });
    const pathTube = new THREE.Mesh(pathGeo, pathMat);
    scene.add(pathTube);

    const travelerGroup = new THREE.Group();
    const travelerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#FEF08A',
        emissive: '#F59E0B',
        emissiveIntensity: 1.9,
        roughness: 0.1,
      })
    );
    const travelerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.032, 8, 24),
      new THREE.MeshStandardMaterial({
        color: '#FCA5A5',
        emissive: '#DC2626',
        emissiveIntensity: 1.2,
      })
    );
    travelerGroup.add(travelerCore, travelerRing);
    scene.add(travelerGroup);

    // 10.5 Heroine Cross-Era Chasing-Husband Pursuit Route (第二卷 萧惊鸿起追 -> 十四世合围)
    const chasingPoints = CHASING_ROUTE_ARC_IDS.map((id) => {
      const found = landmarkEntries.find((e) => e.data.arcId === id);
      return found ? found.worldPos.clone().add(new THREE.Vector3(0.35, 0.42, 0.35)) : new THREE.Vector3();
    });
    const chasingCurve = new THREE.CatmullRomCurve3(chasingPoints, false, 'catmullrom', 0.35);
    const chasingGeo = new THREE.TubeGeometry(chasingCurve, 180, 0.06, 8, false);
    const chasingMat = new THREE.MeshStandardMaterial({
      color: '#A855F7',
      roughness: 0.25,
      metalness: 0.52,
      emissive: '#9333EA',
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.9,
    });
    const chasingTube = new THREE.Mesh(chasingGeo, chasingMat);
    scene.add(chasingTube);

    // Jade-Phoenix Seal Beacon (青玉凰印追影梭)
    const chaserGroup = new THREE.Group();
    const chaserCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({
        color: '#F3E8FF',
        emissive: '#A855F7',
        emissiveIntensity: 2.1,
        roughness: 0.12,
      })
    );
    const chaserRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.028, 8, 24),
      new THREE.MeshStandardMaterial({
        color: '#6EE7B7',
        emissive: '#10B981',
        emissiveIntensity: 1.1,
      })
    );
    chaserRing.rotation.x = Math.PI / 3;
    chaserGroup.add(chaserCore, chaserRing);
    scene.add(chaserGroup);

    disposables.push(pathGeo, pathMat, chasingGeo, chasingMat);

    // Sync filter / label / selection / hover state back into Three.js objects
    const refreshVisualState = () => {
      pathTube.visible = showPathRef.current;
      travelerGroup.visible = showPathRef.current;
      chasingTube.visible = showChasingPathRef.current;
      chaserGroup.visible = showChasingPathRef.current;
      controls.autoRotate = autoOrbitRef.current;

      landmarkEntries.forEach((entry) => {
        const matchesSector =
          sectorFilterRef.current === 'all' || entry.data.mapSector === sectorFilterRef.current;
        const isSel = entry.data.arcId === selectedArcIdRef.current;
        const isHov = entry.data.arcId === hoveredArcIdRef.current;

        entry.ringMesh.visible = isSel;
        entry.hoverRingMesh.visible = isHov && !isSel;
        entry.sprite.visible = showLabelsRef.current && (matchesSector || isSel || isHov);
        entry.sprite.scale.set(
          isSel ? 3.5 : isHov ? 3.35 : 3.0,
          isSel ? 0.88 : isHov ? 0.84 : 0.75,
          1
        );

        entry.group.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            (child.material instanceof THREE.MeshStandardMaterial ||
              child.material instanceof THREE.MeshPhysicalMaterial)
          ) {
            child.material.transparent = !matchesSector && !isSel;
            child.material.opacity = matchesSector || isSel ? 1.0 : 0.25;
          }
        });
      });
    };
    refreshVisualStateRef.current = refreshVisualState;
    refreshVisualState();

    // 11. Raycasting (Click to select & fly camera; throttled hover highlight)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;

    const updateMouseNDC = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _rayMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _rayMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moved > 6) return;
      updateMouseNDC(e);
      raycaster.setFromCamera(_rayMouse, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        const hitArcId = hits[0].object.userData.arcId as string | undefined;
        const found = WORLD_LANDMARKS_3D.find((l) => l.arcId === hitArcId);
        if (found) {
          flyToLandmark(found);
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 55) return;
      lastHoverTime = now;
      updateMouseNDC(e);
      raycaster.setFromCamera(_rayMouse, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      const hitId = hits.length > 0 ? ((hits[0].object.userData.arcId as string) || null) : null;
      renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
      if (hitId !== hoveredArcIdRef.current) {
        setHoveredArcId(hitId);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // 12. Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1000;
      const h = container.clientHeight || 660;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer?.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 13. Continuous Render Loop with Software-WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Mechanical astrolabe & sky cloud drift
      celestialRing.rotation.z = elapsed * 0.09;
      cloudStrata.rotation.z = -elapsed * 0.035;
      gimbalRing.rotation.z = elapsed * 0.025;
      stars.rotation.y = elapsed * 0.008;

      landmarkEntries.forEach((entry, idx) => {
        if (entry.data.stratum === 'sky') {
          entry.group.position.y = entry.data.position[1] + Math.sin(elapsed * 1.4 + idx) * 0.15;
        }
        if (entry.ringMesh.visible) {
          entry.ringMesh.rotation.z = elapsed * 0.6;
        }
      });

      if (showPathRef.current) {
        const t = (elapsed * 0.05) % 1;
        pathCurve.getPointAt(t, _travelPos);
        travelerGroup.position.copy(_travelPos);
        travelerRing.rotation.x = elapsed * 1.6;
        travelerRing.rotation.y = elapsed * 1.1;
      }

      if (showChasingPathRef.current) {
        const ct = (elapsed * 0.072) % 1;
        chasingCurve.getPointAt(ct, _chaserPos);
        chaserGroup.position.copy(_chaserPos);
        chaserCore.rotation.y = elapsed * 2.4;
        chaserRing.rotation.z = -elapsed * 1.8;
      }

      if (cameraGoalRef.current.active) {
        _desiredCamPos.copy(cameraGoalRef.current.camPos);
        _desiredTarget.copy(cameraGoalRef.current.target);

        const lambda = 4.6;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, lambda, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, lambda, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, lambda, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, lambda, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, lambda, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, lambda, delta);

        if (
          camera.position.distanceTo(_desiredCamPos) < 0.08 &&
          controls.target.distanceTo(_desiredTarget) < 0.08
        ) {
          cameraGoalRef.current.active = false;
        }
      }

      controls.update();
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', cancelCameraGoal);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      controls.dispose();
      composer?.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        } else if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="pb-14 space-y-5">
      {/* Unobstructed 3D Cartographic Stage */}
      <div className="relative w-full h-[640px] sm:h-[720px] rounded-xl overflow-hidden border border-[#27272A] bg-[#0B0E14]">
        {/* Isolated Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Minimal Top-Left Spec Badge (No backdrop-blur over WebGL) */}
        <div className="absolute top-4 left-4 pointer-events-none max-w-[360px] bg-[#141413]/92 border border-[#27272A] rounded-lg px-4 py-3 text-white">
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#FCA5A5]">
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>浑天四界三维沙盘 · 精雕舆图版</span>
          </div>
          <div className="font-editorial text-base font-semibold mt-1">
            红尘十四世 · 极昼极夜与天地双层星盘
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">
            {hoveredLandmark
              ? `悬停定位：${hoveredLandmark.indexLabel} · ${hoveredLandmark.name}（点击聚焦）`
              : '拖拽旋转 · 滚轮缩放 · 点击地标微缩建筑聚焦（快捷键 H 收放面板）'}
          </div>
        </div>

        {/* Collapsible Bottom Control Dock (Zero Mid-Screen Occlusion) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(960px,calc(100%-24px))] flex flex-col items-center pointer-events-none">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#E4E4E7] bg-[#141413] border border-[#3F3F46] border-b-0 rounded-t-lg hover:text-white transition-colors cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>展开地图控制栏（当前：{selectedLandmark.name}）</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>收起面板（沉浸赏景）</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <div className="pointer-events-auto w-full bg-[#141413]/96 border border-[#3F3F46] rounded-xl p-4 sm:p-5 text-white space-y-4">
              {/* Top Row: Camera & Sector Presets + Scene Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {MAP_CAMERA_PRESETS.map((preset) => {
                    const isActive = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyCameraPreset(preset)}
                        className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#C81E1E] border-[#C81E1E] text-white'
                            : 'bg-[#18181B] border-[#3F3F46] text-[#D4D4D8] hover:text-white hover:border-[#71717A]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPath((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      showPath
                        ? 'bg-[#27272A] border-[#C81E1E] text-[#FCA5A5]'
                        : 'bg-[#18181B] border-[#3F3F46] text-[#A1A1AA]'
                    }`}
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>缩地轨迹</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChasingPath((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      showChasingPath
                        ? 'bg-[#27272A] border-[#A855F7] text-[#E9D5FF]'
                        : 'bg-[#18181B] border-[#3F3F46] text-[#A1A1AA]'
                    }`}
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>追夫追踪线（第二卷起）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabels((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      showLabels
                        ? 'bg-[#27272A] border-[#71717A] text-white'
                        : 'bg-[#18181B] border-[#3F3F46] text-[#A1A1AA]'
                    }`}
                  >
                    {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>地标铭牌</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoOrbit((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      autoOrbit
                        ? 'bg-[#27272A] border-[#D4AF37] text-[#FDE047]'
                        : 'bg-[#18181B] border-[#3F3F46] text-[#A1A1AA]'
                    }`}
                  >
                    {autoOrbit ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>自动巡航</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Quick Landmark Selector Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {WORLD_LANDMARKS_3D.map((lm) => {
                  const isSel = lm.arcId === selectedLandmark.arcId;
                  return (
                    <button
                      key={lm.arcId}
                      type="button"
                      onClick={() => flyToLandmark(lm)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isSel
                          ? 'bg-white text-[#141413] border-white'
                          : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#52525B]'
                      }`}
                    >
                      {lm.indexLabel} · {lm.name}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Row: Selected Landmark Concise Readout + Jump Action */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                <div className="md:col-span-9 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-2 text-xs">
                    <span className="font-semibold text-[#FCA5A5]">
                      {selectedLandmark.indexLabel} · {selectedLandmark.name}
                    </span>
                    <span className="text-[#71717A]">/</span>
                    <span className="text-[#D4D4D8]">{selectedLandmark.sectorLabel}</span>
                    <span className="text-[#71717A]">/</span>
                    <span className="text-[#A1A1AA]">{selectedLandmark.stratumLabel}</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    {selectedLandmark.title} — {selectedLandmark.landmarkSummary}
                  </div>
                  <div className="text-xs text-[#A1A1AA] flex flex-col sm:flex-row sm:gap-5">
                    <span>光影规则：{selectedLandmark.illuminationNote}</span>
                    <span>身法跑图：{selectedLandmark.mobilityNote}</span>
                  </div>
                </div>

                <div className="md:col-span-3 flex md:justify-end">
                  <button
                    type="button"
                    onClick={() => onJumpToArc(selectedLandmark.arcId)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#C81E1E] hover:bg-[#B91C1C] text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>进入本卷大纲</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Grounded Spatial Legend Below Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-1">
          <div className="text-xs font-medium text-[#8B5E3C]">西部 · 常昼常夜板块</div>
          <div className="text-sm font-semibold text-[#141413]">青溪 · 大景 · 北疆 · 万花 · 旧港</div>
          <p className="text-xs text-[#52525B] leading-relaxed">
            贴合写实丘陵地貌，刻意收紧空间尺度，萧惊鸿自第二卷末启程跨十三世追踪男主。
          </p>
        </div>
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-1">
          <div className="text-xs font-medium text-[#CA8A04]">东北与上穹 · 极昼与天界</div>
          <div className="text-sm font-semibold text-[#141413]">镜面沙海 · 云鲸浮空 · 陨星旧档库</div>
          <p className="text-xs text-[#52525B] leading-relaxed">
            云海浮环托举飞檐星阁与黄铜云鲸，恒久炽光之下任何残影与笔迹都会放大暴露。
          </p>
        </div>
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-1">
          <div className="text-xs font-medium text-[#6D28D9]">东南与地脉 · 极夜与九幽</div>
          <div className="text-sm font-semibold text-[#141413]">雾巷 · 亚特兰蒂斯 · 鬼市 · 九幽 · 方舟</div>
          <p className="text-xs text-[#52525B] leading-relaxed">
            深渊海湾与黑河水面下沉至九幽核销大殿，红色业火柱直通崔明月合籍与追夫弧线。
          </p>
        </div>
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-4 space-y-1">
          <div className="text-xs font-medium text-[#C81E1E]">中轴天枢 · 晨昏狭缝带</div>
          <div className="text-sm font-semibold text-[#141413]">晨昏界走廊 ↔ 落花崖青石孤棺</div>
          <p className="text-xs text-[#52525B] leading-relaxed">
            全境仅三十里宽的昼夜分界岭，收束十四世「红尘缩地步」与跨世追夫终极轨迹于一棺。
          </p>
        </div>
      </div>
    </div>
  );
};
