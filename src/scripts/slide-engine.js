import gsap from 'gsap';

const COLORS = ['#6ee7b7', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#34d399', '#fbbf24', '#e879f9'];

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

  scenes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to scene ${i + 1}`);
    dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); });
    dotsContainer?.appendChild(dot);
  });

  if (totalEl) totalEl.textContent = scenes.length;

  gsap.set(scenes, { x: '100%', autoAlpha: 0, position: 'absolute' });
  gsap.set(scenes[0], { x: 0, autoAlpha: 1 });
  updateUI();
  runAnimation(scenes[0]);

  function go(direction) { goTo(current + direction); }

  function goTo(index) {
    if (busy || index === current || index < 0 || index >= scenes.length) return;
    busy = true;
    const direction = index > current ? 1 : -1;
    const outScene = scenes[current];
    const inScene = scenes[index];
    gsap.set(inScene, { x: direction * 100 + '%', autoAlpha: 1 });
    gsap.timeline({
      onComplete() { current = index; busy = false; updateUI(); runAnimation(inScene); }
    })
      .to(outScene, { x: direction * -100 + '%', autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' })
      .to(inScene, { x: 0, duration: 0.55, ease: 'power2.inOut' }, '<');
  }

  function updateUI() {
    if (currentEl) currentEl.textContent = current + 1;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.style.opacity = current === 0 ? '0.2' : '1';
    if (nextBtn) nextBtn.style.opacity = current === scenes.length - 1 ? '0.2' : '1';
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
  });
  document.getElementById('slides-wrapper')?.addEventListener('click', e => {
    if (!e.target.closest('button') && !e.target.closest('form') && !e.target.closest('input') && !e.target.closest('textarea')) go(1);
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
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.18, ease: 'power3.out' }
    );
  },

  'foundation': (scene, visual) => {
    if (!visual) return;
    visual.innerHTML = `
      <svg viewBox="0 0 340 480" class="visual-svg arch-svg">
        <!-- Transformer block -->
        <g class="arch-block" id="arch-output" opacity="0">
          <rect x="60" y="20" width="220" height="44" rx="8" fill="#1a1a1a" stroke="#6ee7b7" stroke-width="1.5"/>
          <text x="170" y="48" text-anchor="middle" font-size="13" fill="#6ee7b7" font-weight="700">Output Tokens</text>
        </g>
        <line class="arch-arrow" x1="170" y1="64" x2="170" y2="84" stroke="#333" stroke-width="1.5" marker-end="url(#arrow)" opacity="0"/>
        <g class="arch-block" id="arch-norm2" opacity="0">
          <rect x="80" y="84" width="180" height="38" rx="6" fill="#1a1a1a" stroke="#555" stroke-width="1"/>
          <text x="170" y="108" text-anchor="middle" font-size="11" fill="#888">Add &amp; Normalize</text>
        </g>
        <line class="arch-arrow" x1="170" y1="122" x2="170" y2="142" stroke="#333" stroke-width="1.5" opacity="0"/>
        <g class="arch-block" id="arch-ffn" opacity="0">
          <rect x="60" y="142" width="220" height="48" rx="8" fill="#1a2a1a" stroke="#34d399" stroke-width="1.5"/>
          <text x="170" y="162" text-anchor="middle" font-size="12" fill="#34d399" font-weight="600">Feed-Forward</text>
          <text x="170" y="178" text-anchor="middle" font-size="10" fill="#555">2-layer MLP, applied per token</text>
        </g>
        <line class="arch-arrow" x1="170" y1="190" x2="170" y2="210" stroke="#333" stroke-width="1.5" opacity="0"/>
        <g class="arch-block" id="arch-norm1" opacity="0">
          <rect x="80" y="210" width="180" height="38" rx="6" fill="#1a1a1a" stroke="#555" stroke-width="1"/>
          <text x="170" y="234" text-anchor="middle" font-size="11" fill="#888">Add &amp; Normalize</text>
        </g>
        <line class="arch-arrow" x1="170" y1="248" x2="170" y2="268" stroke="#333" stroke-width="1.5" opacity="0"/>
        <g class="arch-block" id="arch-attn" opacity="0">
          <rect x="40" y="268" width="260" height="58" rx="8" fill="#1a1525" stroke="#a78bfa" stroke-width="2"/>
          <text x="170" y="291" text-anchor="middle" font-size="13" fill="#a78bfa" font-weight="700">Multi-Head Attention</text>
          <text x="170" y="311" text-anchor="middle" font-size="10" fill="#666">Queries × Keys → Values</text>
        </g>
        <line class="arch-arrow" x1="170" y1="326" x2="170" y2="346" stroke="#333" stroke-width="1.5" opacity="0"/>
        <g class="arch-block" id="arch-embed" opacity="0">
          <rect x="60" y="346" width="220" height="48" rx="8" fill="#1a1a2a" stroke="#60a5fa" stroke-width="1.5"/>
          <text x="170" y="366" text-anchor="middle" font-size="12" fill="#60a5fa" font-weight="600">Token + Position</text>
          <text x="170" y="382" text-anchor="middle" font-size="10" fill="#555">Embedding (where + what)</text>
        </g>
        <line class="arch-arrow" x1="170" y1="394" x2="170" y2="414" stroke="#333" stroke-width="1.5" opacity="0"/>
        <g class="arch-block" id="arch-input" opacity="0">
          <rect x="80" y="414" width="180" height="38" rx="6" fill="#1a1a1a" stroke="#555" stroke-width="1"/>
          <text x="170" y="438" text-anchor="middle" font-size="11" fill="#888">Input Tokens</text>
        </g>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#333"/>
          </marker>
        </defs>
      </svg>`;

    const blocks = ['arch-input','arch-embed','arch-attn','arch-norm1','arch-ffn','arch-norm2','arch-output'];
    const arrows = visual.querySelectorAll('.arch-arrow');
    const tl = gsap.timeline();

    blocks.forEach((id, i) => {
      tl.to(`#${id}`, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, i * 0.22);
      if (i < arrows.length) tl.to(arrows[arrows.length - 1 - i], { autoAlpha: 1, duration: 0.2 }, i * 0.22 + 0.18);
    });

    // Pulse attention block
    tl.to('#arch-attn rect', { stroke: '#c4b5fd', strokeWidth: 3, duration: 0.4, repeat: 2, yoyo: true, ease: 'sine.inOut' }, '+=0.3');
  },

  'tokens': (scene, visual) => {
    if (!visual) return;
    const sentence = 'Transformers changed everything';
    const tokenData = [
      { text: 'Trans',       id: 8291,  color: COLORS[0] },
      { text: 'form',        id: 687,   color: COLORS[1] },
      { text: 'ers',         id: 874,   color: COLORS[2] },
      { text: ' changed',    id: 3421,  color: COLORS[3] },
      { text: ' every',      id: 790,   color: COLORS[4] },
      { text: 'thing',       id: 1976,  color: COLORS[5] },
    ];

    visual.innerHTML = `
      <div class="token-demo">
        <div class="token-original" id="tok-original">
          <span class="tok-label">Input text</span>
          <div class="tok-sentence">"${sentence}"</div>
        </div>
        <div class="tok-arrow-row" id="tok-split-arrow" style="opacity:0">▼ tokenize</div>
        <div class="token-row" id="tok-row" style="opacity:0">
          ${tokenData.map(t =>
            `<div class="token-unit" style="--c:${t.color}">
              <div class="token-text">${t.text.trim()}</div>
              <div class="token-id">${t.id}</div>
            </div>`
          ).join('')}
        </div>
        <div class="tok-note" id="tok-note" style="opacity:0">
          ${tokenData.length} tokens · Each becomes a number · ~4 chars per token
        </div>
        <div class="tok-vocab" id="tok-vocab" style="opacity:0">
          GPT-4 vocabulary: <strong>100,277 possible tokens</strong>
        </div>
      </div>`;

    const tl = gsap.timeline();
    tl.fromTo('#tok-original', { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 })
      .to('#tok-split-arrow', { autoAlpha: 1, duration: 0.4 }, '+=0.3')
      .to('#tok-row', { autoAlpha: 1, duration: 0.2 })
      .fromTo('#tok-row .token-unit',
        { scaleY: 0, autoAlpha: 0 },
        { scaleY: 1, autoAlpha: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)' }
      )
      .to('#tok-note', { autoAlpha: 1, duration: 0.4 }, '+=0.2')
      .to('#tok-vocab', { autoAlpha: 1, duration: 0.4 }, '+=0.3');
  },

  'heatmap': (scene, visual) => {
    if (!visual) return;
    const tokens = ['The', 'river', 'bank', 'was', 'steep', 'and', 'muddy'];
    // Attention weights for "bank" (row 2) attending to other tokens
    const weights = tokens.map((_, col) => {
      const row2weights = [0.04, 0.72, 1.0, 0.08, 0.81, 0.05, 0.68];
      const baseWeights = [
        [1.0, 0.1, 0.05, 0.3, 0.05, 0.1, 0.05],
        [0.1, 1.0, 0.4,  0.1, 0.3,  0.1, 0.3 ],
        row2weights,
        [0.3, 0.1, 0.05, 1.0, 0.1,  0.4, 0.1 ],
        [0.05,0.35,0.7,  0.1, 1.0,  0.1, 0.4 ],
        [0.1, 0.1, 0.05, 0.4, 0.1,  1.0, 0.2 ],
        [0.05,0.3, 0.6,  0.1, 0.45, 0.2, 1.0 ],
      ];
      return baseWeights.map(row => row[col]);
    });

    const cell = 48, pad = { left: 56, top: 56 };
    const svgW = pad.left + tokens.length * cell + 20;
    const svgH = pad.top + tokens.length * cell + 60;

    let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" class="visual-svg heatmap-svg">`;

    // Title
    svg += `<text x="${svgW / 2}" y="18" text-anchor="middle" font-size="10" fill="#555">Attention weights — which tokens each word focuses on</text>`;

    // Column headers
    tokens.forEach((t, i) => {
      const x = pad.left + i * cell + cell / 2;
      svg += `<text x="${x}" y="${pad.top - 8}" text-anchor="middle" font-size="10" fill="#666"
        transform="rotate(-35,${x},${pad.top - 8})">${t}</text>`;
    });

    // Row headers + cells
    tokens.forEach((t, row) => {
      const y = pad.top + row * cell;
      svg += `<text x="${pad.left - 8}" y="${y + cell / 2 + 4}" text-anchor="end" font-size="10"
        fill="${row === 2 ? '#a78bfa' : '#666'}" font-weight="${row === 2 ? '700' : '400'}">${t}</text>`;

      tokens.forEach((_, col) => {
        const w = weights[col][row];
        const isHighlight = row === 2 && (col === 1 || col === 4 || col === 6);
        const fillColor = isHighlight ? '#a78bfa' : row === 2 ? '#6ee7b7' : '#60a5fa';
        const opacity = 0.05 + w * 0.9;
        svg += `<rect class="hcell" x="${pad.left + col * cell + 1}" y="${y + 1}"
          width="${cell - 2}" height="${cell - 2}" rx="3"
          fill="${fillColor}" opacity="0" data-o="${opacity.toFixed(2)}"/>`;
        if (w > 0.5) {
          svg += `<text x="${pad.left + col * cell + cell / 2}" y="${y + cell / 2 + 4}"
            text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)" class="hval" opacity="0">${w.toFixed(2)}</text>`;
        }
      });
    });

    // Legend
    const lx = pad.left, ly = pad.top + tokens.length * cell + 16;
    svg += `<text x="${lx}" y="${ly}" font-size="9" fill="#444">Low attention</text>`;
    for (let i = 0; i < 10; i++) {
      svg += `<rect x="${lx + 90 + i * 14}" y="${ly - 10}" width="13" height="10" rx="2" fill="#60a5fa" opacity="${0.05 + i * 0.1}"/>`;
    }
    svg += `<text x="${lx + 90 + 10 * 14 + 4}" y="${ly}" font-size="9" fill="#444">High</text>`;

    svg += `</svg>
    <p class="visual-caption">Row "bank" lights up strongly on "river", "steep", "muddy" — context shapes meaning</p>`;
    visual.innerHTML = svg;

    const cells = visual.querySelectorAll('.hcell');
    const vals = visual.querySelectorAll('.hval');
    gsap.to(cells, {
      opacity: (i) => parseFloat(cells[i].dataset.o),
      duration: 0.25,
      stagger: { amount: 1.2, from: 'start', grid: [tokens.length, tokens.length] },
      ease: 'power1.out'
    });
    gsap.to(vals, { autoAlpha: 1, duration: 0.3, delay: 1.4, stagger: 0.05 });
    gsap.fromTo(visual.querySelector('.visual-caption'),
      { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: 2 }
    );
  },

  'sequential': (scene, visual) => {
    if (!visual) return;
    const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    const nodeW = 52, nodeH = 32, gap = 10;
    const totalW = tokens.length * (nodeW + gap);

    let html = `
      <div class="seq-demo">
        <div class="seq-label">Sequential (RNN-style)</div>
        <div class="seq-track">
          <svg viewBox="0 0 ${totalW + 20} 100" class="visual-svg seq-svg">`;

    tokens.forEach((t, i) => {
      const x = 10 + i * (nodeW + gap);
      html += `
        <rect class="seq-node" id="sn-${i}" x="${x}" y="30" width="${nodeW}" height="${nodeH}" rx="8"
          fill="#1a1a1a" stroke="#333" stroke-width="1.5" opacity="0.3"/>
        <text id="st-${i}" x="${x + nodeW / 2}" y="${30 + nodeH / 2 + 5}" text-anchor="middle"
          font-size="11" fill="#666">${t}</text>`;
      if (i < tokens.length - 1) {
        html += `<line id="sl-${i}" x1="${x + nodeW}" y1="${30 + nodeH / 2}" x2="${x + nodeW + gap}" y2="${30 + nodeH / 2}"
          stroke="#333" stroke-width="1.5" opacity="0.3" marker-end="url(#sarrow)"/>`;
      }
    });

    html += `
        <text class="step-counter" id="seq-step" x="${totalW / 2 + 10}" y="85" text-anchor="middle" font-size="10" fill="#555">Step 0 of ${tokens.length}</text>
        <defs>
          <marker id="sarrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa"/>
          </marker>
        </defs>
      </svg>
        </div>
        <div class="seq-note" id="seq-note" style="opacity:0">
          Each step can only see what came before. Context from step 1 is faint by step 6.
        </div>
        <div class="seq-complexity" id="seq-cmplx" style="opacity:0">
          Time complexity: <strong style="color:#f472b6">O(n)</strong> — grows linearly with sequence length
        </div>
      </div>`;

    visual.innerHTML = html;

    let step = 0;
    const stepEl = document.getElementById('seq-step');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    tokens.forEach((_, i) => {
      tl.to(`#sn-${i}`, { stroke: '#60a5fa', fill: '#0f1a2a', opacity: 1, duration: 0.3 })
        .to(`#st-${i}`, { fill: '#60a5fa', duration: 0.2 }, '<')
        .call(() => { if (stepEl) stepEl.textContent = `Step ${i + 1} of ${tokens.length}`; })
        .to({}, { duration: 0.25 });

      // Fade out earlier nodes to simulate forgetting
      if (i > 2) {
        tl.to(`#sn-${i - 3}`, { opacity: 0.15, stroke: '#222', duration: 0.4 }, '<')
          .to(`#st-${i - 3}`, { fill: '#333', duration: 0.3 }, '<');
      }
    });

    gsap.to('#seq-note', { autoAlpha: 1, duration: 0.4, delay: 0.5 });
    gsap.to('#seq-cmplx', { autoAlpha: 1, duration: 0.4, delay: 1 });
  },

  'parallel': (scene, visual) => {
    if (!visual) return;
    const tokens = ['The', 'cat', 'sat', 'on', 'mat'];
    const cx = [50, 120, 190, 260, 330];
    const cy = 80;

    let svg = `<svg viewBox="0 0 380 200" class="visual-svg par-svg">
      <text x="190" y="20" text-anchor="middle" font-size="11" fill="#555">All tokens connected simultaneously</text>`;

    // Draw all connection lines first
    cx.forEach((x, i) => {
      cx.forEach((x2, j) => {
        if (j > i) {
          const strength = 0.12 + Math.random() * 0.25;
          svg += `<line class="par-line" x1="${x}" y1="${cy}" x2="${x2}" y2="${cy}"
            stroke="#6ee7b7" stroke-width="${0.5 + strength * 2}" opacity="0" data-s="${strength.toFixed(2)}"/>`;
        }
      });
    });

    cx.forEach((x, i) => {
      svg += `
        <circle class="par-node" cx="${x}" cy="${cy}" r="26" fill="#0f1a14" stroke="#6ee7b7" stroke-width="2" opacity="0"/>
        <text class="par-label" x="${x}" y="${cy + 5}" text-anchor="middle" font-size="11" fill="#6ee7b7" font-weight="600" opacity="0">${tokens[i]}</text>`;
    });

    svg += `
      <text id="par-step" x="190" y="145" text-anchor="middle" font-size="11" fill="#6ee7b7" font-weight="700" opacity="0">1 step for all ${tokens.length} tokens</text>
      <text id="par-cmplx" x="190" y="165" text-anchor="middle" font-size="10" fill="#555" opacity="0">Time complexity: O(1) — constant regardless of length</text>
      <text id="par-reason" x="190" y="185" text-anchor="middle" font-size="10" fill="#555" opacity="0">This is why transformers can handle 100,000-token documents</text>
    </svg>`;

    visual.innerHTML = svg;

    const nodes = visual.querySelectorAll('.par-node');
    const labels = visual.querySelectorAll('.par-label');
    const lines = visual.querySelectorAll('.par-line');

    const tl = gsap.timeline();
    tl.to([...nodes, ...labels], { autoAlpha: 1, duration: 0.3, stagger: 0.08, ease: 'back.out' })
      .to(lines, {
        opacity: (i) => parseFloat(lines[i].dataset.s),
        duration: 0.08,
        stagger: 0.03,
        ease: 'power2.out'
      })
      .to('#par-step', { autoAlpha: 1, y: -4, duration: 0.4, ease: 'power2.out' })
      .to('#par-cmplx', { autoAlpha: 1, duration: 0.3 }, '+=0.1')
      .to('#par-reason', { autoAlpha: 1, duration: 0.3 }, '+=0.1');

    // Pulse lines to show "active attention"
    gsap.to(lines, {
      opacity: (i) => parseFloat(lines[i].dataset.s) * 1.8,
      duration: 1.2,
      stagger: { each: 0.05, repeat: -1, yoyo: true },
      delay: 1.5
    });
  },

  'text-reveal': (scene) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
  },

  'next': (scene) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { scale: 0.9, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' }
    );
  }
};
