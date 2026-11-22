import * as THREE from 'three';
import { LandmarkModelType, WorldLandmark3D } from '../../data/worldMapData';

/**
 * Analytical terrain relief across the 4 compact cartographic sectors.
 * Keeps every landmark, river basin, and instanced prop flush on the ground with zero floating.
 */
export function getTerrainHeight(x: number, z: number): number {
  const dist = Math.hypot(x, z);
  if (dist > 22) return -1.8;

  // Multi-octave organic relief
  const wave =
    Math.sin(x * 0.24) * Math.cos(z * 0.21) * 0.36 +
    Math.sin((x + z) * 0.14) * 0.24 +
    Math.cos(x * 0.55 - z * 0.42) * 0.08;

  // Central Twilight Band ridge & Falling-Blossom Cliff peak around (0, -1.2)
  const twilightBandFactor = Math.exp(-(x * x) / 7.5);
  const cliffPeak = Math.exp(-(x * x + (z + 1.2) * (z + 1.2)) / 8.5) * 1.95;

  // Western Normal Sector rolling green/warm foothills
  const normalHills = x < -3.2 ? Math.min(1.0, (-3.2 - x) * 0.12) * 0.65 : 0;

  // Northeast Polar Day stepped golden plateau
  const polarDayRaw =
    x > 2.5 && z < 1.5 ? Math.min(1.0, (x - 2.5) * 0.14) * 0.92 : 0;
  const polarDayTerrace = Math.round(polarDayRaw * 5) / 5; // subtle terraced plateau

  // Southeast Polar Night sunken abyssal basin + sea bay for Atlantis & Lantern Market
  const polarNightBasin =
    x > 1.8 && z > 1.5 ? -Math.min(1.0, (x - 1.8) * 0.14) * 1.15 : 0;

  // Subtle carved river/sea channel flowing near Qingxi (-14.2, 5.2) and down to SE abyss
  const atlantisBay =
    Math.exp(-((x - 12.2) ** 2 + (z - 10.6) ** 2) / 16.0) * -0.75;

  // Taper toward outer circular astrolabe rim
  const edgeTaper = dist > 18.4 ? -((dist - 18.4) / 3.6) * 1.25 : 0;

  return (
    0.26 +
    wave +
    twilightBandFactor * 0.44 +
    cliffPeak +
    normalHills +
    polarDayTerrace +
    polarNightBasin +
    atlantisBay +
    edgeTaper
  );
}

export interface TerrainPBRMaps {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

/**
 * Generates paired 2048x2048 Cartographic Albedo + Topographic Height/Bump + Roughness maps
 * so the terrain reads like an antique carved jade-and-bronze celestial sand table rather than a flat painted disc.
 */
export function createTerrainPBRMaps(maxAnisotropy: number): TerrainPBRMaps {
  const size = 2048;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 22;

  // 1. Albedo Canvas
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const ctx = albedoCanvas.getContext('2d')!;

  // Base parchment / mineral slate
  ctx.fillStyle = '#E6DFCE';
  ctx.fillRect(0, 0, size, size);

  // Left Half: Normal Sector (常昼常夜 · 江南青绿与关山土黄)
  const leftGrad = ctx.createRadialGradient(cx * 0.55, cy, 40, cx * 0.55, cy, size * 0.55);
  leftGrad.addColorStop(0, '#EBE3D0');
  leftGrad.addColorStop(0.55, '#DDD4BE');
  leftGrad.addColorStop(1, '#C9BEA4');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, cx, size);

  // Top-Right: Polar Day (极昼炽域 · 金砂与琉璃矿脉)
  const dayGrad = ctx.createRadialGradient(cx * 1.45, cy * 0.52, 40, cx * 1.45, cy * 0.52, size * 0.52);
  dayGrad.addColorStop(0, '#F7EAC4');
  dayGrad.addColorStop(0.6, '#E8D39A');
  dayGrad.addColorStop(1, '#CCA85E');
  ctx.fillStyle = dayGrad;
  ctx.fillRect(cx, 0, cx, cy);

  // Bottom-Right: Polar Night (极夜寒渊 · 玄青深海玄武岩)
  const nightGrad = ctx.createRadialGradient(cx * 1.45, cy * 1.45, 40, cx * 1.45, cy * 1.45, size * 0.54);
  nightGrad.addColorStop(0, '#27354D');
  nightGrad.addColorStop(0.65, '#192234');
  nightGrad.addColorStop(1, '#0F1522');
  ctx.fillStyle = nightGrad;
  ctx.fillRect(cx, cy, cx, cy);

  // Center Corridor: Twilight Band (晨昏狭缝 · 朱砂灵脉裂隙)
  const corridorGrad = ctx.createLinearGradient(cx - 105, 0, cx + 105, 0);
  corridorGrad.addColorStop(0, 'rgba(180, 83, 9, 0.0)');
  corridorGrad.addColorStop(0.35, 'rgba(180, 83, 9, 0.22)');
  corridorGrad.addColorStop(0.5, 'rgba(185, 28, 28, 0.34)');
  corridorGrad.addColorStop(0.65, 'rgba(30, 41, 59, 0.32)');
  corridorGrad.addColorStop(1, 'rgba(30, 41, 59, 0.0)');
  ctx.fillStyle = corridorGrad;
  ctx.fillRect(cx - 105, 0, 210, size);

  // Mineral grain & ink-wash speckles
  for (let i = 0; i < 4200; i++) {
    const px = ((i * 7919) % size);
    const py = ((i * 104729) % size);
    const r = 1 + (i % 3);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(20, 20, 19, 0.035)' : 'rgba(255, 255, 255, 0.035)';
    ctx.fillRect(px, py, r, r);
  }

