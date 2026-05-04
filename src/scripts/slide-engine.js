import gsap from 'gsap';

const COLORS = ['#6ee7b7', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#34d399'];

export function initSlides() {
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const totalEl = document.getElementById('scene-total');
  const currentEl = document.getElementById('scene-current');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dotsContainer = document.getElementById('progress-dots');

  if (!scenes.length) return;

  let current = 0;
  let busy = false;

  // Build progress dots
  scenes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to scene ${i + 1}`);
    dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); });
    dotsContainer?.appendChild(dot);
  });

  if (totalEl) totalEl.textContent = scenes.length;

  // Initial state: hide all except first
  gsap.set(scenes, { x: '100%', autoAlpha: 0, position: 'absolute' });
  gsap.set(scenes[0], { x: 0, autoAlpha: 1 });
  updateUI();
  runAnimation(scenes[0]);

  function go(direction) {
    goTo(current + direction);
  }

  function goTo(index) {
    if (busy || index === current || index < 0 || index >= scenes.length) return;
    busy = true;

    const direction = index > current ? 1 : -1;
    const outScene = scenes[current];
    const inScene = scenes[index];

    gsap.set(inScene, { x: direction * 100 + '%', autoAlpha: 1 });

    const tl = gsap.timeline({
      onComplete() {
        current = index;
        busy = false;
        updateUI();
        runAnimation(inScene);
      }
    });

    tl.to(outScene, { x: direction * -100 + '%', autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' })
      .to(inScene, { x: 0, duration: 0.55, ease: 'power2.inOut' }, '<');
  }

  function updateUI() {
    if (currentEl) currentEl.textContent = current + 1;

    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });

    if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.2' : '1';
    if (nextBtn) nextBtn.style.opacity = current === scenes.length - 1 ? '0.2' : '1';
  }

  // Keyboard and click navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
  });

  document.getElementById('slides-wrapper')?.addEventListener('click', e => {
    if (!e.target.closest('button')) go(1);
  });

  prevBtn?.addEventListener('click', e => { e.stopPropagation(); go(-1); });
  nextBtn?.addEventListener('click', e => { e.stopPropagation(); go(1); });
}

function runAnimation(scene) {
  const type = scene.dataset.animation;
  const visual = scene.querySelector('.scene-visual');
  if (type && animations[type]) animations[type](scene, visual);
}

const animations = {

  'title': (scene) => {
    const els = scene.querySelectorAll('.animate-in');
    gsap.fromTo(els,
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.18, ease: 'power3.out' }
    );
  },

  'foundation': (scene, visual) => {
    if (!visual) return;
    visual.innerHTML = `
      <svg viewBox="0 0 400 200" class="visual-svg">
        <circle class="logo-node" cx="80" cy="100" r="40" fill="#6ee7b7" opacity="0"/>
        <circle class="logo-node" cx="200" cy="100" r="40" fill="#60a5fa" opacity="0"/>
        <circle class="logo-node" cx="320" cy="100" r="40" fill="#f472b6" opacity="0"/>
        <text x="80" y="105" text-anchor="middle" fill="#0f0f0f" font-size="11" font-weight="700" class="logo-label" opacity="0">GPT</text>
        <text x="200" y="105" text-anchor="middle" fill="#0f0f0f" font-size="11" font-weight="700" class="logo-label" opacity="0">Claude</text>
        <text x="320" y="105" text-anchor="middle" fill="#0f0f0f" font-size="11" font-weight="700" class="logo-label" opacity="0">Gemini</text>
        <circle class="merged-node" cx="200" cy="100" r="55" fill="#6ee7b7" opacity="0"/>
        <text class="merged-label" x="200" y="105" text-anchor="middle" fill="#0f0f0f" font-size="13" font-weight="700" opacity="0">Transformer</text>
      </svg>`;

    const nodes = visual.querySelectorAll('.logo-node');
    const labels = visual.querySelectorAll('.logo-label');
    const merged = visual.querySelector('.merged-node');
    const mergedLabel = visual.querySelector('.merged-label');

    const tl = gsap.timeline();
    tl.to([...nodes, ...labels], { autoAlpha: 1, duration: 0.4, stagger: 0.2, ease: 'back.out(1.7)' })
      .to(nodes, { cx: 200, duration: 0.8, stagger: 0, ease: 'power2.inOut', delay: 0.6 })
      .to(labels, { autoAlpha: 0, duration: 0.3 }, '<')
      .to(nodes, { autoAlpha: 0, duration: 0.2 }, '-=0.1')
      .to([merged, mergedLabel], { autoAlpha: 1, duration: 0.4, ease: 'back.out(1.7)' });
  },

  'tokens': (scene, visual) => {
    if (!visual) return;
    const words = ['Hello', ',', ' world', '.', ' How', ' are', ' you', '?'];
    const html = words.map((w, i) =>
      `<span class="token-box" style="border-color:${COLORS[i % COLORS.length]};color:${COLORS[i % COLORS.length]}">${w.trim() || '&nbsp;'}</span>`
    ).join('');
    visual.innerHTML = `<div class="token-row">${html}</div><p class="visual-caption">Each chunk is one token. Roughly 4 characters.</p>`;

    const boxes = visual.querySelectorAll('.token-box');
    const caption = visual.querySelector('.visual-caption');
    gsap.fromTo(boxes,
      { scaleY: 0, autoAlpha: 0 },
      { scaleY: 1, autoAlpha: 1, duration: 0.35, stagger: 0.08, ease: 'back.out(1.7)' }
    );
    gsap.fromTo(caption, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: 1 });
  },

  'heatmap': (scene, visual) => {
    if (!visual) return;
    const tokens = ['The', 'bank', 'was', 'steep', 'and', 'muddy'];
    const weights = [
      [1.0, 0.1, 0.2, 0.1, 0.1, 0.1],
      [0.2, 1.0, 0.2, 0.8, 0.3, 0.7],
      [0.3, 0.2, 1.0, 0.3, 0.2, 0.2],
      [0.1, 0.6, 0.2, 1.0, 0.3, 0.4],
      [0.1, 0.2, 0.2, 0.2, 1.0, 0.3],
      [0.1, 0.5, 0.2, 0.4, 0.2, 1.0],
    ];

    const size = 44;
    const pad = 50;
    const total = tokens.length * size + pad;

    let svg = `<svg viewBox="0 0 ${total} ${total}" class="visual-svg heatmap-svg">`;

    // Column labels
    tokens.forEach((t, i) => {
      svg += `<text x="${pad + i * size + size / 2}" y="20" text-anchor="middle" font-size="9" fill="#888" transform="rotate(-30,${pad + i * size + size / 2},20)">${t}</text>`;
    });

    // Row labels + cells
    tokens.forEach((t, row) => {
      svg += `<text x="${pad - 6}" y="${pad + row * size + size / 2 + 4}" text-anchor="end" font-size="9" fill="#888">${t}</text>`;
      weights[row].forEach((w, col) => {
        const alpha = 0.1 + w * 0.9;
        const highlight = (row === 1 && (col === 3 || col === 5)) ? '#f472b6' : '#6ee7b7';
        svg += `<rect class="heatmap-cell" x="${pad + col * size + 2}" y="${pad + row * size + 2}" width="${size - 4}" height="${size - 4}" rx="3" fill="${highlight}" opacity="0" data-weight="${alpha}"/>`;
      });
    });

    svg += `</svg><p class="visual-caption">"bank" attends strongly to "steep" and "muddy"</p>`;
    visual.innerHTML = svg;

    const cells = visual.querySelectorAll('.heatmap-cell');
    gsap.to(cells, {
      opacity: (i) => parseFloat(cells[i].dataset.weight),
      duration: 0.3,
      stagger: { amount: 0.8, from: 'center' },
      ease: 'power2.out'
    });
    gsap.fromTo(visual.querySelector('.visual-caption'),
      { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: 1.2 }
    );
  },

  'sequential': (scene, visual) => {
    if (!visual) return;
    const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    const w = 60, gap = 10, y = 80, r = 18;
    const totalW = tokens.length * (w + gap);

    let svg = `<svg viewBox="0 0 ${totalW + 20} 160" class="visual-svg">`;
    tokens.forEach((t, i) => {
      const x = 10 + i * (w + gap);
      svg += `<rect class="seq-node" x="${x}" y="${y - r}" width="${w}" height="${r * 2}" rx="${r}" fill="#1a1a1a" stroke="#333" stroke-width="1.5"/>
              <text x="${x + w / 2}" y="${y + 5}" text-anchor="middle" font-size="11" fill="#888">${t}</text>`;
    });
    // Cursor arrow
    svg += `<polygon class="seq-cursor" points="0,-10 16,0 0,10" fill="#6ee7b7" transform="translate(10,${y - 35})"/>`;
    svg += `</svg><p class="visual-caption">One token at a time. Earlier context gets forgotten.</p>`;
    visual.innerHTML = svg;

    const cursor = visual.querySelector('.seq-cursor');
    gsap.fromTo(cursor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    gsap.to(cursor, {
      x: (tokens.length - 1) * (w + gap),
      duration: tokens.length * 0.5,
      ease: 'none',
      repeat: -1,
      delay: 0.3
    });
    gsap.fromTo(visual.querySelector('.visual-caption'),
      { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 0.8 }
    );
  },

  'parallel': (scene, visual) => {
    if (!visual) return;
    const tokens = ['The', 'cat', 'sat', 'on', 'mat'];
    const cx = [50, 130, 210, 290, 370];
    const cy = 90;

    let svg = `<svg viewBox="0 0 420 180" class="visual-svg">`;
    cx.forEach((x, i) => {
      cx.forEach((x2, j) => {
        if (i !== j) {
          const alpha = 0.15 + Math.random() * 0.25;
          svg += `<line class="par-line" x1="${x}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="#6ee7b7" stroke-width="1" opacity="0" data-alpha="${alpha}"/>`;
        }
      });
    });
    cx.forEach((x, i) => {
      svg += `<circle class="par-node" cx="${x}" cy="${cy}" r="22" fill="#1a1a1a" stroke="#6ee7b7" stroke-width="2" opacity="0"/>
              <text x="${x}" y="${cy + 5}" text-anchor="middle" font-size="10" fill="#e8e8e8" opacity="0" class="par-label">${tokens[i]}</text>`;
    });
    svg += `</svg><p class="visual-caption">Every token attends to every other token at once.</p>`;
    visual.innerHTML = svg;

    const nodes = visual.querySelectorAll('.par-node');
    const labels = visual.querySelectorAll('.par-label');
    const lines = visual.querySelectorAll('.par-line');

    const tl = gsap.timeline();
    tl.to([...nodes, ...labels], { autoAlpha: 1, duration: 0.3, stagger: 0.1, ease: 'back.out' })
      .to(lines, {
        opacity: (i) => parseFloat(lines[i].dataset.alpha),
        duration: 0.2,
        stagger: 0.02,
        ease: 'power2.out'
      });
    gsap.fromTo(visual.querySelector('.visual-caption'),
      { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 1.4 }
    );
  },

  'text-reveal': (scene) => {
    const els = scene.querySelectorAll('.animate-in');
    gsap.fromTo(els,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
  },

  'next': (scene) => {
    const els = scene.querySelectorAll('.animate-in');
    gsap.fromTo(els,
      { scale: 0.9, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' }
    );
  }
};
