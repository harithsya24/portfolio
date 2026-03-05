'use strict';

/**
 * three-bg.js — Animated neural-network background.
 *
 * Renders nodes (Points), edges (LineSegments), and signal pulses
 * on a fixed full-page WebGL canvas that sits behind all HTML content.
 * Requires Three.js loaded as the global `THREE` before this script.
 */
(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── Config ────────────────────────────────────────────────────────────────
  const mobile = window.innerWidth < 768;

  const CFG = {
    nodeCount:   mobile ? 55  : 110,
    connectDist: mobile ? 2.4 : 2.9,
    maxEdges:    mobile ? 110 : 220,
    pulseCount:  mobile ? 4   : 9,
    camZ:        8,
    bounds:      { x: 9, y: 5.5, z: 2.5 },
    nodeSize:    mobile ? 0.055 : 0.065,
    pulseSize:   0.14,
    // [r,g,b] 0–1
    cyan:   [0.000, 0.831, 1.000],   // #00d4ff
    violet: [0.659, 0.333, 0.969],   // #a855f7
  };

  // ── Three.js setup ────────────────────────────────────────────────────────
  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = CFG.camZ;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  fitRenderer();

  // ── Node data (typed arrays for GC-free updates) ──────────────────────────
  const N = CFG.nodeCount;
  const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
  const vx = new Float32Array(N), vy = new Float32Array(N), vz = new Float32Array(N);
  const isViolet = new Uint8Array(N);

  for (let i = 0; i < N; i++) {
    px[i] = (Math.random() - 0.5) * CFG.bounds.x * 2;
    py[i] = (Math.random() - 0.5) * CFG.bounds.y * 2;
    pz[i] = (Math.random() - 0.5) * CFG.bounds.z * 2;
    const spd = 0.004 + Math.random() * 0.005;
    vx[i] = (Math.random() - 0.5) * spd;
    vy[i] = (Math.random() - 0.5) * spd;
    vz[i] = (Math.random() - 0.5) * spd * 0.5;
    isViolet[i] = Math.random() < 0.27 ? 1 : 0;
  }

  // ── Points geometry (nodes) ───────────────────────────────────────────────
  const nodePosBuf = new Float32Array(N * 3);
  const nodeColBuf = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const c = isViolet[i] ? CFG.violet : CFG.cyan;
    nodeColBuf[i * 3]     = c[0];
    nodeColBuf[i * 3 + 1] = c[1];
    nodeColBuf[i * 3 + 2] = c[2];
  }

  const nodesGeo = new THREE.BufferGeometry();
  nodesGeo.setAttribute('position', new THREE.BufferAttribute(nodePosBuf, 3));
  nodesGeo.setAttribute('color',    new THREE.BufferAttribute(nodeColBuf, 3));

  scene.add(new THREE.Points(nodesGeo, new THREE.PointsMaterial({
    size:            CFG.nodeSize,
    vertexColors:    true,
    transparent:     true,
    opacity:         0.88,
    sizeAttenuation: true,
    blending:        THREE.AdditiveBlending,
    depthWrite:      false,
  })));

  // ── LineSegments geometry (edges) ─────────────────────────────────────────
  const M = CFG.maxEdges;
  const edgePosBuf = new Float32Array(M * 6);
  const edgeColBuf = new Float32Array(M * 6);

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePosBuf, 3));
  edgeGeo.setAttribute('color',    new THREE.BufferAttribute(edgeColBuf, 3));
  edgeGeo.setDrawRange(0, 0);

  scene.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent:  true,
    opacity:      0.55,
    blending:     THREE.AdditiveBlending,
    depthWrite:   false,
  })));

  // ── Signal pulses ─────────────────────────────────────────────────────────
  const P = CFG.pulseCount;
  const pulseBuf = new Float32Array(P * 3);
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulseBuf, 3));

  scene.add(new THREE.Points(pulseGeo, new THREE.PointsMaterial({
    size:            CFG.pulseSize,
    color:           0xffffff,
    transparent:     true,
    opacity:         0.92,
    sizeAttenuation: true,
    blending:        THREE.AdditiveBlending,
    depthWrite:      false,
  })));

  const pulses = Array.from({ length: P }, () => ({
    from:  Math.floor(Math.random() * N),
    to:    Math.floor(Math.random() * N),
    t:     Math.random(),
    speed: 0.006 + Math.random() * 0.009,
  }));

  /** Returns a random nearby node index (within connectDist of src). */
  function pickNearby(src) {
    const pool = [];
    const D2 = CFG.connectDist * CFG.connectDist;
    for (let i = 0; i < N; i++) {
      if (i === src) continue;
      const dx = px[src] - px[i], dy = py[src] - py[i], dz = pz[src] - pz[i];
      if (dx * dx + dy * dy + dz * dz < D2) pool.push(i);
    }
    return pool.length
      ? pool[Math.floor(Math.random() * pool.length)]
      : Math.floor(Math.random() * N);
  }

  // ── Mouse parallax ────────────────────────────────────────────────────────
  let mxT = 0, myT = 0, camX = 0, camY = 0;
  window.addEventListener('mousemove', e => {
    mxT = (e.clientX / window.innerWidth  - 0.5) * 2;
    myT = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Animation loop ────────────────────────────────────────────────────────
  const CD = CFG.connectDist, CD2 = CD * CD;
  const cy = CFG.cyan, vi = CFG.violet;
  let rafId;

  function tick() {
    rafId = requestAnimationFrame(tick);

    // Update node positions
    for (let i = 0; i < N; i++) {
      px[i] += vx[i]; py[i] += vy[i]; pz[i] += vz[i];
      if (px[i] >  CFG.bounds.x || px[i] < -CFG.bounds.x) vx[i] *= -1;
      if (py[i] >  CFG.bounds.y || py[i] < -CFG.bounds.y) vy[i] *= -1;
      if (pz[i] >  CFG.bounds.z || pz[i] < -CFG.bounds.z) vz[i] *= -1;
      nodePosBuf[i * 3]     = px[i];
      nodePosBuf[i * 3 + 1] = py[i];
      nodePosBuf[i * 3 + 2] = pz[i];
    }
    nodesGeo.attributes.position.needsUpdate = true;

    // Build edge buffer
    let e = 0;
    outer: for (let i = 0; i < N - 1; i++) {
      for (let j = i + 1; j < N; j++) {
        if (e >= M) break outer;
        const dx = px[i] - px[j], dy = py[i] - py[j], dz = pz[i] - pz[j];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < CD2) {
          const a  = 1 - Math.sqrt(d2) / CD;
          const ci = isViolet[i] ? vi : cy;
          const cj = isViolet[j] ? vi : cy;
          const b  = e * 6;
          edgePosBuf[b]     = px[i]; edgePosBuf[b + 1] = py[i]; edgePosBuf[b + 2] = pz[i];
          edgePosBuf[b + 3] = px[j]; edgePosBuf[b + 4] = py[j]; edgePosBuf[b + 5] = pz[j];
          edgeColBuf[b]     = ci[0] * a; edgeColBuf[b + 1] = ci[1] * a; edgeColBuf[b + 2] = ci[2] * a;
          edgeColBuf[b + 3] = cj[0] * a; edgeColBuf[b + 4] = cj[1] * a; edgeColBuf[b + 5] = cj[2] * a;
          e++;
        }
      }
    }
    edgeGeo.attributes.position.needsUpdate = true;
    edgeGeo.attributes.color.needsUpdate    = true;
    edgeGeo.setDrawRange(0, e * 2);

    // Update pulses
    for (let p = 0; p < P; p++) {
      const pd = pulses[p];
      pd.t += pd.speed;
      if (pd.t >= 1) {
        pd.t     = 0;
        pd.from  = pd.to;
        pd.to    = pickNearby(pd.from);
        pd.speed = 0.006 + Math.random() * 0.009;
      }
      const t = pd.t, f = pd.from, to = pd.to;
      pulseBuf[p * 3]     = px[f] + (px[to] - px[f]) * t;
      pulseBuf[p * 3 + 1] = py[f] + (py[to] - py[f]) * t;
      pulseBuf[p * 3 + 2] = pz[f] + (pz[to] - pz[f]) * t;
    }
    pulseGeo.attributes.position.needsUpdate = true;

    // Smooth camera parallax
    camX += (mxT * 0.65 - camX) * 0.035;
    camY += (-myT * 0.42 - camY) * 0.035;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  tick();

  // ── Pause when tab hidden ─────────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else tick();
  });

  // ── Resize (debounced) ────────────────────────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitRenderer, 150);
  }, { passive: true });

  function fitRenderer() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
})();