  // Painted winding river (Qingxi -> Valley)
  ctx.save();
  ctx.strokeStyle = 'rgba(45, 108, 128, 0.42)';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 880, cy + 400);
  ctx.bezierCurveTo(cx - 640, cy + 200, cx - 480, cy + 310, cx - 220, cy + 160);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Desert dune ripples in Polar Day quadrant
  ctx.save();
  ctx.strokeStyle = 'rgba(161, 98, 7, 0.16)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 18; i++) {
    const yOff = 120 + i * 44;
    ctx.beginPath();
    ctx.moveTo(cx + 120, yOff);
    ctx.bezierCurveTo(cx + 380, yOff - 28, cx + 640, yOff + 28, size - 130, yOff - 10);
    ctx.stroke();
  }
  ctx.restore();

  // Topographic Contour Rings sampled from analytical terrain height!
  const step = 16;
  const cols = Math.floor(size / step);
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d')!;

  // Build bump & roughness pixel buffers from exact terrain heights
  const bImg = bCtx.createImageData(512, 512);
  const rImg = rCtx.createImageData(512, 512);
  for (let py = 0; py < 512; py++) {
    for (let px = 0; px < 512; px++) {
      const wx = ((px / 511) - 0.5) * radius * 2;
      const wz = ((py / 511) - 0.5) * radius * 2;
      const h = getTerrainHeight(wx, wz);
      const idx = (py * 512 + px) * 4;

      // Micro-grain height + macro relief
      const grain = Math.sin(wx * 5.3 + wz * 3.7) * 0.06 + Math.cos(wx * 11.1 - wz * 9.3) * 0.03;
      const normH = Math.max(0, Math.min(255, Math.floor(((h + 1.4) / 4.2 + grain) * 255)));
      bImg.data[idx] = normH;
      bImg.data[idx + 1] = normH;
      bImg.data[idx + 2] = normH;
      bImg.data[idx + 3] = 255;

      // Roughness: smoother in Polar Night wet basalt & Polar Day crystal sand, matte on foothills
      const isNight = wx > 0 && wz > 0;
      const isDay = wx > 0 && wz <= 0;
      const baseRough = isNight ? 135 : isDay ? 175 : 218;
      const rVal = Math.max(85, Math.min(245, Math.floor(baseRough + grain * 180)));
      rImg.data[idx] = rVal;
      rImg.data[idx + 1] = rVal;
      rImg.data[idx + 2] = rVal;
      rImg.data[idx + 3] = 255;
    }
  }
  bCtx.putImageData(bImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  // Draw crisp cartographic elevation contour lines directly onto Albedo
  ctx.fillStyle = 'rgba(28, 25, 23, 0.08)';
  for (let gy = 0; gy < cols; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const wx = ((gx * step) / size - 0.5) * radius * 2;
      const wz = ((gy * step) / size - 0.5) * radius * 2;
      if (Math.hypot(wx, wz) > 20.8) continue;
      const h = getTerrainHeight(wx, wz);
      const frac = Math.abs(((h * 3.2) % 1 + 1) % 1);
      if (frac < 0.08) {
        ctx.fillStyle = wx > 0 && wz > 0 ? 'rgba(148, 163, 184, 0.14)' : 'rgba(68, 64, 60, 0.11)';
        ctx.fillRect(gx * step, gy * step, 4, 4);
      }
    }
  }

  // Fine cartographic astrolabe rings & degree ticks (clean bronze ink, zero blurry giant text)
  ctx.strokeStyle = 'rgba(120, 88, 38, 0.24)';
  ctx.lineWidth = 2;
  [210, 420, 630, 835, 955].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(120, 88, 38, 0.34)';
  for (let deg = 0; deg < 360; deg += 3) {
    const rad = (deg * Math.PI) / 180;
    const inner = deg % 30 === 0 ? 920 : deg % 15 === 0 ? 934 : 944;
    ctx.lineWidth = deg % 30 === 0 ? 3.5 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
    ctx.lineTo(cx + Math.cos(rad) * 955, cy + Math.sin(rad) * 955);
    ctx.stroke();
  }

  // Compass cardinal crosshairs (Subtle Twilight & Equator Lines)
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = 'rgba(200, 30, 30, 0.42)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, 70);
  ctx.lineTo(cx, size - 70);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(180, 130, 50, 0.42)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(size - 70, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, bumpMap, roughnessMap };
}

/**
 * Architectural normal/roughness detail texture for glazed roofs, stone masonry & brushed bronze.
 */
export function createArchitecturalTileTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let x = 0; x < size; x += 16) {
    const grad = ctx.createLinearGradient(x, 0, x + 16, 0);
    grad.addColorStop(0, '#3A3A3A');
    grad.addColorStop(0.5, '#EAEAEA');
    grad.addColorStop(1, '#3A3A3A');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 16, size);
  }
  for (let y = 0; y < size; y += 24) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.35)';
    ctx.fillRect(0, y, size, 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

/**
 * Soft radial contact shadow plane texture so every structure stays firmly grounded.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(10, 10, 12, 0.62)');
  grad.addColorStop(0.5, 'rgba(10, 10, 12, 0.25)');
  grad.addColorStop(1, 'rgba(10, 10, 12, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * High-DPI crisp architectural seal sprite floating above each landmark.
 */
export function createLandmarkLabelSprite(
  indexLabel: string,
  name: string,
  accentHex: string,
  selected: boolean
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 112;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rx = 18;
  const ry = 14;
  const rw = 424;
  const rh = 82;

  // Drop shadow for crisp readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = selected ? '#141413' : 'rgba(252, 250, 245, 0.96)';
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, 6);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = selected ? '#C81E1E' : accentHex;
  ctx.lineWidth = selected ? 4 : 2.5;
  ctx.stroke();

  // Left vertical vermilion seal bar
  ctx.fillStyle = selected ? '#C81E1E' : accentHex;
  ctx.fillRect(rx + 12, ry + 14, 6, rh - 28);

  ctx.textAlign = 'left';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = selected ? '#FCA5A5' : '#991B1B';
  ctx.fillText(indexLabel, rx + 32, 46);

  ctx.font = '700 30px "Noto Serif SC", Georgia, serif';
  ctx.fillStyle = selected ? '#FFFFFF' : '#141413';
  ctx.fillText(name, rx + 32, 82);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.15, 0.78, 1);
  sprite.renderOrder = 20;
  return sprite;
}

