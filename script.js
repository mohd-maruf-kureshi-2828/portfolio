(function initWebGLScene() {
  const canvas = document.getElementById("webglCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 9;

  const particleCount = window.innerWidth < 700 ? 400 : 900;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 6 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) - 6;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.035,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const geo1 = new THREE.IcosahedronGeometry(2.8, 1);
  const mat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.18 });
  const wire1 = new THREE.Mesh(geo1, mat1);
  scene.add(wire1);

  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    wire1.rotation.x = t * 0.06;
    wire1.rotation.y = t * 0.09;
    particles.rotation.y = t * 0.015;

    targetRotY += (mouseX * 0.25 - targetRotY) * 0.03;
    targetRotX += (mouseY * 0.15 - targetRotX) * 0.03;
    camera.position.x = targetRotY * 1.1;
    camera.position.y = -targetRotX * 1.1;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

(function initTilt() {
  const card = document.getElementById("tiltCard");
  if (!card) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const maxTilt = 3.5;
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * maxTilt * 2;
    const rotX = (0.5 - y) * maxTilt * 2;
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg)`;
  });
})();

(function initBgCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d");
  let W, H, DPR;
  const COLORS = { cyan: "56,189,248", violet: "167,139,250", green: "74,222,128" };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = window.innerWidth * DPR;
    H = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    setupRain();
    setupCircuits();
  }

  const CHARS = "01</>{}[]#$%&*+=~;:function()=>const let var".split("");
  let rainCols = [];
  function setupRain() {
    const fontSize = 15 * DPR;
    const colCount = Math.floor(W / (fontSize * 1.4));
    rainCols = new Array(colCount).fill(0).map(() => ({
      y: Math.random() * -H,
      speed: (0.6 + Math.random() * 1.6) * DPR,
      fontSize,
    }));
  }
  function drawRain() {
    ctx.font = `${rainCols[0]?.fontSize || 15}px 'JetBrains Mono', monospace`;
    rainCols.forEach((col, i) => {
      const x = i * (col.fontSize * 1.4);
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const alpha = 0.06 + Math.random() * 0.06;
      ctx.fillStyle = `rgba(${COLORS.cyan},${alpha})`;
      ctx.fillText(char, x, col.y);
      col.y += col.speed;
      if (col.y > H + 40) col.y = Math.random() * -200;
    });
  }

  let circuits = [];
  function setupCircuits() {
    circuits = [];
    const count = Math.max(5, Math.floor(W / (280 * DPR)));
    for (let i = 0; i < count; i++) {
      const points = [];
      let x = Math.random() * W;
      let y = Math.random() * H;
      const segs = 3 + Math.floor(Math.random() * 3);
      points.push({ x, y });
      for (let s = 0; s < segs; s++) {
        if (Math.random() > 0.5) x += (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 120) * DPR;
        else y += (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 120) * DPR;
        points.push({ x, y });
      }
      circuits.push({
        points,
        color: Math.random() > 0.5 ? COLORS.cyan : COLORS.violet,
        t: Math.random(),
        speed: 0.0016 + Math.random() * 0.0022,
      });
    }
  }
  function pointOnPath(points, t) {
    const totalSegs = points.length - 1;
    const segF = t * totalSegs;
    const idx = Math.min(Math.floor(segF), totalSegs - 1);
    const localT = segF - idx;
    const p1 = points[idx];
    const p2 = points[idx + 1];
    return { x: p1.x + (p2.x - p1.x) * localT, y: p1.y + (p2.y - p1.y) * localT };
  }
  function drawCircuits() {
    circuits.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let i = 1; i < c.points.length; i++) ctx.lineTo(c.points[i].x, c.points[i].y);
      ctx.strokeStyle = `rgba(${c.color},0.10)`;
      ctx.lineWidth = 1.2 * DPR;
      ctx.stroke();
      c.points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.color},0.25)`;
        ctx.fill();
      });
      const pos = pointOnPath(c.points, c.t);
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8 * DPR);
      grad.addColorStop(0, `rgba(${c.color},0.9)`);
      grad.addColorStop(1, `rgba(${c.color},0)`);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8 * DPR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      c.t += c.speed;
      if (c.t > 1) c.t = 0;
    });
  }

  let particles = [];
  function setupParticles() {
    const count = Math.floor((W * H) / (26000 * DPR * DPR));
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: (0.6 + Math.random() * 1.6) * DPR,
      speedY: (0.05 + Math.random() * 0.15) * DPR,
      alpha: 0.15 + Math.random() * 0.25,
    }));
  }
  function drawParticles() {
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLORS.green},${p.alpha})`;
      ctx.fill();
      p.y -= p.speedY;
      if (p.y < 0) p.y = H;
    });
  }

  function frame() {
    ctx.fillStyle = "rgba(6,9,17,0.16)";
    ctx.fillRect(0, 0, W, H);
    drawCircuits();
    drawRain();
    drawParticles();
    requestAnimationFrame(frame);
  }

  resize();
  setupParticles();
  window.addEventListener("resize", () => {
    resize();
    setupParticles();
  });
  requestAnimationFrame(frame);
})();

const ua = navigator.userAgent || navigator.vendor || window.opera;
const isInstagram = ua.indexOf("Instagram") > -1;
if (isInstagram) {
  const banner = document.getElementById("chromeBanner");
  if (banner) banner.style.display = "block";
}

const nameEl = document.getElementById("typedName");
const fullName = "Mohamed Maruf Kureshi";
if (nameEl) {
  let i = 0;
  function typeName() {
    if (i <= fullName.length) {
      nameEl.textContent = fullName.slice(0, i);
      i++;
      setTimeout(typeName, 65);
    }
  }
  typeName();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".section").forEach((sec) => revealObserver.observe(sec));

const tabSections = document.querySelectorAll("section[id]");
const tabs = document.querySelectorAll(".tab[data-tab]");
window.addEventListener("scroll", () => {
  let current = "";
  tabSections.forEach((sec) => {
    const top = sec.offsetTop - 140;
    if (window.scrollY >= top) current = sec.getAttribute("id");
  });
  tabs.forEach((t) => {
    t.classList.toggle("active", t.getAttribute("href") === "#" + current);
  });
});

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileClose");
if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener("click", () => mobileMenu.classList.add("open"));
  mobileClose.addEventListener("click", () => mobileMenu.classList.remove("open"));
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => mobileMenu.classList.remove("open"))
  );
}

// ===== Scroll progress bar =====
(function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + "%";
  });
})();

// ===== Light / Dark mode toggle =====
(function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const saved = localStorage.getItem("theme") || "dark";
  root.setAttribute("data-theme", saved);
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

// ===== Close / reopen the terminal window (shows the name in its place) =====
(function initTerminalClose() {
  const terminal = document.getElementById("tiltCard");
  const closeBtn = document.getElementById("terminalCloseBtn");
  const reopenBtn = document.getElementById("reopenTerminalBtn");
  const reveal = document.getElementById("closedNameReveal");
  const revealText = document.getElementById("closedNameText");
  if (!terminal || !closeBtn || !reopenBtn || !reveal || !revealText) return;

  const fullName = "Mohamed Maruf Kureshi";
  let typeTimer = null;

  function typeReveal() {
    let i = 0;
    revealText.textContent = "";
    clearTimeout(typeTimer);
    function step() {
      if (i <= fullName.length) {
        revealText.textContent = fullName.slice(0, i);
        i++;
        typeTimer = setTimeout(step, 60);
      }
    }
    step();
  }

  function closeTerminal() {
    terminal.classList.add("closing");
    terminal.addEventListener(
      "animationend",
      () => {
        terminal.classList.add("hidden-window");
        reopenBtn.classList.add("show");
        reveal.classList.add("show");
        typeReveal();
      },
      { once: true }
    );
  }

  function reopenTerminal() {
    terminal.classList.remove("hidden-window", "closing");
    reopenBtn.classList.remove("show");
    reveal.classList.remove("show");
    clearTimeout(typeTimer);
    revealText.textContent = "";
  }

  closeBtn.addEventListener("click", closeTerminal);
  closeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      closeTerminal();
    }
  });
  reopenBtn.addEventListener("click", reopenTerminal);
})();

const backTop = document.getElementById("backTop");
if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("show", window.scrollY > 500);
  });
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
