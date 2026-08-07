(function (global) {
  function buildShellGeometry(THREE, stations, segments) {
    segments = segments || 14;
    const rows = stations.map((st) => {
      const row = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const ang = t * Math.PI;
        row.push([st.x, st.base + st.hh * Math.sin(ang), -st.hw * Math.cos(ang)]);
      }
      return row;
    });

    const positions = [];
    const uvs = [];
    const totalLen = stations[stations.length - 1].x - stations[0].x || 1;
    for (let s = 0; s < rows.length - 1; s++) {
      const rowA = rows[s], rowB = rows[s + 1];
      const uA = (stations[s].x - stations[0].x) / totalLen;
      const uB = (stations[s + 1].x - stations[0].x) / totalLen;
      for (let i = 0; i < segments; i++) {
        const a = rowA[i], b = rowA[i + 1], c = rowB[i + 1], d = rowB[i];
        const vA = i / segments, vB = (i + 1) / segments;
        positions.push(...a, ...b, ...c, ...a, ...c, ...d);
        uvs.push(uA, vA, uA, vB, uB, vB, uA, vA, uB, vB, uB, vA);
      }
    }
    function addCap(row, x, base, flip) {
      const center = [x, base, 0];
      const uC = (x - stations[0].x) / totalLen;
      for (let i = 0; i < row.length - 1; i++) {
        const a = row[i], b = row[i + 1];
        const vA = i / (row.length - 1), vB = (i + 1) / (row.length - 1);
        if (flip) { positions.push(...center, ...b, ...a); uvs.push(uC, 0.5, uC, vB, uC, vA); }
        else { positions.push(...center, ...a, ...b); uvs.push(uC, 0.5, uC, vA, uC, vB); }
      }
    }
    addCap(rows[0], stations[0].x, stations[0].base, true);
    addCap(rows[rows.length - 1], stations[stations.length - 1].x, stations[stations.length - 1].base, false);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }

  /* ---------------------------------------------------------------------
     PROCEDURAL MATERIAL TEXTURES — no external image files. A small
     canvas is painted with a weave/grain pattern and used as a real
     Three.js texture (map + bumpMap), so the upper actually catches
     light like fabric or leather instead of flat plastic. This also
     gives the geometry real UVs (see above) that a future real photo
     texture could drop straight into.
  --------------------------------------------------------------------- */
  const textureCache = {};
  function makeFabricTexture(THREE, kind) {
    if (textureCache[kind]) return textureCache[kind];
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, size, size);

    if (kind === "knit") {
      // woven mesh: two crossing diagonal stripe sets (subtle — this is a
      // multiplicative map, so it must stay close to white or it will
      // darken/desaturate whatever color the wearer picks)
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.2;
      for (let i = -size; i < size * 2; i += 5) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + size, size); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,0,0,0.10)";
      for (let i = -size; i < size * 2; i += 5) {
        ctx.beginPath(); ctx.moveTo(i + size, 0); ctx.lineTo(i, size); ctx.stroke();
      }
    } else if (kind === "leather") {
      // fine grain speckle + subtle blotches
      for (let i = 0; i < 1400; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const v = 200 + Math.random() * 55;
        ctx.fillStyle = `rgba(${v},${v},${v},0.10)`;
        ctx.beginPath(); ctx.arc(x, y, 0.6 + Math.random() * 1.2, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 18; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        ctx.fillStyle = "rgba(0,0,0,0.04)";
        ctx.beginPath(); ctx.ellipse(x, y, 14 + Math.random() * 22, 8 + Math.random() * 14, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // rubber/synthetic: soft noise only
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const v = 210 + Math.random() * 40;
        ctx.fillStyle = `rgba(${v},${v},${v},0.08)`;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(kind === "knit" ? 6 : 3, kind === "knit" ? 3 : 2);
    textureCache[kind] = tex;
    return tex;
  }

  function buildSoleShape(THREE, widthScale) {
    widthScale = widthScale || 1;
    const s = new THREE.Shape();
    const w = widthScale;
    s.moveTo(-1.15, 0.0);
    s.quadraticCurveTo(-1.30, 0.30 * w, -1.05, 0.43 * w);
    s.quadraticCurveTo(-0.60, 0.47 * w, -0.10, 0.48 * w);
    s.quadraticCurveTo(0.55, 0.49 * w, 0.95, 0.39 * w);
    s.quadraticCurveTo(1.26, 0.30 * w, 1.38, 0.0);
    s.quadraticCurveTo(1.26, -0.30 * w, 0.95, -0.39 * w);
    s.quadraticCurveTo(0.55, -0.49 * w, -0.10, -0.48 * w);
    s.quadraticCurveTo(-0.60, -0.47 * w, -1.05, -0.43 * w);
    s.quadraticCurveTo(-1.30, -0.30 * w, -1.15, 0.0);
    s.closePath();
    return s;
  }

  const STYLES = {
    runner: { label: "Classic Runner", soleThickness: 0.16, soleWidth: 1, treadStyle: "lines", collar: 1, throatDip: 1, toe: 1, laces: true, stripe: false, material: "knit" },
    "high-top": { label: "High-Top", soleThickness: 0.17, soleWidth: 1, treadStyle: "lines", collar: 1.85, throatDip: 0.8, toe: 1, laces: true, stripe: false, material: "leather" },
    "slip-on": { label: "Slip-On", soleThickness: 0.15, soleWidth: 0.98, treadStyle: "lines", collar: 0.9, throatDip: 0.15, toe: 0.95, laces: false, stripe: false, material: "knit" },
    chunky: { label: "Chunky Dad Shoe", soleThickness: 0.34, soleWidth: 1.22, treadStyle: "lugs", collar: 1.05, throatDip: 1, toe: 1.05, laces: true, stripe: true, material: "leather" },
    minimal: { label: "Minimalist Racer", soleThickness: 0.09, soleWidth: 0.9, treadStyle: "lines", collar: 0.75, throatDip: 1, toe: 0.85, laces: true, stripe: false, thinLaces: true, material: "knit" },
    trail: { label: "Trail Boot", soleThickness: 0.26, soleWidth: 1.1, treadStyle: "lugs", collar: 1.55, throatDip: 0.9, toe: 1.05, laces: true, stripe: false, material: "rubber" },
    basketball: { label: "Basketball Mid", soleThickness: 0.24, soleWidth: 1.12, treadStyle: "lugs", collar: 1.35, throatDip: 1, toe: 1.15, laces: true, stripe: false, material: "leather" },
    skate: { label: "Skate Low", soleThickness: 0.20, soleWidth: 1.08, treadStyle: "flat", collar: 0.95, throatDip: 1, toe: 1, laces: true, stripe: false, material: "leather" },
    retro: { label: "Retro Court", soleThickness: 0.14, soleWidth: 1, treadStyle: "lines", collar: 1, throatDip: 1, toe: 1, laces: true, stripe: true, material: "leather" },
    platform: { label: "Platform Sneaker", soleThickness: 0.40, soleWidth: 1.15, treadStyle: "lugs", collar: 1.15, throatDip: 1, toe: 1, laces: true, stripe: false, material: "leather" },
  };

  function stationsForStyle(st) {
    const c = st.collar, td = st.throatDip, toe = st.toe;
    const base = 0;
    return [
      { x: -1.30, hh: 0.02, hw: 0.26, base },
      { x: -1.20, hh: 0.30 * c, hw: 0.31, base },
      { x: -1.02, hh: 0.40 * c, hw: 0.325, base },
      { x: -0.78, hh: 0.30 * (0.4 + 0.6 * td) * c, hw: 0.335, base },
      { x: -0.46, hh: 0.185 * (0.35 + 0.65 * td), hw: 0.345, base },
      { x: -0.15, hh: 0.22, hw: 0.36, base },
      { x: 0.20, hh: 0.26, hw: 0.35 * toe, base },
      { x: 0.55, hh: 0.235, hw: 0.32 * toe, base },
      { x: 0.85, hh: 0.19 * toe, hw: 0.27 * toe, base },
      { x: 1.10, hh: 0.145 * toe, hw: 0.20 * toe, base },
      { x: 1.32, hh: 0.06, hw: 0.12, base },
    ];
  }

  // approximates buildSoleShape's width profile so tread details taper
  // at heel/toe and stay wide at the ball of the foot, instead of
  // sitting inside a uniform-width box.
  function soleWidthEnvelope(x) {
    const t = Math.min(1, Math.max(0, (x + 1.15) / 2.53));
    return Math.max(0.3, Math.sin(Math.PI * Math.pow(t, 0.85)));
  }

  const aoTexCache = {};
  function makeContactAOTexture(THREE) {
    if (aoTexCache.tex) return aoTexCache.tex;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(0,0,0,0.55)");
    grad.addColorStop(0.6, "rgba(0,0,0,0.22)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    aoTexCache.tex = new THREE.CanvasTexture(canvas);
    return aoTexCache.tex;
  }

  function makeShoe(THREE, styleKey) {
    const st = STYLES[styleKey] || STYLES.runner;
    const group = new THREE.Group();
    const parts = {};

    const soleThickness = st.soleThickness;
    const soleTopY = soleThickness;

    const soleShape = buildSoleShape(THREE, st.soleWidth);
    const soleGeo = new THREE.ExtrudeGeometry(soleShape, {
      depth: soleThickness, bevelEnabled: true, bevelThickness: soleThickness * 0.2,
      bevelSize: 0.02, bevelSegments: 3, curveSegments: 28,
    });
    soleGeo.rotateX(-Math.PI / 2);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xd7ff3f, roughness: 0.85, metalness: 0.02 });
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.castShadow = true; sole.receiveShadow = true;
    group.add(sole);
    parts.sole = soleMat;

    const midGeo = new THREE.ExtrudeGeometry(buildSoleShape(THREE, st.soleWidth * 0.93), {
      depth: soleThickness * 0.35, bevelEnabled: true, bevelThickness: soleThickness * 0.08,
      bevelSize: 0.012, bevelSegments: 2, curveSegments: 28,
    });
    midGeo.rotateX(-Math.PI / 2);
    midGeo.translate(0, soleTopY, 0);
    const midMat = new THREE.MeshStandardMaterial({ color: 0xf3f1ea, roughness: 0.9 });
    const midsole = new THREE.Mesh(midGeo, midMat);
    midsole.castShadow = true; midsole.receiveShadow = true;
    group.add(midsole);
    const upperBaseY = soleTopY + soleThickness * 0.35;

    if (st.treadStyle === "lugs") {
      const lugMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.95 });
      for (let i = -1; i <= 1.2; i += 0.28) {
        const w = soleWidthEnvelope(i) * st.soleWidth;
        const lug = new THREE.Mesh(new THREE.BoxGeometry(0.12, soleThickness * 0.5, 0.62 * w), lugMat);
        lug.position.set(i, soleThickness * 0.08, 0);
        lug.castShadow = true;
        group.add(lug);
      }
    } else if (st.treadStyle === "lines") {
      const lineMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9 });
      for (let i = -1; i <= 1.2; i += 0.22) {
        const w = soleWidthEnvelope(i) * st.soleWidth;
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.035, soleThickness * 0.25, 0.55 * w), lineMat);
        line.position.set(i, soleThickness * 0.02, 0);
        group.add(line);
      }
    }

    // tight contact-darkening disc (extra grounding detail under the wide soft shadow)
    const aoTex = makeContactAOTexture(THREE);
    const aoMat = new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false });
    const aoDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.9 * st.soleWidth, 0.95 * st.soleWidth), aoMat);
    aoDisc.rotation.x = -Math.PI / 2;
    aoDisc.position.set(0.1, 0.0002, 0);
    group.add(aoDisc);

    const stations = stationsForStyle(st).map((s2) => ({ ...s2, base: upperBaseY }));
    const shellGeo = buildShellGeometry(THREE, stations);
    const matKind = st.material || "knit";
    const tex = makeFabricTexture(THREE, matKind);
    const matParams = {
      color: 0x0b0b0c, map: tex, bumpMap: tex, side: THREE.DoubleSide,
    };
    if (matKind === "leather") { matParams.roughness = 0.38; matParams.clearcoat = 0.5; matParams.clearcoatRoughness = 0.3; matParams.bumpScale = 0.006; matParams.metalness = 0.02; }
    else if (matKind === "rubber") { matParams.roughness = 0.95; matParams.clearcoat = 0; matParams.bumpScale = 0.01; matParams.metalness = 0; }
    else { matParams.roughness = 0.72; matParams.clearcoat = 0.08; matParams.clearcoatRoughness = 0.6; matParams.bumpScale = 0.008; matParams.metalness = 0.02; }
    const upperMat = new THREE.MeshPhysicalMaterial(matParams);
    const upper = new THREE.Mesh(shellGeo, upperMat);
    upper.castShadow = true; upper.receiveShadow = true;
    group.add(upper);
    parts.upper = upperMat;
    parts.upperTexture = tex;

    const throatMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, transparent: true, opacity: 0.55 });
    const throat = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.30), throatMat);
    throat.position.set(-0.44, upperBaseY + 0.20 * (0.35 + 0.65 * st.throatDip) + 0.02, 0);
    throat.rotation.x = -Math.PI / 2.35;
    group.add(throat);

    const tabMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.5 });
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.15 * st.collar, 0.2), tabMat);
    tab.position.set(-1.28, upperBaseY + 0.42 * st.collar, 0);
    tab.rotation.z = -0.18;
    tab.castShadow = true;
    group.add(tab);

    if (st.stripe) {
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.6 });
      [1, -1].forEach((side) => {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.11, 0.02), stripeMat);
        stripe.position.set(-0.05, upperBaseY + 0.22, side * (0.30 + 0.02));
        stripe.rotation.z = -0.05;
        group.add(stripe);
      });
    }

    const tongueMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.6, side: THREE.DoubleSide });
    if (st.laces) {
      const tongueH = 0.30 * (0.5 + 0.5 * st.throatDip);
      const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.42, tongueH, 0.05), tongueMat);
      tongue.position.set(-0.44, upperBaseY + 0.20 + tongueH * 0.42, 0);
      tongue.rotation.z = -0.5;
      tongue.castShadow = true;
      group.add(tongue);
    }
    parts.tongue = tongueMat;

    const laceMat = new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.8 });
    const eyeletMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.6 });
    if (st.laces) {
      const rows5 = 5;
      const eyeletPositions = [];
      for (let i = 0; i < rows5; i++) {
        const t = i / (rows5 - 1);
        eyeletPositions.push([-0.62 + t * 0.72, upperBaseY + 0.30 + t * 0.30]);
      }
      const zOffset = 0.30;
      const laceRadius = st.thinLaces ? 0.014 : 0.022;
      eyeletPositions.forEach(([x, y]) => {
        [1, -1].forEach((side) => {
          const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.012, 8, 16), eyeletMat);
          eyelet.position.set(x, y, side * zOffset * 0.9);
          eyelet.rotation.x = Math.PI / 2;
          group.add(eyelet);
        });
      });
      for (let i = 0; i < eyeletPositions.length - 1; i++) {
        const [x1, y1] = eyeletPositions[i], [x2, y2] = eyeletPositions[i + 1];
        const z1 = zOffset * 0.9, z2 = zOffset * 0.9;
        [
          [[x1, y1, z1], [x2, y2, -z2]],
          [[x1, y1, -z1], [x2, y2, z2]],
        ].forEach(([a, b]) => {
          const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
          const dir = new THREE.Vector3().subVectors(end, start);
          const len = dir.length();
          const lace = new THREE.Mesh(new THREE.CylinderGeometry(laceRadius, laceRadius, len, 8), laceMat);
          lace.position.copy(start).addScaledVector(dir, 0.5);
          lace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
          lace.castShadow = true;
          group.add(lace);
        });
      }
    }
    parts.laces = laceMat;

    const ground = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.ShadowMaterial({ opacity: 0.32 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.0001;
    ground.receiveShadow = true;
    group.add(ground);

    group.rotation.y = -0.5;
    group.position.y = -0.45;
    return { group, parts };
  }

  function createShoeScene(container, opts) {
    opts = opts || {};
    const THREE = global.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0.9, 1.15, 3.3);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const isSmallScreen = (global.innerWidth || 1024) < 640;
    const shadowRes = isSmallScreen ? 512 : 1024;

    scene.add(new THREE.AmbientLight(0xffffff, 0.42));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(2.2, 3.2, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(shadowRes, shadowRes);
    key.shadow.camera.left = -2; key.shadow.camera.right = 2;
    key.shadow.camera.top = 2; key.shadow.camera.bottom = -2;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcd8ff, 0.28);
    fill.position.set(-2.5, 1.2, -1.5);
    scene.add(fill);
    const rim = new THREE.PointLight(opts.accent || 0xd7ff3f, 0.5, 8);
    rim.position.set(-1.2, 1.4, -2.0);
    scene.add(rim);

    // ---- reflection floor: a faded, mirrored duplicate for a
    // showroom-glass look (cheap stand-in for a full HDRI environment) ----
    function buildReflection(sourceGroup) {
      const refl = sourceGroup.clone(true);
      refl.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = false;
          obj.receiveShadow = false;
          if (Array.isArray(obj.material)) {
            obj.material = obj.material.map((m) => m.clone());
            obj.material.forEach((m) => { m.transparent = true; m.opacity = 0.16; m.depthWrite = false; });
          } else if (obj.material) {
            obj.material = obj.material.clone();
            obj.material.transparent = true;
            obj.material.opacity = 0.16;
            obj.material.depthWrite = false;
          }
        }
      });
      refl.scale.y = -1;
      return refl;
    }

    let current = makeShoe(THREE, opts.style || "runner");
    scene.add(current.group);
    let reflection = buildReflection(current.group);
    reflection.position.copy(current.group.position);
    scene.add(reflection);
    function refreshReflection() {
      scene.remove(reflection);
      reflection = buildReflection(current.group);
      reflection.position.copy(current.group.position);
      scene.add(reflection);
    }

    let dragging = false, lastX = 0, lastY = 0, autoRotate = true;
    let targetRotX = current.group.rotation.x, rotX = current.group.rotation.x;

    function pointerDown(e) {
      dragging = true; autoRotate = false;
      const p = e.touches ? e.touches[0] : e;
      lastX = p.clientX; lastY = p.clientY;
    }
    function pointerMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - lastX, dy = p.clientY - lastY;
      lastX = p.clientX; lastY = p.clientY;
      current.group.rotation.y += dx * 0.01;
      targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX + dy * 0.006));
      e.preventDefault && e.preventDefault();
    }
    function pointerUp() {
      dragging = false;
      clearTimeout(pointerUp._t);
      pointerUp._t = setTimeout(() => { autoRotate = true; }, 2200);
    }
    container.style.touchAction = "none";
    container.addEventListener("pointerdown", pointerDown);
    global.addEventListener("pointermove", pointerMove);
    global.addEventListener("pointerup", pointerUp);
    container.addEventListener("touchstart", pointerDown, { passive: true });
    container.addEventListener("touchmove", pointerMove, { passive: false });
    container.addEventListener("touchend", pointerUp);

    function resize() {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new (global.ResizeObserver || function () { return { observe(){} }; })(resize);
    ro.observe(container);

    let raf;
    const reduceMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick() {
      raf = requestAnimationFrame(tick);
      if (autoRotate && !reduceMotion) current.group.rotation.y += 0.0025;
      rotX += (targetRotX - rotX) * 0.08;
      current.group.rotation.x = rotX;
      reflection.rotation.y = current.group.rotation.y;
      reflection.rotation.x = current.group.rotation.x;
      renderer.render(scene, camera);
    }
    tick();

    return {
      setColors: function (c) {
        if (c.upper) { current.parts.upper.color.set(c.upper); current.parts.tongue.color.set(c.upper); }
        if (c.sole) current.parts.sole.color.set(c.sole);
        if (c.laces) current.parts.laces.color.set(c.laces);
        refreshReflection();
      },
      setStyle: function (styleKey, colors) {
        const yaw = current.group.rotation.y;
        scene.remove(current.group);
        current = makeShoe(THREE, styleKey);
        current.group.rotation.y = yaw;
        scene.add(current.group);
        if (colors) this.setColors(colors);
        else refreshReflection();
      },
      listStyles: function () {
        return Object.keys(STYLES).map((key) => ({ key, label: STYLES[key].label }));
      },
      dispose: function () {
        cancelAnimationFrame(raf);
        ro.disconnect();
        global.removeEventListener("pointermove", pointerMove);
        global.removeEventListener("pointerup", pointerUp);
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      },
    };
  }

  global.StrideShoe3D = { createShoeScene: createShoeScene, STYLES: STYLES };
})(window);