// ---------- Reusable Architectural Geometry Builders ----------

function makeMat(
  color: string | number,
  roughness: number,
  metalness: number,
  extra?: Partial<THREE.MeshPhysicalMaterialParameters>
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    ...extra,
  });
}

/**
 * Creates an authentic Chinese upturned swept gable/hip roof using curved ExtrudeGeometry or Lathe profile.
 */
function createChineseSweptRoof(
  width: number,
  height: number,
  depth: number,
  curveDip = 0.14
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = width / 2;
  shape.moveTo(-hw, 0);
  shape.quadraticCurveTo(-hw * 0.45, height * curveDip, 0, height);
  shape.quadraticCurveTo(hw * 0.45, height * curveDip, hw, 0);
  shape.lineTo(hw * 0.88, -0.04);
  shape.quadraticCurveTo(0, height * 0.35, -hw * 0.88, -0.04);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.center();
  return geo;
}

/**
 * Creates a swept octagonal/conical pagoda roof with curved upturned eaves via LatheGeometry.
 */
function createPagodaEaveLathe(
  bottomRadius: number,
  topRadius: number,
  height: number,
  radialSegments = 8
): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(bottomRadius * 1.05, 0.04),
    new THREE.Vector2(bottomRadius * 0.92, 0.0),
    new THREE.Vector2(bottomRadius * 0.62, height * 0.28),
    new THREE.Vector2(bottomRadius * 0.32, height * 0.64),
    new THREE.Vector2(topRadius, height),
  ];
  return new THREE.LatheGeometry(pts, radialSegments);
}

/**
 * Creates a ribbed Chinese paper lantern via LatheGeometry.
 */
function createPaperLanternMesh(
  radius: number,
  height: number,
  color: string,
  emissiveColor: string
): THREE.Group {
  const g = new THREE.Group();
  const pts = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(radius * 0.6, height * 0.08),
    new THREE.Vector2(radius, height * 0.35),
    new THREE.Vector2(radius, height * 0.65),
    new THREE.Vector2(radius * 0.6, height * 0.92),
    new THREE.Vector2(0.01, height),
  ];
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 12),
    makeMat(color, 0.35, 0.05, { emissive: emissiveColor, emissiveIntensity: 1.55 })
  );
  const capMat = makeMat('#18181B', 0.4, 0.6);
  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.62, height * 0.1, 10), capMat);
  topCap.position.y = height * 0.96;
  const botCap = topCap.clone();
  botCap.position.y = height * 0.04;
  g.add(body, topCap, botCap);
  return g;
}

/**
 * Adds a colonnade ring of columns around a circular radius.
 */
function addColumnRing(
  parent: THREE.Group,
  count: number,
  radius: number,
  height: number,
  colRadius: number,
  baseY: number,
  mat: THREE.Material
) {
  const geo = new THREE.CylinderGeometry(colRadius, colRadius * 1.12, height, 8);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const col = new THREE.Mesh(geo, mat);
    col.position.set(Math.cos(a) * radius, baseY + height / 2, Math.sin(a) * radius);
    parent.add(col);
  }
}

/**
 * Builds intricate multi-part procedural 3D architectural miniatures (10–25+ meshes per landmark).
 */
