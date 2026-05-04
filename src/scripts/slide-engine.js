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

  'hero': (scene, visual) => {
    // Animate the scene text first
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.14, ease: 'power3.out' }
    );

    if (!visual) return;

    const userMsg = "Tell me a story about a girl who finds a door in her closet.";
    const claudeMsg = "Once upon a time, there was a curious girl named Maya. On her seventh birthday, she discovered a small wooden door at the back of her closet. It was no bigger than a book. When she pressed her hand against it, the door creaked open.";

    const words = claudeMsg.split(' ');
    const wordsHtml = words.map((w, i) =>
      `<span class="hero-word">${w}${i < words.length - 1 ? ' ' : ''}</span>`
    ).join('');

    visual.innerHTML = `
      <div class="chat-ui">
        <div class="chat-bubble user" id="hero-user">
          <span class="bubble-label">You</span>
          <p class="bubble-text">${userMsg}</p>
        </div>
        <div class="chat-bubble claude" id="hero-claude">
          <span class="bubble-label">Claude</span>
          <div class="typing-indicator" id="hero-typing">
            <span></span><span></span><span></span>
          </div>
          <div class="bubble-text" id="hero-claude-text" style="display:none">${wordsHtml}</div>
        </div>
      </div>`;

    gsap.set('#hero-user', { autoAlpha: 0, y: 14 });
    gsap.set('#hero-claude', { autoAlpha: 0, y: 14 });
    gsap.set(visual.querySelectorAll('.hero-word'), { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: 0.6 });
    tl.to('#hero-user',   { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to({}, { duration: 0.5 })
      .to('#hero-claude', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' })
      .to({}, { duration: 1.0 })
      .set('#hero-typing', { display: 'none' })
      .set('#hero-claude-text', { display: 'block' })
      .to(visual.querySelectorAll('.hero-word'), {
        autoAlpha: 1,
        duration: 0.04,
        stagger: 0.05,
        ease: 'none'
      });
  },

  'neural-net': (scene, visual) => {
    // Run text reveal first
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const layers = [
      { label: 'Tokens',       color: '#60a5fa', y: 360 },
      { label: 'Embedding',    color: '#6ee7b7', y: 305 },
      { label: 'Attention',    color: '#a78bfa', y: 250 },
      { label: 'Feed-Forward', color: '#f472b6', y: 195 },
      { label: 'Attention',    color: '#a78bfa', y: 140 },
      { label: 'Feed-Forward', color: '#f472b6', y: 85  },
    ];
    const xs = [70, 110, 150, 190];
    const outputs = [
      { word: 'Once',  prob: 0.42 },
      { word: 'There', prob: 0.18 },
      { word: 'A',     prob: 0.12 },
      { word: 'It',    prob: 0.08 },
      { word: 'In',    prob: 0.05 },
    ];

    let svg = `<svg viewBox="0 0 280 400" class="visual-svg neural-svg">`;

    // Connections (drawn first, behind nodes)
    for (let l = 0; l < layers.length - 1; l++) {
      xs.forEach((x1) => {
        xs.forEach((x2) => {
          svg += `<line class="nn-line" data-from="${l}"
            x1="${x1}" y1="${layers[l].y}"
            x2="${x2}" y2="${layers[l + 1].y}"
            stroke="#1f1f1f" stroke-width="0.6" opacity="0.5"/>`;
        });
      });
    }

    // Fan-out lines from top transformer layer to output bars
    const outBaseY = 32;
    const outSpacing = 42;
    const outStartX = 40;
    xs.forEach((x1) => {
      outputs.forEach((_, j) => {
        const x2 = outStartX + j * outSpacing + 16;
        svg += `<line class="nn-fan"
          x1="${x1}" y1="${layers[layers.length - 1].y}"
          x2="${x2}" y2="${outBaseY + 32}"
          stroke="#6ee7b7" stroke-width="0.5" opacity="0"/>`;
      });
    });

    // Layer nodes + labels
    layers.forEach((layer, i) => {
      xs.forEach((x) => {
        svg += `<circle class="nn-node" data-layer="${i}"
          cx="${x}" cy="${layer.y}" r="6"
          fill="${layer.color}" opacity="0.18"/>`;
      });
      svg += `<text class="nn-label" data-layer="${i}"
        x="270" y="${layer.y + 4}" text-anchor="end"
        font-size="9" fill="${layer.color}" opacity="0">${layer.label}</text>`;
    });

    // Output probability bars
    outputs.forEach((o, i) => {
      const x = outStartX + i * outSpacing;
      const maxBarH = 28;
      const h = o.prob / outputs[0].prob * maxBarH;
      svg += `<rect class="prob-bar" data-i="${i}"
        x="${x}" y="${outBaseY + 32 - h}" width="32" height="${h}"
        rx="2" fill="#6ee7b7" opacity="0"/>`;
      svg += `<text class="prob-word"
        x="${x + 16}" y="${outBaseY + 46}" text-anchor="middle"
        font-size="8.5" fill="#888" opacity="0">${o.word}</text>`;
      svg += `<text class="prob-pct"
        x="${x + 16}" y="${outBaseY + 32 - h - 4}" text-anchor="middle"
        font-size="8" fill="${i === 0 ? '#6ee7b7' : '#555'}" opacity="0">${(o.prob * 100).toFixed(0)}%</text>`;
    });

    // Output label
    svg += `<text x="270" y="${outBaseY + 36}" text-anchor="end"
      font-size="9" fill="#6ee7b7" opacity="0" class="nn-out-label">Next-token probability</text>`;

    svg += `</svg>
    <p class="visual-caption">Each layer reshapes the signal. The top emits a probability for every possible next word.</p>`;

    visual.innerHTML = svg;

    // Animation timeline
    const tl = gsap.timeline({ delay: 0.5 });
    const layerStep = 0.45;

    layers.forEach((layer, i) => {
      const at = i * layerStep;
      // Light up nodes
      tl.to(`.nn-node[data-layer="${i}"]`,
        { opacity: 1, duration: 0.25, ease: 'power2.out' }, at);
      tl.to(`.nn-label[data-layer="${i}"]`,
        { opacity: 0.85, duration: 0.2 }, at + 0.05);

      // Pulse and brighten connections to next layer
      if (i < layers.length - 1) {
        tl.to(`.nn-line[data-from="${i}"]`, {
          opacity: 0.55,
          stroke: layer.color,
          duration: 0.35,
          stagger: { each: 0.005, from: 'random' }
        }, at + 0.15);
        // Decay back to baseline
        tl.to(`.nn-line[data-from="${i}"]`, {
          opacity: 0.18,
          duration: 0.5
        }, at + 0.55);
      }
    });

    // Output reveal
    const outDelay = layers.length * layerStep + 0.1;
    tl.to('.nn-fan', { opacity: 0.4, duration: 0.4, stagger: 0.005 }, outDelay)
      .to('.nn-out-label', { opacity: 0.85, duration: 0.3 }, outDelay + 0.2)
      .to('.prob-bar', {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(1.4)'
      }, outDelay + 0.3)
      .to('.prob-word', { opacity: 1, duration: 0.3, stagger: 0.04 }, outDelay + 0.5)
      .to('.prob-pct',  { opacity: 1, duration: 0.3, stagger: 0.04 }, outDelay + 0.6)
      .to('.nn-fan', { opacity: 0.18, duration: 0.6 }, outDelay + 0.9);
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

  'embeddings': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const words = [
      { word: 'door',    x: 100, y: 165, color: '#6ee7b7' },
      { word: 'gate',    x: 70,  y: 195, color: '#6ee7b7' },
      { word: 'window',  x: 130, y: 145, color: '#6ee7b7' },
      { word: 'tuesday', x: 245, y: 90,  color: '#a78bfa' },
      { word: 'monday',  x: 270, y: 115, color: '#a78bfa' },
    ];

    const sample = [0.42, -0.18, 0.91, 0.05, -0.33, 0.77, 0.62, -0.45, 0.12, 0.28];

    visual.innerHTML = `
      <svg viewBox="0 0 320 280" class="visual-svg embed-svg">
        <!-- Cluster regions (behind dots) -->
        <ellipse class="cluster-region" id="cluster-1"
          cx="100" cy="170" rx="55" ry="40" fill="#6ee7b7" opacity="0"/>
        <ellipse class="cluster-region" id="cluster-2"
          cx="258" cy="102" rx="40" ry="28" fill="#a78bfa" opacity="0"/>

        <!-- Phase 1: "door" word and embedding numbers -->
        <text id="emb-word-init" x="160" y="70" text-anchor="middle"
          font-size="22" font-weight="700" fill="#6ee7b7" opacity="0">door</text>
        <text id="emb-bracket-l" x="22" y="115" font-size="16" fill="#555" opacity="0">[</text>
        <text id="emb-bracket-r" x="298" y="115" font-size="16" fill="#555" opacity="0">]</text>
        ${sample.map((n, i) => `
          <text class="emb-num" data-i="${i}"
            x="${36 + i * 26}" y="115"
            font-size="9" fill="#888" font-family="monospace" opacity="0">${n.toFixed(2)}</text>
        `).join('')}

        <!-- Captions -->
        <text id="emb-caption-1" x="160" y="148" text-anchor="middle"
          font-size="10" fill="#666" opacity="0">A list of numbers</text>
        <text id="emb-caption-2" x="160" y="163" text-anchor="middle"
          font-size="10" fill="#666" opacity="0">becomes a point in space</text>

        <!-- Phase 2: dots and labels -->
        ${words.map((w, i) => `
          <circle class="emb-dot" data-i="${i}"
            cx="${w.x}" cy="${w.y}" r="5" fill="${w.color}" opacity="0"/>
          <text class="emb-label" data-i="${i}"
            x="${w.x}" y="${w.y - 9}" text-anchor="middle"
            font-size="10" fill="${w.color}" opacity="0">${w.word}</text>
        `).join('')}

        <!-- Cluster labels -->
        <text id="cluster-label-1" x="100" y="230" text-anchor="middle"
          font-size="9" fill="#6ee7b7" opacity="0" font-weight="600">openings</text>
        <text id="cluster-label-2" x="258" y="148" text-anchor="middle"
          font-size="9" fill="#a78bfa" opacity="0" font-weight="600">days</text>

        <!-- Distance indicator -->
        <line id="dist-line" x1="100" y1="165" x2="245" y2="90"
          stroke="#444" stroke-width="0.5" stroke-dasharray="3,3" opacity="0"/>
        <text id="dist-label" x="170" y="118" text-anchor="middle"
          font-size="8" fill="#555" opacity="0">far apart</text>
      </svg>
      <p class="visual-caption">Door and gate live in the same neighborhood. Door and tuesday live in different cities.</p>`;

    const tl = gsap.timeline({ delay: 0.5 });

    // Phase 1: word and numbers
    tl.to('#emb-word-init', { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .to(['#emb-bracket-l', '#emb-bracket-r'], { opacity: 1, duration: 0.3 }, '+=0.2')
      .to('.emb-num', { opacity: 1, duration: 0.05, stagger: 0.05, ease: 'none' })
      .to({}, { duration: 0.5 })

      // Phase 2: caption
      .to(['#emb-caption-1', '#emb-caption-2'], { opacity: 1, duration: 0.4, stagger: 0.15 })
      .to({}, { duration: 0.6 })

      // Phase 3: collapse — numbers fade, word fades, door dot appears at its position
      .to(['.emb-num', '#emb-bracket-l', '#emb-bracket-r'], { opacity: 0, duration: 0.4 })
      .to(['#emb-caption-1', '#emb-caption-2'], { opacity: 0, duration: 0.3 }, '<')
      .to('#emb-word-init', { opacity: 0, duration: 0.3 }, '<0.1')
      .to('.emb-dot[data-i="0"]', {
        opacity: 1, duration: 0.5, ease: 'back.out(1.7)'
      }, '<0.1')
      .to('.emb-label[data-i="0"]', { opacity: 1, duration: 0.3 }, '<0.15')

      // Phase 4: other words pop in (cluster 1 first, then cluster 2)
      .to('.emb-dot[data-i="1"]',   { opacity: 1, duration: 0.35, ease: 'back.out' }, '+=0.25')
      .to('.emb-label[data-i="1"]', { opacity: 1, duration: 0.25 }, '<0.1')
      .to('.emb-dot[data-i="2"]',   { opacity: 1, duration: 0.35, ease: 'back.out' }, '+=0.15')
      .to('.emb-label[data-i="2"]', { opacity: 1, duration: 0.25 }, '<0.1')
      .to('.emb-dot[data-i="3"]',   { opacity: 1, duration: 0.4, ease: 'back.out' }, '+=0.3')
      .to('.emb-label[data-i="3"]', { opacity: 1, duration: 0.25 }, '<0.1')
      .to('.emb-dot[data-i="4"]',   { opacity: 1, duration: 0.35, ease: 'back.out' }, '+=0.15')
      .to('.emb-label[data-i="4"]', { opacity: 1, duration: 0.25 }, '<0.1')

      // Phase 5: clusters and distance line
      .to('#cluster-1', { opacity: 0.1, duration: 0.5 }, '+=0.3')
      .to('#cluster-2', { opacity: 0.1, duration: 0.5 }, '<')
      .to('#cluster-label-1', { opacity: 0.85, duration: 0.4 }, '<0.2')
      .to('#cluster-label-2', { opacity: 0.85, duration: 0.4 }, '<')
      .to('#dist-line',  { opacity: 0.5, duration: 0.4 }, '+=0.2')
      .to('#dist-label', { opacity: 0.7, duration: 0.4 }, '<0.1');
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
    const tokens = ['girl', 'who', 'finds', 'a', 'door', 'in', 'closet'];
    // Attention weights for "door" (row 4) attending to other tokens
    const weights = tokens.map((_, col) => {
      const row4weights = [0.85, 0.10, 0.78, 0.05, 1.0, 0.15, 0.92];
      const baseWeights = [
        [1.0, 0.15, 0.7,  0.1, 0.6,  0.1, 0.45],
        [0.4, 1.0,  0.3,  0.1, 0.2,  0.1, 0.2 ],
        [0.7, 0.2,  1.0,  0.1, 0.65, 0.1, 0.55],
        [0.1, 0.05, 0.15, 1.0, 0.4,  0.2, 0.3 ],
        row4weights,
        [0.1, 0.05, 0.1,  0.2, 0.6,  1.0, 0.7 ],
        [0.55,0.15, 0.5,  0.1, 0.85, 0.5, 1.0 ],
      ];
      return baseWeights.map(row => row[col]);
    });

    const cell = 48, pad = { left: 56, top: 56 };
    const svgW = pad.left + tokens.length * cell + 20;
    const svgH = pad.top + tokens.length * cell + 60;

    let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" class="visual-svg heatmap-svg">`;

    // Title
    svg += `<text x="${svgW / 2}" y="18" text-anchor="middle" font-size="10" fill="#555">Attention weights. Which tokens each word focuses on.</text>`;

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
        fill="${row === 4 ? '#a78bfa' : '#666'}" font-weight="${row === 4 ? '700' : '400'}">${t}</text>`;

      tokens.forEach((_, col) => {
        const w = weights[col][row];
        const isHighlight = row === 4 && (col === 0 || col === 2 || col === 6);
        const fillColor = isHighlight ? '#a78bfa' : row === 4 ? '#6ee7b7' : '#60a5fa';
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
    <p class="visual-caption">Row "door" lights up strongly on "girl", "finds", "closet". Context shapes meaning.</p>`;
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

  'context-window': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const promptTokens = ['Tell','me','a','story','about','a','girl','who','finds','a','door','in','closet'];
    const generatedCount = 81;
    const totalCount = promptTokens.length + generatedCount;

    const promptW = 24;
    const promptGap = 2;
    const promptStartX = 8;
    const promptEndX = promptStartX + promptTokens.length * (promptW + promptGap);
    const genW = 2.5;
    const genGap = 0.5;
    const genStartX = promptEndX + 6;
    const genEndX = genStartX + generatedCount * (genW + genGap);

    let svg = `<svg viewBox="0 0 380 230" class="visual-svg ctx-svg">`;

    // Prompt tokens (with text)
    promptTokens.forEach((t, i) => {
      const x = promptStartX + i * (promptW + promptGap);
      svg += `<rect class="ctx-prompt" data-i="${i}"
        x="${x}" y="105" width="${promptW}" height="22" rx="3"
        fill="#1a2a1a" stroke="#6ee7b7" stroke-width="1.2" opacity="0"/>`;
      svg += `<text class="ctx-prompt-text" data-i="${i}"
        x="${x + promptW / 2}" y="120" text-anchor="middle"
        font-size="6.5" fill="#6ee7b7" font-weight="600" opacity="0">${t}</text>`;
    });

    // Generated tokens (small bars)
    for (let i = 0; i < generatedCount; i++) {
      const x = genStartX + i * (genW + genGap);
      svg += `<rect class="ctx-gen" data-i="${i}"
        x="${x}" y="105" width="${genW}" height="22" rx="0.5"
        fill="#a78bfa" opacity="0"/>`;
    }

    // Counter
    svg += `<text id="ctx-count" x="190" y="56" text-anchor="middle"
      font-size="32" fill="#e8e8e8" font-weight="800">0</text>`;
    svg += `<text x="190" y="78" text-anchor="middle"
      font-size="11" fill="#666">tokens Claude can see</text>`;

    // Bracket spanning everything
    const bracketY = 95;
    const bracketStartX = promptStartX - 4;
    svg += `<path id="ctx-bracket"
      d="M ${bracketStartX} ${bracketY + 6} L ${bracketStartX} ${bracketY} L ${genEndX} ${bracketY} L ${genEndX} ${bracketY + 6}"
      fill="none" stroke="#444" stroke-width="1" opacity="0"/>`;

    // Section labels
    svg += `<text id="ctx-prompt-label" x="${(promptStartX + promptEndX) / 2}" y="148"
      text-anchor="middle" font-size="9" fill="#6ee7b7" opacity="0">Your prompt</text>`;
    svg += `<text id="ctx-gen-label" x="${(genStartX + genEndX) / 2}" y="148"
      text-anchor="middle" font-size="9" fill="#a78bfa" opacity="0">Generated by Claude</text>`;

    svg += `<text id="ctx-final" x="190" y="190" text-anchor="middle"
      font-size="10" fill="#888" opacity="0" font-weight="600">Nothing disappears. Nothing is forgotten.</text>`;

    svg += `</svg>
    <p class="visual-caption">By the end, Claude is attending to all ${totalCount} tokens at once.</p>`;

    visual.innerHTML = svg;

    // Counter object for animated number
    const counter = { val: 0 };
    const setCount = () => {
      const el = document.getElementById('ctx-count');
      if (el) el.textContent = Math.round(counter.val);
    };

    const tl = gsap.timeline({ delay: 0.4 });

    // Phase 1: prompt tokens
    tl.to('.ctx-prompt',      { opacity: 1, duration: 0.25, stagger: 0.04 })
      .to('.ctx-prompt-text', { opacity: 1, duration: 0.2, stagger: 0.04 }, '<')
      .to(counter, { val: promptTokens.length, duration: 0.5, ease: 'none', onUpdate: setCount }, '<')
      .to('#ctx-prompt-label', { opacity: 0.85, duration: 0.4 }, '+=0.1')
      .to({}, { duration: 0.4 });

    // Phase 2: generated tokens stream in + counter ticks up
    tl.to('#ctx-gen-label', { opacity: 0.85, duration: 0.3 })
      .to('.ctx-gen', { opacity: 1, duration: 0.04, stagger: 0.018, ease: 'none' }, '+=0.1')
      .to(counter, { val: totalCount, duration: 1.5, ease: 'none', onUpdate: setCount }, '<');

    // Phase 3: bracket and final caption
    tl.to('#ctx-bracket', { opacity: 0.7, duration: 0.5 }, '+=0.3')
      .to('#ctx-final',   { opacity: 0.9, duration: 0.5 }, '+=0.2');
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

  'patterns': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const stories = [
      'The Lion, the Witch and the Wardrobe',
      'Coraline',
      'Through the Looking Glass',
      'Alice in Wonderland',
      'The Secret Garden',
      'A Wrinkle in Time',
      'Bridge to Terabithia',
      'Where the Wild Things Are',
      "Howl's Moving Castle",
      'The Phantom Tollbooth',
      'The Neverending Story',
      'Spirited Away',
    ];

    // Active pattern through network — preset path
    const activeNodes = { 0: [0, 2, 3], 1: [1, 2], 2: [0, 2] };
    const isNodeActive = (l, i) => activeNodes[l]?.includes(i);
    const isLineActive = (l, i, j) => isNodeActive(l, i) && isNodeActive(l + 1, j);

    const nnYs = [200, 235, 270];
    const nnXs = [105, 135, 165, 195];

    let svg = `<svg viewBox="0 0 320 360" class="visual-svg patterns-svg">
      <defs>
        <clipPath id="scroll-clip">
          <rect x="14" y="36" width="292" height="68"/>
        </clipPath>
      </defs>

      <!-- Training data window -->
      <rect x="10" y="10" width="300" height="100" fill="#0f0f0f" stroke="#1a1a1a" rx="6"/>
      <text x="20" y="26" font-size="8" fill="#555" letter-spacing="1">TRAINING DATA</text>
      <g clip-path="url(#scroll-clip)">
        <g id="scroll-content">
          ${stories.map((s, i) =>
            `<text x="20" y="${52 + i * 22}" font-size="11" fill="#666" font-style="italic">${s}</text>`
          ).join('')}
        </g>
      </g>

      <!-- Pattern label and arrow -->
      <text id="pat-focus" x="160" y="138" text-anchor="middle"
        font-size="13" fill="#6ee7b7" font-weight="700" opacity="0">girl + door + adventure</text>
      <text id="pat-arrow" x="160" y="158" text-anchor="middle"
        font-size="9" fill="#555" opacity="0">activates these weights</text>

      <!-- Neural network connections -->
      ${[0, 1].flatMap(l =>
        nnXs.flatMap((x1, i) =>
          nnXs.map((x2, j) =>
            `<line class="pat-line ${isLineActive(l, i, j) ? 'active' : ''}"
              x1="${x1}" y1="${nnYs[l]}"
              x2="${x2}" y2="${nnYs[l + 1]}"
              stroke="#1f1f1f" stroke-width="0.6" opacity="0"/>`
          )
        )
      ).join('')}

      <!-- Neural network nodes -->
      ${nnYs.flatMap((y, l) =>
        nnXs.map((x, i) =>
          `<circle class="pat-node ${isNodeActive(l, i) ? 'active' : ''}"
            cx="${x}" cy="${y}" r="6"
            fill="${isNodeActive(l, i) ? '#6ee7b7' : '#1a1a1a'}"
            stroke="${isNodeActive(l, i) ? '#6ee7b7' : '#2a2a2a'}" stroke-width="1.2"
            opacity="0"/>`
        )
      ).join('')}

      <!-- Output sentence -->
      <text id="pat-out-label" x="160" y="312" text-anchor="middle"
        font-size="8" fill="#444" letter-spacing="1" opacity="0">GENERATED</text>
      <text id="pat-out-text" x="160" y="332" text-anchor="middle"
        font-size="10" fill="#a78bfa" font-style="italic" opacity="0">She hesitated, her hand trembling</text>
      <text id="pat-out-text2" x="160" y="346" text-anchor="middle"
        font-size="10" fill="#a78bfa" font-style="italic" opacity="0">as she reached for the handle.</text>
    </svg>
    <p class="visual-caption">The patterns are stored as numbers. Reading the prompt activates a specific subset of them.</p>`;

    visual.innerHTML = svg;

    const tl = gsap.timeline({ delay: 0.4 });

    // Phase 1: scroll training data upward
    tl.fromTo('#scroll-content',
      { y: 90 },
      { y: -160, duration: 2.4, ease: 'power1.inOut' }
    );

    // Phase 2: focus pattern emerges
    tl.to('#pat-focus', { opacity: 1, duration: 0.5, ease: 'back.out(1.4)' }, '-=0.4')
      .to('#pat-arrow', { opacity: 0.8, duration: 0.3 }, '+=0.2');

    // Phase 3: network appears, then active path lights up
    tl.to('.pat-line', { opacity: 0.4, duration: 0.3 }, '+=0.1')
      .to('.pat-node', { opacity: 0.6, duration: 0.3 }, '<')
      .to('.pat-node.active', {
        opacity: 1,
        scale: 1.2,
        transformOrigin: 'center',
        duration: 0.35,
        stagger: 0.08,
        ease: 'back.out(1.7)'
      }, '+=0.1')
      .to('.pat-line.active', {
        opacity: 0.85,
        stroke: '#6ee7b7',
        strokeWidth: 1.2,
        duration: 0.3,
        stagger: 0.04
      }, '-=0.4');

    // Phase 4: generated output
    tl.to('#pat-out-label', { opacity: 0.7, duration: 0.3 }, '+=0.3')
      .to('#pat-out-text',  { opacity: 1, duration: 0.5 })
      .to('#pat-out-text2', { opacity: 1, duration: 0.5 }, '+=0.1');
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

  'qkv': (scene, visual) => {
    if (!visual) return;
    const roles = [
      { letter: 'Q', label: 'Query', color: '#60a5fa', question: 'What am I looking for?', example: '"bank" asks: am I near water words or money words?' },
      { letter: 'K', label: 'Key',   color: '#6ee7b7', question: 'What do I contain?',     example: '"steep" signals: I am about terrain and incline.' },
      { letter: 'V', label: 'Value', color: '#a78bfa', question: 'What do I send?',         example: '"steep" sends its full meaning when attended to.' },
    ];

    visual.innerHTML = `
      <div class="qkv-grid">
        ${roles.map((r, i) => `
          <div class="qkv-card" id="qkv-${i}" style="--c:${r.color}">
            <div class="qkv-letter">${r.letter}</div>
            <div class="qkv-label">${r.label}</div>
            <div class="qkv-question">${r.question}</div>
            <div class="qkv-example">${r.example}</div>
          </div>
        `).join('')}
      </div>
      <p class="visual-caption" id="qkv-caption" style="opacity:0">Every token computes all three simultaneously, for every other token in the sequence.</p>`;

    gsap.fromTo('.qkv-card',
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.2, ease: 'power3.out' }
    );
    gsap.to('#qkv-caption', { autoAlpha: 1, duration: 0.4, delay: 1 });
  },

  'dot-product': (scene, visual) => {
    if (!visual) return;
    const queryToken = 'bank';
    const pairs = [
      { word: 'river', score: 8.4, highlight: true  },
      { word: 'steep', score: 7.2, highlight: true  },
      { word: 'muddy', score: 6.8, highlight: true  },
      { word: 'was',   score: 1.4, highlight: false },
      { word: 'The',   score: 0.9, highlight: false },
    ];
    const maxScore = 8.4;

    visual.innerHTML = `
      <div class="dp-wrap">
        <div class="dp-query-label">Query: <strong style="color:#60a5fa">"${queryToken}"</strong> × each Key</div>
        <div class="dp-rows" id="dp-rows">
          ${pairs.map((p, i) => `
            <div class="dp-row" id="dp-row-${i}">
              <span class="dp-word ${p.highlight ? 'dp-hi' : ''}">${p.word}</span>
              <div class="dp-bar-wrap">
                <div class="dp-bar" id="dp-bar-${i}" style="--target:${(p.score / maxScore * 100).toFixed(1)}%;background:${p.highlight ? '#6ee7b7' : '#333'}"></div>
              </div>
              <span class="dp-score" id="dp-score-${i}" style="opacity:0;color:${p.highlight ? '#6ee7b7' : '#555'}">${p.score}</span>
            </div>
          `).join('')}
        </div>
        <p class="visual-caption" id="dp-caption" style="opacity:0">Higher score = stronger match = more attention. "bank" cares most about terrain words.</p>
      </div>`;

    const tl = gsap.timeline();
    tl.fromTo('#dp-rows', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 });

    pairs.forEach((_, i) => {
      tl.fromTo(`#dp-bar-${i}`, { width: '0%' }, { width: `var(--target)`, duration: 0.5, ease: 'power2.out' }, i * 0.12)
        .to(`#dp-score-${i}`, { autoAlpha: 1, duration: 0.2 }, i * 0.12 + 0.4);
    });

    tl.to('#dp-caption', { autoAlpha: 1, duration: 0.4 }, '+=0.3');
  },

  'temperature': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const tokens = ['door', 'handle', 'latch', 'brass knob', 'cold metal', 'shimmering portal'];
    const distributions = {
      0:   [0.97, 0.02, 0.01, 0.0,  0.0,  0.0 ],
      0.7: [0.55, 0.20, 0.13, 0.08, 0.04, 0.0 ],
      1.5: [0.28, 0.22, 0.18, 0.14, 0.11, 0.07],
    };

    const barW = 44;
    const barGap = 6;
    const startX = 12;
    const baseY = 240;
    const maxBarH = 130;
    const trackY = 92;
    const trackStartX = 60;
    const trackEndX = 260;

    const stops = [
      { temp: 0,   x: trackStartX },
      { temp: 0.7, x: trackStartX + (trackEndX - trackStartX) * (0.7 / 1.5) },
      { temp: 1.5, x: trackEndX },
    ];

    let svg = `<svg viewBox="0 0 320 310" class="visual-svg temp-svg">
      <!-- Temperature display -->
      <text x="160" y="32" text-anchor="middle"
        font-size="9" fill="#666" letter-spacing="1.5">TEMPERATURE</text>
      <text id="temp-value" x="160" y="64" text-anchor="middle"
        font-size="30" fill="#6ee7b7" font-weight="800">0.0</text>

      <!-- Slider track -->
      <line x1="${trackStartX}" y1="${trackY}" x2="${trackEndX}" y2="${trackY}"
        stroke="#222" stroke-width="2" stroke-linecap="round"/>

      <!-- Stops -->
      ${stops.map(s => `
        <circle cx="${s.x}" cy="${trackY}" r="3" fill="#333"/>
        <text x="${s.x}" y="${trackY + 16}" text-anchor="middle"
          font-size="9" fill="#666">${s.temp.toFixed(1)}</text>
      `).join('')}

      <!-- Slider knob -->
      <circle id="temp-knob" cx="${stops[0].x}" cy="${trackY}" r="7"
        fill="#6ee7b7" stroke="#0a0a0a" stroke-width="2"/>

      <!-- Caption -->
      <text id="temp-caption" x="160" y="${trackY + 36}" text-anchor="middle"
        font-size="9.5" fill="#888">Always picks the top word. No surprises.</text>

      <!-- Bars -->
      ${tokens.map((t, i) => {
        const x = startX + i * (barW + barGap);
        const p = distributions[0][i];
        const h = p * maxBarH;
        const labelTrim = t.length > 8 ? t.substring(0, 8) + '…' : t;
        return `
          <rect class="temp-bar" data-i="${i}"
            x="${x}" y="${baseY - h}" width="${barW}" height="${h}"
            rx="3" fill="${i === 0 ? '#6ee7b7' : '#a78bfa'}"
            opacity="${p > 0.005 ? 0.85 : 0.12}"/>
          <text class="temp-bar-pct" data-i="${i}"
            x="${x + barW / 2}" y="${baseY - h - 4}" text-anchor="middle"
            font-size="9" fill="${i === 0 ? '#6ee7b7' : '#aaa'}"
            opacity="${p > 0.005 ? 1 : 0}">${(p * 100).toFixed(0)}%</text>
          <text class="temp-bar-label" data-i="${i}"
            x="${x + barW / 2}" y="${baseY + 14}" text-anchor="middle"
            font-size="8" fill="#777">${labelTrim}</text>
        `;
      }).join('')}

      <!-- Prompt label below -->
      <text x="160" y="${baseY + 38}" text-anchor="middle"
        font-size="9" fill="#444">After "she reached for the…"</text>
    </svg>
    <p class="visual-caption">Same model. Same prompt. The temperature decides how often Claude picks something less likely.</p>`;

    visual.innerHTML = svg;

    const lerp = (a, b, t) => a + (b - a) * t;
    const interpProbs = (from, to, t) =>
      from.map((p, i) => lerp(p, to[i], t));

    const renderProbs = (probs) => {
      probs.forEach((p, i) => {
        const h = p * maxBarH;
        const y = baseY - h;
        const bar = visual.querySelector(`.temp-bar[data-i="${i}"]`);
        const pct = visual.querySelector(`.temp-bar-pct[data-i="${i}"]`);
        if (!bar || !pct) return;
        bar.setAttribute('y', y);
        bar.setAttribute('height', h);
        bar.style.opacity = p > 0.005 ? 0.85 : 0.12;
        pct.setAttribute('y', y - 4);
        pct.textContent = `${(p * 100).toFixed(0)}%`;
        pct.style.opacity = p > 0.005 ? 1 : 0;
      });
    };

    const setCaption = (text) => {
      const el = visual.querySelector('#temp-caption');
      if (!el) return;
      gsap.to(el, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          el.textContent = text;
          gsap.to(el, { opacity: 1, duration: 0.25 });
        }
      });
    };

    const captions = {
      0:   'Always picks the top word. No surprises.',
      0.7: 'Mostly the top word. Sometimes a creative pick.',
      1.5: 'Strange options enter the running. The story can surprise you.',
    };

    const animateTo = (fromKey, toKey, duration = 1.0) => {
      const tween = { t: 0 };
      return gsap.to(tween, {
        t: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const probs = interpProbs(distributions[fromKey], distributions[toKey], tween.t);
          renderProbs(probs);
          // Animate temperature value
          const tempVal = lerp(fromKey, toKey, tween.t);
          const tv = visual.querySelector('#temp-value');
          if (tv) tv.textContent = tempVal.toFixed(1);
          // Animate knob position
          const fromX = stops.find(s => s.temp === fromKey).x;
          const toX   = stops.find(s => s.temp === toKey).x;
          const knob = visual.querySelector('#temp-knob');
          if (knob) knob.setAttribute('cx', lerp(fromX, toX, tween.t));
        }
      });
    };

    const tl = gsap.timeline({ delay: 0.6 });
    tl.to({}, { duration: 1.0 })  // pause at T=0
      .add(animateTo(0, 0.7))
      .call(setCaption, [captions[0.7]])
      .to({}, { duration: 1.4 })  // hold
      .add(animateTo(0.7, 1.5))
      .call(setCaption, [captions[1.5]])
      .to({}, { duration: 1.0 });  // hold at end
  },

  'softmax': (scene, visual) => {
    if (!visual) return;
    const raw   = [8.4, 7.2, 6.8, 1.4, 0.9];
    const words = ['river', 'steep', 'muddy', 'was', 'The'];
    const colors = ['#6ee7b7','#6ee7b7','#6ee7b7','#444','#444'];

    const expVals = raw.map(v => Math.exp(v));
    const sumExp  = expVals.reduce((a, b) => a + b, 0);
    const probs   = expVals.map(v => v / sumExp);

    visual.innerHTML = `
      <div class="sm-wrap">
        <div class="sm-row-head">
          <span class="sm-col-label">Token</span>
          <span class="sm-col-label sm-raw-head" id="sm-raw-title">Raw score</span>
          <span class="sm-col-label sm-prob-head" id="sm-prob-title" style="opacity:0">Attention weight</span>
        </div>
        ${words.map((w, i) => `
          <div class="sm-row" id="sm-row-${i}">
            <span class="sm-word" style="color:${colors[i]}">${w}</span>
            <div class="sm-bar-wrap">
              <div class="sm-bar sm-bar-raw"  id="smr-${i}" style="width:${(raw[i] / raw[0] * 100).toFixed(1)}%;background:${colors[i]}"></div>
              <div class="sm-bar sm-bar-prob" id="smp-${i}" style="width:0%;background:${colors[i]}"></div>
            </div>
            <span class="sm-val sm-raw-val"  id="smrv-${i}">${raw[i]}</span>
            <span class="sm-val sm-prob-val" id="smpv-${i}" style="opacity:0">${(probs[i] * 100).toFixed(1)}%</span>
          </div>
        `).join('')}
        <p class="visual-caption" id="sm-caption" style="opacity:0">All weights sum to 100%. "river" gets 52% of bank's attention.</p>
      </div>`;

    const tl = gsap.timeline();
    tl.fromTo('.sm-row', { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.08 })
      .to({}, { duration: 0.6 })
      .to('#sm-raw-title', { autoAlpha: 0, duration: 0.3 })
      .to('#sm-prob-title', { autoAlpha: 1, duration: 0.3 }, '<');

    words.forEach((_, i) => {
      tl.to(`#smr-${i}`, { width: '0%', duration: 0.4, ease: 'power2.in' }, '-=0.2')
        .to(`#smrv-${i}`, { autoAlpha: 0, duration: 0.2 }, '<')
        .to(`#smp-${i}`, { width: `${(probs[i] * 100).toFixed(1)}%`, duration: 0.5, ease: 'power2.out' }, '<0.1')
        .to(`#smpv-${i}`, { autoAlpha: 1, duration: 0.2 }, '<0.4');
    });

    tl.to('#sm-caption', { autoAlpha: 1, duration: 0.4 }, '+=0.3');
  },

  'pipeline': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const story = "Once upon a time, there was a curious girl named Maya. On her seventh birthday, she discovered a small wooden door at the back of her closet. It was no bigger than a book. When she pressed her hand against it, the door creaked open.";
    const words = story.split(' ');
    const wordCount = words.length;

    const stages = [
      { label: 'Tokens', color: '#60a5fa', x: 40  },
      { label: 'Layers', color: '#a78bfa', x: 110 },
      { label: 'Output', color: '#f472b6', x: 180 },
      { label: 'Sample', color: '#6ee7b7', x: 250 },
    ];

    let svg = `<svg viewBox="0 0 300 360" class="visual-svg pipeline-svg">
      <defs>
        <marker id="pipe-head" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#444"/>
        </marker>
        <filter id="signal-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Pipeline header -->
      <text x="150" y="22" text-anchor="middle"
        font-size="8" fill="#666" letter-spacing="1.5">PIPELINE</text>

      <!-- Stage boxes -->
      ${stages.map(s => `
        <rect x="${s.x - 25}" y="40" width="50" height="30" rx="6"
          fill="#161616" stroke="${s.color}" stroke-width="1.4" opacity="0.5"/>
        <text x="${s.x}" y="59" text-anchor="middle"
          font-size="9" fill="${s.color}" font-weight="600">${s.label}</text>
      `).join('')}

      <!-- Connecting arrows -->
      ${stages.slice(0, -1).map((s, i) => `
        <line x1="${s.x + 25}" y1="55" x2="${stages[i + 1].x - 25}" y2="55"
          stroke="#333" stroke-width="1" marker-end="url(#pipe-head)"/>
      `).join('')}

      <!-- Loop-back arrow -->
      <path d="M ${stages[3].x + 25} 55 Q 285 55 285 95 Q 285 110 150 110 Q 15 110 15 95 Q 15 55 ${stages[0].x - 25} 55"
        stroke="#444" stroke-width="1" fill="none" stroke-dasharray="3,3" opacity="0.7"
        marker-end="url(#pipe-head)"/>
      <text x="150" y="125" text-anchor="middle"
        font-size="8" fill="#555" font-style="italic">add token, repeat</text>

      <!-- Signal dot (animated) -->
      <circle id="pipe-signal" cx="${stages[0].x}" cy="55" r="4" fill="#fff" filter="url(#signal-glow)"/>

      <!-- Counter -->
      <text id="pipe-counter" x="150" y="158" text-anchor="middle"
        font-size="13" fill="#6ee7b7" font-weight="700">Token 1 of ${wordCount}</text>

      <!-- Story panel -->
      <rect x="8" y="174" width="284" height="180" fill="#0f0f0f" stroke="#1a1a1a" rx="6"/>
      <text x="18" y="190" font-size="8" fill="#555" letter-spacing="1">YOUR PARAGRAPH</text>

      <foreignObject x="16" y="198" width="268" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml" class="pipe-story-text">
          ${words.map((w, i) =>
            `<span class="pipe-story-word" data-i="${i}">${w}${i < words.length - 1 ? ' ' : ''}</span>`
          ).join('')}
        </div>
      </foreignObject>
    </svg>
    <p class="visual-caption">Watch ${wordCount} cycles. Each one adds one word.</p>`;

    visual.innerHTML = svg;

    // Hide all words initially
    gsap.set('.pipe-story-word', { opacity: 0 });

    // Pipeline signal cycles continuously
    const cycleDuration = 0.16;
    const pipeTl = gsap.timeline({ repeat: wordCount - 1 });
    pipeTl.set('#pipe-signal', { attr: { cx: stages[0].x }, opacity: 1 })
          .to('#pipe-signal', {
            attr: { cx: stages[3].x },
            duration: cycleDuration * 0.7,
            ease: 'power1.inOut'
          })
          .to('#pipe-signal', { opacity: 0, duration: cycleDuration * 0.1 })
          .to({}, { duration: cycleDuration * 0.2 });

    // Word reveal + counter update
    const wordTl = gsap.timeline({ delay: 0.5 });
    words.forEach((_, i) => {
      const at = i * cycleDuration;
      wordTl.to(`.pipe-story-word[data-i="${i}"]`, {
        opacity: 1,
        duration: cycleDuration * 0.4,
        ease: 'power2.out'
      }, at + cycleDuration * 0.6);
      wordTl.call(() => {
        const counter = visual.querySelector('#pipe-counter');
        if (counter) counter.textContent = `Token ${i + 1} of ${wordCount}`;
      }, [], at + cycleDuration * 0.5);
    });
  },

  'weighted-sum': (scene, visual) => {
    if (!visual) return;
    const contributors = [
      { word: 'river', weight: 0.52, color: '#6ee7b7' },
      { word: 'steep', weight: 0.28, color: '#34d399' },
      { word: 'muddy', weight: 0.13, color: '#a7f3d0' },
      { word: 'was',   weight: 0.04, color: '#333'    },
      { word: 'The',   weight: 0.03, color: '#2a2a2a' },
    ];

    visual.innerHTML = `
      <div class="ws-wrap">
        <div class="ws-label">How "bank" is understood after attention</div>
        <div class="ws-blend" id="ws-blend">
          ${contributors.map((c, i) => `
            <div class="ws-chunk" id="ws-chunk-${i}"
              style="flex:${c.weight};background:${c.color};opacity:0" title="${c.word}: ${(c.weight*100).toFixed(0)}%">
            </div>
          `).join('')}
        </div>
        <div class="ws-legend" id="ws-legend" style="opacity:0">
          ${contributors.filter(c => c.weight > 0.03).map(c =>
            `<span class="ws-leg-item"><span class="ws-leg-dot" style="background:${c.color}"></span>${c.word} ${(c.weight*100).toFixed(0)}%</span>`
          ).join('')}
        </div>
        <p class="ws-output" id="ws-output" style="opacity:0">
          Output: "bank" now carries the meaning of a riverbank. The geometry words dominated.
        </p>
        <p class="visual-caption" id="ws-caption" style="opacity:0">This enriched representation flows into the feed-forward layer, and then the next token's attention, and so on.</p>
      </div>`;

    const tl = gsap.timeline();
    tl.fromTo('#ws-blend', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });

    contributors.forEach((_, i) => {
      tl.to(`#ws-chunk-${i}`, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, i * 0.15);
    });

    tl.to('#ws-legend', { autoAlpha: 1, duration: 0.4 }, '+=0.3')
      .to('#ws-output',  { autoAlpha: 1, duration: 0.5 }, '+=0.3')
      .to('#ws-caption', { autoAlpha: 1, duration: 0.4 }, '+=0.2');
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