export function buildLandmarkModel(
  landmark: WorldLandmark3D,
  contactShadowTex: THREE.CanvasTexture,
  tileBumpTex?: THREE.CanvasTexture
): { group: THREE.Group; hitMesh: THREE.Mesh; labelAnchorY: number } {
  const group = new THREE.Group();
  const s = landmark.scale ?? 1.0;

  // Grounded contact shadow beneath structure
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5 * s, 3.5 * s),
    new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.03;
  group.add(shadowPlane);

  // Shared museum-grade PBR palette
  const marbleMat = makeMat('#E7E2D8', 0.72, 0.04);
  const stoneMat = makeMat('#9CA3AF', 0.85, 0.08);
  const darkSlateMat = makeMat('#272D38', 0.55, 0.18, {
    bumpMap: tileBumpTex,
    bumpScale: 0.04,
  });
  const imperialGlazeMat = makeMat('#D4AF37', 0.24, 0.72, {
    clearcoat: 0.7,
    clearcoatRoughness: 0.15,
    bumpMap: tileBumpTex,
    bumpScale: 0.03,
  });
  const azureGlazeMat = makeMat('#0284C7', 0.2, 0.45, {
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    bumpMap: tileBumpTex,
    bumpScale: 0.03,
  });
  const woodMat = makeMat('#6B3F26', 0.78, 0.04);
  const cinnabarMat = makeMat('#B91C1C', 0.42, 0.12, { clearcoat: 0.25 });
  const brassMat = makeMat('#D4AF37', 0.22, 0.92);
  const bronzeMat = makeMat('#7C5C38', 0.32, 0.85);
  const jadeMat = makeMat('#0F766E', 0.28, 0.12, { clearcoat: 0.45 });
  const windowGlowMat = makeMat('#FDE68A', 0.2, 0.0, {
    emissive: '#F59E0B',
    emissiveIntensity: 1.35,
  });

  const modelRoot = new THREE.Group();
  modelRoot.scale.setScalar(s);
  let labelAnchorY = 2.6 * s;

  const type: LandmarkModelType = landmark.modelType;

  if (type === 'pavilion') {
    // 第一卷 · 青溪县城：石砌河岸 + 木拱桥 + 悬山青瓦木匠铺 + 暖灯窗棂 + 红灯笼
    const quay = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 1.65), stoneMat);
    quay.position.y = 0.11;
    modelRoot.add(quay);

    // Arched river bridge beside workshop
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.15, 0.16, 0.55),
      new THREE.Vector3(-0.75, 0.36, 0.55),
      new THREE.Vector3(-0.35, 0.16, 0.55),
    ]);
    const bridgeDeck = new THREE.Mesh(new THREE.TubeGeometry(archCurve, 14, 0.1, 6, false), woodMat);
    bridgeDeck.scale.set(1, 0.45, 2.2);
    modelRoot.add(bridgeDeck);

    // Timber hall + warm paper lattice window glow
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.14, 1.06), marbleMat);
    plinth.position.set(0.18, 0.28, -0.1);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.86), makeMat('#F3EFE6', 0.88, 0.02));
    walls.position.set(0.18, 0.71, -0.1);
    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.32, 0.89), windowGlowMat);
    windowStrip.position.set(0.18, 0.72, -0.1);
    modelRoot.add(plinth, walls, windowStrip);

    // 4 corner timber pillars
    [[-0.36, -0.52], [0.72, -0.52], [-0.36, 0.32], [0.72, 0.32]].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.74, 8), woodMat);
      col.position.set(px, 0.71, pz);
      modelRoot.add(col);
    });

    // Swept double-pitched Chinese gable roof + crimson ridge
    const roof = new THREE.Mesh(createChineseSweptRoof(1.52, 0.52, 1.24, 0.32), darkSlateMat);
    roof.position.set(0.18, 1.26, -0.1);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 1.28), cinnabarMat);
    ridge.position.set(0.18, 1.53, -0.1);
    modelRoot.add(roof, ridge);

    // Twin hanging red paper lanterns under eaves
    const l1 = createPaperLanternMesh(0.09, 0.2, '#EF4444', '#DC2626');
    l1.position.set(-0.22, 0.82, 0.42);
    const l2 = createPaperLanternMesh(0.09, 0.2, '#EF4444', '#DC2626');
    l2.position.set(0.58, 0.82, 0.42);
    modelRoot.add(l1, l2);
    labelAnchorY = 2.15 * s;
  } else if (type === 'palace') {
    // 第二卷 · 大景皇朝：三层汉白玉须弥座 + 朱红回廊立柱 + 重檐鎏金琉璃殿顶
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.16, 1.85), marbleMat);
    t1.position.y = 0.08;
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.15, 1.5), marbleMat);
    t2.position.y = 0.23;
    const t3 = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.14, 1.22), marbleMat);
    t3.position.y = 0.38;
    modelRoot.add(t1, t2, t3);

    // Imperial staircase ramp (丹陛)
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.56), marbleMat);
    stairs.position.set(0, 0.18, 0.78);
    modelRoot.add(stairs);

    // Palace inner hall + crimson colonnade
    const hall = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.68, 0.84), cinnabarMat);
    hall.position.y = 0.79;
    const windowBand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.86), windowGlowMat);
    windowBand.position.y = 0.76;
    modelRoot.add(hall, windowBand);

    for (let ix = -0.62; ix <= 0.62; ix += 0.31) {
      [-0.48, 0.48].forEach((pz) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.042, 0.7, 8), cinnabarMat);
        col.position.set(ix, 0.79, pz);
        modelRoot.add(col);
      });
    }

    // Double-eave swept imperial roofs
    const eave1 = new THREE.Mesh(createChineseSweptRoof(1.75, 0.34, 1.32, 0.26), imperialGlazeMat);
    eave1.position.y = 1.22;
    const clerestory = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.22, 0.64), cinnabarMat);
    clerestory.position.y = 1.44;
    const eave2 = new THREE.Mesh(createChineseSweptRoof(1.36, 0.44, 0.96, 0.32), imperialGlazeMat);
    eave2.position.y = 1.66;
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 1.02), brassMat);
    ridge.position.y = 1.9;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), brassMat);
    finial.position.y = 2.01;
    modelRoot.add(eave1, clerestory, eave2, ridge, finial);
    labelAnchorY = 2.55 * s;
  } else if (type === 'forge') {
    // 第三卷 · 北疆边城：边关玄石烽燧堡 + 垛口 + 高耸炼铁烟囱 + 炽红铁砧淬火台
    const bastion = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.28, 1.55), stoneMat);
    bastion.position.y = 0.14;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.6, 1.15, 8), stoneMat);
    tower.position.set(-0.36, 0.85, -0.15);
    const battlementRing = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.5, 0.18, 8), darkSlateMat);
    battlementRing.position.set(-0.36, 1.48, -0.15);
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.68, 8), darkSlateMat);
    chimney.position.set(-0.36, 1.88, -0.15);
    const forgeRoof = new THREE.Mesh(createChineseSweptRoof(0.95, 0.34, 0.88, 0.28), darkSlateMat);
    forgeRoof.position.set(0.45, 0.92, 0.12);
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.48, 0.62), makeMat('#3F3F46', 0.82, 0.15));
    hearth.position.set(0.45, 0.52, 0.12);
    const ember = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.22, 0.16, 10),
      makeMat('#FB923C', 0.2, 0.0, { emissive: '#EA580C', emissiveIntensity: 1.9 })
    );
    ember.position.set(0.45, 0.48, 0.44);
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.2), makeMat('#18181B', 0.3, 0.9));
    anvil.position.set(0.46, 0.4, -0.34);
    const bannerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 6), woodMat);
    bannerPole.position.set(-0.78, 0.85, 0.45);
    const bannerFlag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.03), cinnabarMat);
    bannerFlag.position.set(-0.6, 1.28, 0.45);
    modelRoot.add(bastion, tower, battlementRing, chimney, forgeRoof, hearth, ember, anvil, bannerPole, bannerFlag);
    labelAnchorY = 2.55 * s;
  } else if (type === 'alley') {
    // 第四卷 · 雾都暗巷：湿青石斜巷 + 醉仙楼酒肆阁楼 + 对望青瓦民居 + 曲颈铜路灯
    const cobble = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 1.5), makeMat('#1E293B', 0.35, 0.22));
    cobble.position.y = 0.08;
    const houseL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.02, 1.1), makeMat('#334155', 0.78, 0.1));
    houseL.position.set(-0.54, 0.66, -0.04);
    const winL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.65), windowGlowMat);
    winL.position.set(-0.24, 0.72, -0.04);
    const roofL = new THREE.Mesh(createChineseSweptRoof(0.76, 0.36, 1.18, 0.28), darkSlateMat);
    roofL.position.set(-0.54, 1.32, -0.04);

    const houseR = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.82, 0.98), makeMat('#27272A', 0.82, 0.1));
    houseR.position.set(0.54, 0.57, 0.06);
    const roofR = new THREE.Mesh(createChineseSweptRoof(0.72, 0.32, 1.05, 0.28), darkSlateMat);
    roofR.position.set(0.54, 1.12, 0.06);

    // Curved brass streetlamp overhanging alley
    const lampCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, 0.16, 0.48),
      new THREE.Vector3(0.18, 1.15, 0.48),
      new THREE.Vector3(0.02, 1.38, 0.48),
      new THREE.Vector3(-0.08, 1.28, 0.48),
    ]);
    const lampPole = new THREE.Mesh(new THREE.TubeGeometry(lampCurve, 14, 0.032, 6, false), brassMat);
    const lampBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      makeMat('#FDE047', 0.15, 0.0, { emissive: '#F59E0B', emissiveIntensity: 1.85 })
    );
    lampBulb.position.set(-0.08, 1.2, 0.48);
    modelRoot.add(cobble, houseL, winL, roofL, houseR, roofR, lampPole, lampBulb);
    labelAnchorY = 2.15 * s;
  } else if (type === 'atlantis') {
    // 第五卷 · 亚特兰蒂斯海底：断柱环廊 + 海蓝星潮底座 + 青铜星钟塔 + 发光水晶簇
    const seaBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.25, 0.2, 18),
      makeMat('#0F3D56', 0.32, 0.35, { clearcoat: 0.6 })
    );
    seaBase.position.y = 0.1;
    modelRoot.add(seaBase);

    // Broken & intact marble colonnade columns around perimeter
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const h = i % 2 === 0 ? 0.72 : 0.44;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, h, 8), marbleMat);
      col.position.set(Math.cos(a) * 0.88, 0.2 + h / 2, Math.sin(a) * 0.88);
      modelRoot.add(col);
    }

    const towerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 1.4, 12), bronzeMat);
    towerBody.position.y = 0.86;
    const bellCage = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.3, 8, 1, true), brassMat);
    bellCage.position.y = 1.58;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      makeMat('#0EA5E9', 0.18, 0.45, { clearcoat: 0.85 })
    );
    dome.position.y = 1.72;
    const dial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 18),
      makeMat('#38BDF8', 0.15, 0.2, { emissive: '#0284C7', emissiveIntensity: 1.6 })
    );
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0, 1.15, 0.34);

    // Glowing sea crystals
    [-0.45, 0.48].forEach((cx, idx) => {
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, idx === 0 ? 0.48 : 0.36, 5),
        makeMat('#67E8F9', 0.1, 0.1, { emissive: '#06B6D4', emissiveIntensity: 1.4 })
      );
      shard.position.set(cx, 0.38, 0.25);
      shard.rotation.z = idx === 0 ? 0.25 : -0.3;
      modelRoot.add(shard);
    });
    modelRoot.add(towerBody, bellCage, dome, dial);
    labelAnchorY = 2.35 * s;
  } else if (type === 'sect') {
    // 第六卷 · 万花宗：层叠青玉山崖 + 三重飞檐仙阁 + 盘曲枯桃古树与红梅花冠
    const crag1 = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.15, 0.42, 7), jadeMat);
    crag1.position.y = 0.21;
    const crag2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.78, 0.34, 7), jadeMat);
    crag2.position.set(-0.22, 0.56, -0.1);
    modelRoot.add(crag1, crag2);

    // Three-tier octagonal fairy pagoda
    const wall1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.38, 8), marbleMat);
    wall1.position.set(-0.22, 0.9, -0.1);
    const eave1 = new THREE.Mesh(createPagodaEaveLathe(0.52, 0.26, 0.24, 8), azureGlazeMat);
    eave1.position.set(-0.22, 1.06, -0.1);
    const wall2 = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.32, 8), cinnabarMat);
    wall2.position.set(-0.22, 1.32, -0.1);
    const eave2 = new THREE.Mesh(createPagodaEaveLathe(0.4, 0.1, 0.34, 8), azureGlazeMat);
    eave2.position.set(-0.22, 1.46, -0.1);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 8), brassMat);
    spire.position.set(-0.22, 1.88, -0.1);
    modelRoot.add(wall1, eave1, wall2, eave2, spire);

    // Twisted ancient peach tree curving over cliff
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, 0.35, 0.18),
      new THREE.Vector3(0.52, 0.72, 0.22),
      new THREE.Vector3(0.38, 1.08, 0.14),
      new THREE.Vector3(0.62, 1.32, 0.24),
    ]);
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 14, 0.065, 7, false), woodMat);
    const blossomMat = makeMat('#FB7185', 0.55, 0.02, { emissive: '#E11D48', emissiveIntensity: 0.22 });
    const b1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), blossomMat);
    b1.position.set(0.62, 1.36, 0.24);
    const b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), blossomMat);
    b2.position.set(0.38, 1.24, 0.1);
    modelRoot.add(trunk, b1, b2);
    labelAnchorY = 2.35 * s;
  } else if (type === 'airship') {
    // 第七卷 · 云鲸浮空城：流线黄铜云鲸船体 + 尾鳍羽翼 + 星轨陀螺环 + 浮空船坞塔
    const whalePts = [
      new THREE.Vector2(0.01, -0.82),
      new THREE.Vector2(0.18, -0.58),
      new THREE.Vector2(0.36, -0.15),
      new THREE.Vector2(0.38, 0.28),
      new THREE.Vector2(0.26, 0.62),
      new THREE.Vector2(0.01, 0.82),
    ];
    const whaleBody = new THREE.Mesh(new THREE.LatheGeometry(whalePts, 16), brassMat);
    whaleBody.rotation.z = Math.PI / 2;
    whaleBody.position.y = 0.96;

    const underCabin = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.26, 0.34), woodMat);
    underCabin.position.y = 0.56;
    const cabinWin = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.36), windowGlowMat);
    cabinWin.position.y = 0.56;

    // Dorsal & Side Mechanical Star-Copper Wings
    const wingMat = makeMat('#F1F5F9', 0.35, 0.35, { clearcoat: 0.4 });
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.68), wingMat);
    finL.position.set(-0.08, 0.95, 0.56);
    finL.rotation.set(0.12, 0.35, 0);
    const finR = finL.clone();
    finR.position.z = -0.56;
    finR.rotation.set(-0.12, -0.35, 0);

    // Tail fluke
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.65), brassMat);
    tail.position.set(-0.78, 0.96, 0);

    // Gyroscopic sky ring
    const gyroRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.04, 10, 36),
      makeMat('#38BDF8', 0.2, 0.85, { emissive: '#0284C7', emissiveIntensity: 0.7 })
    );
    gyroRing.rotation.x = Math.PI / 2.35;
    gyroRing.position.y = 0.96;
    modelRoot.add(whaleBody, underCabin, cabinWin, finL, finR, tail, gyroRing);
    labelAnchorY = 2.05 * s;
  } else if (type === 'pyramid') {
    // 第八卷 · 镜面沙海：砂岩方台 + 四角小方尖碑 + 高光琉璃镜面尖塔 + 炽阳铜环
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.32, 0.18, 4), makeMat('#D97706', 0.86, 0.06));
    base1.rotation.y = Math.PI / 4;
    base1.position.y = 0.09;
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.02, 0.16, 4), makeMat('#F59E0B', 0.8, 0.1));
    base2.rotation.y = Math.PI / 4;
    base2.position.y = 0.25;

    const mirrorObelisk = new THREE.Mesh(
      new THREE.ConeGeometry(0.72, 1.68, 4),
      makeMat('#FEF08A', 0.06, 0.95, { clearcoat: 1.0, clearcoatRoughness: 0.05 })
    );
    mirrorObelisk.rotation.y = Math.PI / 4;
    mirrorObelisk.position.y = 1.15;

    [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]].forEach(([ox, oz]) => {
      const mini = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.45, 4), bronzeMat);
      mini.position.set(ox, 0.42, oz);
      modelRoot.add(mini);
    });

    const sunHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.035, 10, 32),
      makeMat('#FDE047', 0.15, 0.9, { emissive: '#F59E0B', emissiveIntensity: 0.9 })
    );
    sunHalo.position.y = 1.92;
    modelRoot.add(base1, base2, mirrorObelisk, sunHalo);
    labelAnchorY = 2.6 * s;
  } else if (type === 'sundial') {
    // 第九卷 · 晨昏界：太极阴阳日晷拱门 + 双色台基 + 倾斜朱砂指针 + 半明灯柱
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.18, 0.22, 24), marbleMat);
    plinth.position.y = 0.11;
    const halfGold = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.11, 12, 24, Math.PI),
      brassMat
    );
    halfGold.rotation.z = Math.PI / 2;
    halfGold.position.y = 1.02;
    const halfObsidian = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.11, 12, 24, Math.PI),
      makeMat('#1E293B', 0.18, 0.82, { clearcoat: 0.7 })
    );
    halfObsidian.rotation.z = -Math.PI / 2;
    halfObsidian.position.y = 1.02;

    const dialPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.68, 0.06, 24), bronzeMat);
    dialPlate.position.y = 0.25;
    const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.98, 6), cinnabarMat);
    gnomon.rotation.z = -0.38;
    gnomon.position.set(0.1, 0.7, 0);

    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      makeMat('#FBBF24', 0.2, 0.1, { emissive: '#F59E0B', emissiveIntensity: 1.7 })
    );
    sunOrb.position.set(-0.84, 1.02, 0);
    const moonOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      makeMat('#BAE6FD', 0.2, 0.1, { emissive: '#38BDF8', emissiveIntensity: 1.4 })
    );
    moonOrb.position.set(0.84, 1.02, 0);
    modelRoot.add(plinth, halfGold, halfObsidian, dialPlate, gnomon, sunOrb, moonOrb);
    labelAnchorY = 2.35 * s;
  } else if (type === 'lantern') {
    // 第十卷 · 枯骨灯市：水上吊脚木栈桥 + 乌篷小舟 + 飞檐牌坊 + 群悬红纸灯笼
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.16, 1.18), woodMat);
    deck.position.y = 0.26;
    // Wooden stilt pilings standing in river
    [[-0.75, -0.48], [0.75, -0.48], [-0.75, 0.48], [0.75, 0.48]].forEach(([px, pz]) => {
      const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.36, 8), woodMat);
      pile.position.set(px, 0.1, pz);
      modelRoot.add(pile);
    });

    // Timber arch frame + swept roof cap
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.25, 8), darkSlateMat);
    postL.position.set(-0.56, 0.94, 0);
    const postR = postL.clone();
    postR.position.x = 0.56;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.1, 0.14), cinnabarMat);
    beam.position.set(0, 1.54, 0);
    const capRoof = new THREE.Mesh(createChineseSweptRoof(1.62, 0.28, 0.48, 0.3), darkSlateMat);
    capRoof.position.set(0, 1.72, 0);

    // Three detailed Lathe paper lanterns
    [-0.36, 0, 0.36].forEach((lx, i) => {
      const l = createPaperLanternMesh(0.11, 0.26, '#EF4444', '#DC2626');
      l.position.set(lx, i === 1 ? 1.14 : 1.22, 0);
      modelRoot.add(l);
    });

    // Moored black-awning river skiff (乌篷小舟)
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.65, 4, 10), woodMat);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(1, 1, 0.6);
    hull.position.set(0.25, 0.08, 0.85);
    const awning = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.35, 8, 1, false, 0, Math.PI), darkSlateMat);
    awning.rotation.z = Math.PI / 2;
    awning.position.set(0.25, 0.14, 0.85);
    modelRoot.add(deck, postL, postR, beam, capRoof, hull, awning);
    labelAnchorY = 2.25 * s;
  } else if (type === 'nether') {
    // 第十一卷 · 九幽核销司：八角玄岩审判定魂台 + 业火熔炉 + 四朱红判官柱 + 销户印环
    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.38, 0.22, 8), makeMat('#1E1B2E', 0.7, 0.25));
    dais1.position.y = 0.11;
    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.05, 0.16, 8), makeMat('#2E2646', 0.55, 0.35));
    dais2.position.y = 0.29;
    modelRoot.add(dais1, dais2);

    const furnacePts = [
      new THREE.Vector2(0.45, 0),
      new THREE.Vector2(0.54, 0.28),
      new THREE.Vector2(0.42, 0.68),
      new THREE.Vector2(0.52, 0.9),
      new THREE.Vector2(0.36, 0.96),
    ];
    const furnace = new THREE.Mesh(
      new THREE.LatheGeometry(furnacePts, 10),
      makeMat('#312E81', 0.28, 0.72, { emissive: '#6D28D9', emissiveIntensity: 0.75 })
    );
    furnace.position.y = 0.36;
    const karmaFlame = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 1),
      makeMat('#E9D5FF', 0.1, 0.1, { emissive: '#A855F7', emissiveIntensity: 2.0 })
    );
    karmaFlame.position.y = 1.48;

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.35, 0.16), cinnabarMat);
      p.position.set(Math.cos(a) * 0.85, 0.94, Math.sin(a) * 0.85);
      modelRoot.add(p);
    }

    const sealRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.045, 8, 32),
      makeMat('#EF4444', 0.2, 0.3, { emissive: '#C81E1E', emissiveIntensity: 1.25 })
    );
    sealRing.rotation.x = Math.PI / 2;
    sealRing.position.y = 1.56;
    modelRoot.add(furnace, karmaFlame, sealRing);
    labelAnchorY = 2.35 * s;
  } else if (type === 'heaven') {
    // 第十二卷 · 天界陨星旧档库：浮空汉白玉台 + 八柱藏经星阁 + 蔚蓝琉璃尖顶 + 双交叉星轨浑天环
    const cloudBase = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 0.86, 0.2, 16), marbleMat);
    cloudBase.position.y = 0.1;
    const innerStep = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.92, 0.14, 16), marbleMat);
    innerStep.position.y = 0.27;
    modelRoot.add(cloudBase, innerStep);

    const rotunda = new THREE.Group();
    addColumnRing(rotunda, 8, 0.52, 0.72, 0.036, 0.34, brassMat);
    const coreChamber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.38, 0.7, 8),
      makeMat('#F0F9FF', 0.25, 0.2, { emissive: '#38BDF8', emissiveIntensity: 0.35 })
    );
    coreChamber.position.y = 0.69;
    const roof1 = new THREE.Mesh(createPagodaEaveLathe(0.76, 0.35, 0.26, 8), azureGlazeMat);
    roof1.position.y = 1.06;
    const roof2 = new THREE.Mesh(createPagodaEaveLathe(0.5, 0.08, 0.42, 8), azureGlazeMat);
    roof2.position.y = 1.32;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), brassMat);
    finial.position.y = 1.8;
    rotunda.add(coreChamber, roof1, roof2, finial);
    modelRoot.add(rotunda);

    // Intersecting golden celestial armillary rings
    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.035, 8, 40),
      makeMat('#FDE047', 0.2, 0.92, { emissive: '#FACC15', emissiveIntensity: 0.75 })
    );
    ringA.rotation.set(Math.PI / 3, 0.25, 0);
    ringA.position.y = 0.98;
    const ringB = ringA.clone();
    ringB.rotation.set(-Math.PI / 3.4, -0.3, 0.4);
    modelRoot.add(ringA, ringB);
    labelAnchorY = 2.48 * s;
  } else if (type === 'modern') {
    // 第十三卷 · 霓虹旧港：海堤码台 + 高架测速桥段 + 归尘堂玻璃旧书店 + 霓虹灯牌 + 港口门机
    const pier = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.2, 1.45), makeMat('#475569', 0.72, 0.2));
    pier.position.y = 0.1;

    // Elevated coastal highway overpass (where 80mph speed-trap radar triggers!)
    const viaduct = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.28), makeMat('#64748B', 0.55, 0.35));
    viaduct.position.set(0, 0.95, 0.52);
    [-0.75, 0, 0.75].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.78, 8), stoneMat);
      pillar.position.set(px, 0.55, 0.52);
      modelRoot.add(pillar);
    });

    // Vintage "归尘堂" bookshop + glass facade
    const bookshop = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.66, 0.7), makeMat('#1E293B', 0.45, 0.32));
    bookshop.position.set(-0.36, 0.53, -0.15);
    const shopWindow = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.28, 0.72), windowGlowMat);
    shopWindow.position.set(-0.36, 0.44, -0.15);
    const neonSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.11, 0.06),
      makeMat('#67E8F9', 0.1, 0.1, { emissive: '#06B6D4', emissiveIntensity: 1.9 })
    );
    neonSign.position.set(-0.36, 0.92, 0.21);

    // Harbor glass skyscraper + crane mast
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 1.48, 0.48),
      makeMat('#1E293B', 0.18, 0.8, { clearcoat: 0.9 })
    );
    tower.position.set(0.46, 0.94, -0.2);
    const craneMast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.72, 0.08), cinnabarMat);
    craneMast.position.set(0.72, 1.06, 0.18);
    const craneBoom = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.07), cinnabarMat);
    craneBoom.position.set(0.45, 1.88, 0.18);
    craneBoom.rotation.z = 0.15;
    modelRoot.add(pier, viaduct, bookshop, shopWindow, neonSign, tower, craneMast, craneBoom);
    labelAnchorY = 2.45 * s;
  } else if (type === 'ark') {
    // 第十四卷 · 灰烬方舟：永冬冰壳基座 + 肋骨装甲穹顶 + 磁约束太阳点火高塔
    const iceBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.22, 1.38, 0.26, 12),
      makeMat('#CBD5E1', 0.32, 0.12, { clearcoat: 0.5 })
    );
    iceBase.position.y = 0.13;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.86, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      makeMat('#334155', 0.35, 0.82)
    );
    dome.position.y = 0.26;
    // Ribbed steel armor arches over dome
    [0, Math.PI / 3, (Math.PI * 2) / 3].forEach((rot) => {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.035, 8, 24, Math.PI), bronzeMat);
      rib.position.y = 0.26;
      rib.rotation.y = rot;
      modelRoot.add(rib);
    });
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.48, 10), brassMat);
    spire.position.y = 1.04;
    const containmentRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 8, 24), bronzeMat);
    containmentRing.rotation.x = Math.PI / 3;
    containmentRing.position.y = 1.84;
    const sunCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      makeMat('#FED7AA', 0.1, 0.0, { emissive: '#F97316', emissiveIntensity: 2.2 })
    );
    sunCore.position.y = 1.84;
    modelRoot.add(iceBase, dome, spire, containmentRing, sunCore);
    labelAnchorY = 2.5 * s;
  } else {
    // 回响卷 · 落花崖荒坟：天枢玄岩主峰 + 汉白玉石台 + 玄木青石古棺 + 崖畔落花桃树 + 朱砂封灵阵与破晓光柱
    const cliffBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.55, 0.92, 9), makeMat('#27272A', 0.88, 0.08));
    cliffBase.position.y = 0.46;
    const altar = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.22, 0.98), marbleMat);
    altar.position.y = 0.94;
    const coffinBase = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.34, 0.48), makeMat('#1C1917', 0.32, 0.35));
    coffinBase.position.y = 1.22;
    const coffinLid = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.1, 0.54), bronzeMat);
    coffinLid.position.y = 1.42;

    // Cliffside blossom tree beside coffin
    const treeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.62, 0.82, -0.25),
      new THREE.Vector3(-0.76, 1.24, -0.28),
      new THREE.Vector3(-0.56, 1.58, -0.2),
    ]);
    const treeTrunk = new THREE.Mesh(new THREE.TubeGeometry(treeCurve, 12, 0.05, 6, false), woodMat);
    const blossom = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.24, 1),
      makeMat('#FB7185', 0.55, 0.02, { emissive: '#C81E1E', emissiveIntensity: 0.28 })
    );
    blossom.position.set(-0.56, 1.64, -0.2);

    const cinnabarSeal = new THREE.Mesh(
      new THREE.TorusGeometry(0.76, 0.04, 8, 36),
      makeMat('#EF4444', 0.2, 0.2, { emissive: '#C81E1E', emissiveIntensity: 1.5 })
    );
    cinnabarSeal.rotation.x = Math.PI / 2;
    cinnabarSeal.position.y = 1.58;

    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.11, 1.95, 10),
      makeMat('#FCA5A5', 0.15, 0.0, {
        emissive: '#DC2626',
        emissiveIntensity: 1.45,
        transparent: true,
        opacity: 0.65,
      })
    );
    beacon.position.y = 2.25;
    modelRoot.add(cliffBase, altar, coffinBase, coffinLid, treeTrunk, blossom, cinnabarSeal, beacon);
    labelAnchorY = 3.15 * s;
  }

  modelRoot.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  group.add(modelRoot);

  // Invisible simplified proxy collision cylinder on Raycaster Layer 1
  const hitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.42 * s, 1.42 * s, 2.6 * s, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.position.y = 1.3 * s;
  hitMesh.layers.set(1);
  hitMesh.userData = { arcId: landmark.arcId };
  group.add(hitMesh);

  return { group, hitMesh, labelAnchorY };
}
