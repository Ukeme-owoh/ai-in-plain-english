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

    const tl = gsap.timeline({ delay: 0.6, repeat: -1, repeatDelay: 2 });
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
    const tl = gsap.timeline({ delay: 0.5, repeat: -1, repeatDelay: 1.5 });
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

  'typewriter': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const story = "Once upon a time, there was a curious girl named Maya. On her seventh birthday, she discovered a small wooden door at the back of her closet. It was no bigger than a book. When she pressed her hand against it, the door creaked open.";
    const words = story.split(' ');

    visual.innerHTML = `
      <div class="tw-wrap">
        <div class="tw-counter-row">
          <span class="tw-counter-label">Token</span>
          <span class="tw-counter" id="tw-counter">1</span>
          <span class="tw-counter-of">of ${words.length}</span>
        </div>
        <div class="tw-text" id="tw-text">
          ${words.map((w, i) =>
            `<span class="tw-word" data-i="${i}">${w}${i < words.length - 1 ? ' ' : ''}</span>`
          ).join('')}
        </div>
        <div class="tw-arrow" id="tw-arrow">↑ next prediction</div>
      </div>`;

    gsap.set('.tw-word', { opacity: 0 });
    gsap.set('#tw-arrow', { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.5, repeat: -1, repeatDelay: 2 });
    const wordDuration = 0.11;

    words.forEach((_, i) => {
      const at = i * wordDuration;
      tl.to(`.tw-word[data-i="${i}"]`, {
        opacity: 1,
        duration: wordDuration * 0.5,
        ease: 'none'
      }, at);
      tl.call(() => {
        const counter = visual.querySelector('#tw-counter');
        if (counter) counter.textContent = i + 1;
      }, [], at);
    });

    // After all words, show the arrow + caption
    tl.to('#tw-arrow', { opacity: 0.8, y: -4, duration: 0.4 }, '+=0.3');
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

    const tl = gsap.timeline({ delay: 0.5, repeat: -1, repeatDelay: 1.5 });

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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
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
    const caption = visual.querySelector('.visual-caption');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl.to(cells, {
      opacity: (i) => parseFloat(cells[i].dataset.o),
      duration: 0.25,
      stagger: { amount: 1.2, from: 'start', grid: [tokens.length, tokens.length] },
      ease: 'power1.out'
    })
    .to(vals, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, '+=1.1')
    .fromTo(caption, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '+=0.3');
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

    const tl = gsap.timeline({ delay: 0.4, repeat: -1, repeatDelay: 1.5 });

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

    const tl = gsap.timeline({ delay: 0.4, repeat: -1, repeatDelay: 1.5 });

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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
    tl.fromTo('.qkv-card',
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.2, ease: 'power3.out' }
    )
    .to('#qkv-caption', { autoAlpha: 1, duration: 0.4 }, '+=0.4');
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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
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

    const tl = gsap.timeline({ delay: 0.6, repeat: -1, repeatDelay: 1 });
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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
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

  'prompt-comparison': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const weakPrompt   = '"Write a story."';
    const strongPrompt = '"Write a story about a girl who finds a door in her closet on her seventh birthday."';
    const weakOutput   = "There was a man. He did some things. Then more things happened.";
    const strongOutput = "Maya pressed her hand against the small wooden door at the back of her closet, her heart pounding…";

    // Heatmap dimensions
    const weakN = 3;
    const weakCell = 20;
    const weakStartX = 30;
    const weakStartY = 145;

    const strongN = 6;
    const strongCell = 11;
    const strongStartX = 195;
    const strongStartY = 145;

    let svg = `<svg viewBox="0 0 320 380" class="visual-svg compare-svg">
      <!-- Headers -->
      <text x="78"  y="20" text-anchor="middle" font-size="9" fill="#666" letter-spacing="1.5">VAGUE PROMPT</text>
      <text x="240" y="20" text-anchor="middle" font-size="9" fill="#6ee7b7" letter-spacing="1.5">SPECIFIC PROMPT</text>

      <!-- Vertical divider -->
      <line x1="158" y1="6" x2="158" y2="372" stroke="#1a1a1a" stroke-width="1"/>

      <!-- Prompts -->
      <foreignObject x="8" y="30" width="142" height="90">
        <div xmlns="http://www.w3.org/1999/xhtml" class="cmp-prompt cmp-weak" id="cmp-weak-prompt">${weakPrompt}</div>
      </foreignObject>
      <foreignObject x="170" y="30" width="142" height="90">
        <div xmlns="http://www.w3.org/1999/xhtml" class="cmp-prompt cmp-strong" id="cmp-strong-prompt">${strongPrompt}</div>
      </foreignObject>

      <!-- Attention labels -->
      <text x="78"  y="138" text-anchor="middle" font-size="8" fill="#555" id="cmp-attn-label-1" opacity="0">attention pattern</text>
      <text x="240" y="138" text-anchor="middle" font-size="8" fill="#555" id="cmp-attn-label-2" opacity="0">attention pattern</text>
    `;

    // Weak heatmap (3x3 sparse)
    for (let i = 0; i < weakN; i++) {
      for (let j = 0; j < weakN; j++) {
        const opacity = i === j ? 0.6 : 0.06;
        svg += `<rect class="cmp-weak-cell"
          x="${weakStartX + j * weakCell}" y="${weakStartY + i * weakCell}"
          width="${weakCell - 1.5}" height="${weakCell - 1.5}" rx="1.5"
          fill="#888" opacity="0" data-target="${opacity}"/>`;
      }
    }

    // Strong heatmap (6x6 dense)
    for (let i = 0; i < strongN; i++) {
      for (let j = 0; j < strongN; j++) {
        let opacity;
        if (i === j) opacity = 0.95;
        else opacity = 0.25 + Math.random() * 0.5;
        svg += `<rect class="cmp-strong-cell"
          x="${strongStartX + j * strongCell}" y="${strongStartY + i * strongCell}"
          width="${strongCell - 1}" height="${strongCell - 1}" rx="1.5"
          fill="#6ee7b7" opacity="0" data-target="${opacity.toFixed(2)}"/>`;
      }
    }

    svg += `
      <!-- Anchor counts -->
      <text x="78"  y="240" text-anchor="middle"
        font-size="11" fill="#888" opacity="0" id="cmp-weak-anchors">3 anchors</text>
      <text x="240" y="240" text-anchor="middle"
        font-size="11" fill="#6ee7b7" font-weight="700" opacity="0" id="cmp-strong-anchors">7+ anchors</text>

      <!-- Output panels -->
      <rect x="8"   y="258" width="142" height="100" fill="#0f0f0f" stroke="#1a1a1a" rx="5"/>
      <text x="16"  y="272" font-size="7" fill="#555" letter-spacing="1.2">OUTPUT</text>
      <foreignObject x="14" y="278" width="132" height="76">
        <div xmlns="http://www.w3.org/1999/xhtml" class="cmp-output cmp-weak" id="cmp-weak-output">${weakOutput}</div>
      </foreignObject>

      <rect x="170" y="258" width="142" height="100" fill="#0f1a14" stroke="#2a4a3a" rx="5"/>
      <text x="178" y="272" font-size="7" fill="#6ee7b7" letter-spacing="1.2">OUTPUT</text>
      <foreignObject x="176" y="278" width="132" height="76">
        <div xmlns="http://www.w3.org/1999/xhtml" class="cmp-output cmp-strong" id="cmp-strong-output">${strongOutput}</div>
      </foreignObject>
    </svg>
    <p class="visual-caption">More specific prompt. Denser attention. More coherent story.</p>`;

    visual.innerHTML = svg;

    // Initial state
    gsap.set('#cmp-weak-prompt, #cmp-strong-prompt', { opacity: 0 });
    gsap.set('#cmp-weak-output, #cmp-strong-output',  { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.4, repeat: -1, repeatDelay: 2 });

    // Phase 1: prompts appear
    tl.to('#cmp-weak-prompt',   { opacity: 1, duration: 0.5 })
      .to('#cmp-strong-prompt', { opacity: 1, duration: 0.5 }, '<');

    // Phase 2: heatmap labels and cells
    tl.to('#cmp-attn-label-1', { opacity: 0.85, duration: 0.3 }, '+=0.3')
      .to('#cmp-attn-label-2', { opacity: 0.85, duration: 0.3 }, '<')
      .to('.cmp-weak-cell', {
        opacity: (i, el) => parseFloat(el.dataset.target),
        duration: 0.5,
        stagger: 0.02
      }, '<')
      .to('.cmp-strong-cell', {
        opacity: (i, el) => parseFloat(el.dataset.target),
        duration: 0.5,
        stagger: 0.012
      }, '<');

    // Phase 3: anchor counts
    tl.to('#cmp-weak-anchors',   { opacity: 0.85, duration: 0.4 }, '+=0.3')
      .to('#cmp-strong-anchors', { opacity: 1, duration: 0.4 }, '<');

    // Phase 4: outputs
    tl.to('#cmp-weak-output',   { opacity: 0.6, duration: 0.6 }, '+=0.3')
      .to('#cmp-strong-output', { opacity: 1, duration: 0.6 }, '<');
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

    const cycleDuration = 0.16;

    // Master timeline — both signal and word reveal loop in sync
    const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Signal sub-timeline: one sweep per word
    const signalTl = gsap.timeline({ repeat: wordCount - 1 });
    signalTl
      .set('#pipe-signal', { attr: { cx: stages[0].x }, opacity: 1 })
      .to('#pipe-signal', { attr: { cx: stages[3].x }, duration: cycleDuration * 0.7, ease: 'power1.inOut' })
      .to('#pipe-signal', { opacity: 0, duration: cycleDuration * 0.1 })
      .to({}, { duration: cycleDuration * 0.2 });

    masterTl.add(signalTl, 0);

    // Word reveal + counter at +0.5 s offset to sync with signal
    words.forEach((_, i) => {
      const at = 0.5 + i * cycleDuration;
      masterTl.to(`.pipe-story-word[data-i="${i}"]`, {
        opacity: 1,
        duration: cycleDuration * 0.4,
        ease: 'power2.out'
      }, at + cycleDuration * 0.6);
      masterTl.call(() => {
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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
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

  'empty-network': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const layers = [
      { label: 'Tokens',       color: '#60a5fa', y: 340 },
      { label: 'Embedding',    color: '#6ee7b7', y: 290 },
      { label: 'Attention',    color: '#a78bfa', y: 240 },
      { label: 'Feed-Forward', color: '#f472b6', y: 190 },
      { label: 'Attention',    color: '#a78bfa', y: 140 },
      { label: 'Output',       color: '#6ee7b7', y: 90  },
    ];
    const xs = [70, 105, 140, 175, 210];

    let svg = `<svg viewBox="0 0 280 400" class="visual-svg empty-net-svg">
      <defs>
        <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#6ee7b7" stop-opacity="0"/>
          <stop offset="50%"  stop-color="#6ee7b7" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#6ee7b7" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Initial label (empty network) -->
      <text x="140" y="36" text-anchor="middle"
        font-size="9" fill="#555" letter-spacing="1.5" id="en-init-label">EMPTY NETWORK</text>
      <text x="140" y="54" text-anchor="middle"
        font-size="9" fill="#444" id="en-init-sub">No patterns. No knowledge. Yet.</text>

      <!-- Connections (drawn first) -->
      ${[0, 1, 2, 3, 4].flatMap(l =>
        xs.flatMap((x1) =>
          xs.map((x2) =>
            `<line class="en-line" data-from="${l}"
              x1="${x1}" y1="${layers[l].y}"
              x2="${x2}" y2="${layers[l + 1].y}"
              stroke="#1a1a1a" stroke-width="0.5" opacity="0.4"/>`
          )
        )
      ).join('')}

      <!-- Nodes (start dim) -->
      ${layers.flatMap((layer, i) =>
        xs.map((x) =>
          `<circle class="en-node" data-layer="${i}"
            cx="${x}" cy="${layer.y}" r="5.5"
            fill="#141414" stroke="#262626" stroke-width="1" opacity="0.6"/>`
        )
      ).join('')}

      <!-- Layer labels -->
      ${layers.map((layer, i) =>
        `<text class="en-label" data-layer="${i}"
          x="270" y="${layer.y + 4}" text-anchor="end"
          font-size="9" fill="${layer.color}" opacity="0">${layer.label}</text>`
      ).join('')}

      <!-- Activation wave (sweeps upward) -->
      <rect id="en-wave" x="40" y="380" width="200" height="20"
        fill="url(#wave-gradient)" opacity="0"/>

      <!-- Final label (Week 2 teaser) -->
      <text x="140" y="36" text-anchor="middle"
        font-size="9" fill="#6ee7b7" letter-spacing="1.5" id="en-next-label" opacity="0">NEXT WEEK</text>
      <text x="140" y="60" text-anchor="middle"
        font-size="16" fill="#e8e8e8" font-weight="800" id="en-next-title" opacity="0">Training LLMs</text>
    </svg>
    <p class="visual-caption">Same network you saw in Scene 5. Now imagine where the weights actually come from.</p>`;

    visual.innerHTML = svg;

    const tl = gsap.timeline({ delay: 0.5, repeat: -1, repeatDelay: 1.5 });

    // Phase 1: Hold the empty state
    tl.to({}, { duration: 1.0 });

    // Phase 2: Hide initial label, start the wave
    tl.to(['#en-init-label', '#en-init-sub'], { opacity: 0, duration: 0.4 })
      .to('#en-wave', { opacity: 1, duration: 0.2 }, '-=0.1')
      .to('#en-wave', {
        attr: { y: 60 },
        duration: 2.4,
        ease: 'power1.inOut'
      }, '<');

    // Phase 3: As wave passes each layer, activate that layer
    layers.forEach((layer, i) => {
      // Wave starts at y=380, ends at y=60
      // Layer i is at y=layers[i].y
      // Wave reaches layer at progress = (380 - layers[i].y) / (380 - 60)
      const waveProgress = (380 - layer.y) / (380 - 60);
      const waveTime = 1.4 + waveProgress * 2.4;  // delay 1.4 + duration 2.4

      tl.to(`.en-node[data-layer="${i}"]`, {
        fill: layer.color,
        stroke: layer.color,
        opacity: 1,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power2.out'
      }, waveTime);

      tl.to(`.en-label[data-layer="${i}"]`, {
        opacity: 0.8, duration: 0.3
      }, waveTime + 0.05);

      if (i < layers.length - 1) {
        tl.to(`.en-line[data-from="${i}"]`, {
          stroke: layer.color,
          opacity: 0.45,
          duration: 0.4,
          stagger: 0.005
        }, waveTime + 0.1);
      }
    });

    // Phase 4: Wave fades, Next Week label appears
    tl.to('#en-wave', { opacity: 0, duration: 0.4 }, '+=0.3')
      .to('#en-next-label', { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('#en-next-title', { opacity: 1, y: 0, duration: 0.5 }, '+=0.1');

    // Phase 5: Subtle pulse (finite so the outer repeat: -1 can restart cleanly)
    tl.to('.en-node', {
      opacity: 0.7,
      duration: 1.2,
      yoyo: true,
      repeat: 3,
      ease: 'sine.inOut'
    }, '+=0.5');
  },

  'next': (scene) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { scale: 0.9, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.4)' }
    );
  },

  'subsidy-gap': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    const W = 520, H = 300, PL = 60, PB = 56, PT = 28, PR = 40;
    const IW = W - PL - PR, IH = H - PT - PB;

    // Bar positions
    const barW = 70;
    const gap   = IW * 0.55;
    const xPaid = PL + IW * 0.18;
    const xComp = PL + IW * 0.62;

    // Heights: $200 vs $35,000. Log-scale so $200 is visibly there.
    // Linear scale: $200/$35000 = 0.57% — invisible. Use a narrative scale instead.
    // Paid bar = 14px, Compute bar = full IH. Keeps the visual impact dramatic.
    const hPaid = 22;
    const hComp = IH;

    const yBase = PT + IH;
    const yPaid = yBase - hPaid;
    const yComp = PT;

    // Gap arrow y positions (mid-height of compute bar, above paid bar)
    const arrowY = PT + IH * 0.38;

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">A single power user, one month</div>
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">

          <!-- baseline -->
          <line x1="${PL - 8}" y1="${yBase}" x2="${PL + IW + 8}" y2="${yBase}" stroke="#3a3a3a" stroke-width="1"/>

          <!-- Paid bar ($200, blue) -->
          <rect id="sg-bar-paid" x="${xPaid - barW/2}" y="${yBase}" width="${barW}" height="0"
                fill="#3b82f6" rx="3"/>

          <!-- Compute bar ($35k, dark navy) -->
          <rect id="sg-bar-comp" x="${xComp - barW/2}" y="${yBase}" width="${barW}" height="0"
                fill="#1e3a5f" rx="3"/>

          <!-- $200 label (above paid bar) -->
          <text id="sg-lbl-paid" x="${xPaid}" y="${yPaid - 8}" text-anchor="middle"
                font-size="15" font-weight="700" fill="#3b82f6" opacity="0">$200</text>
          <text id="sg-sub-paid" x="${xPaid}" y="${yBase + 18}" text-anchor="middle"
                font-size="11" fill="#888">paid</text>

          <!-- $35,000 label -->
          <text id="sg-lbl-comp" x="${xComp}" y="${yComp - 10}" text-anchor="middle"
                font-size="15" font-weight="700" fill="#93c5fd" opacity="0">$35,000</text>
          <text id="sg-sub-comp" x="${xComp}" y="${yBase + 18}" text-anchor="middle"
                font-size="11" fill="#888">compute consumed</text>

          <!-- 175× gap box (dashed, appears last) -->
          <rect id="sg-gap-box" x="${xPaid + barW/2 + 8}" y="${arrowY - 18}"
                width="${xComp - barW/2 - (xPaid + barW/2) - 16}" height="36"
                fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3"
                rx="4" opacity="0"/>
          <!-- dashed lines from box to bars -->
          <line id="sg-gap-line-l" x1="${xPaid + barW/2}" y1="${arrowY}"
                x2="${xPaid + barW/2 + 8}" y2="${arrowY}"
                stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0"/>
          <line id="sg-gap-line-r" x1="${xComp - barW/2 - 8}" y1="${arrowY}"
                x2="${xComp - barW/2}" y2="${arrowY}"
                stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0"/>
          <text id="sg-gap-lbl" x="${(xPaid + xComp) / 2}" y="${arrowY + 5}"
                text-anchor="middle" font-size="13" font-weight="700" fill="#ef4444"
                opacity="0">175× gap</text>
        </svg>
        <p class="chart-caption" id="sg-caption-italic">This is one documented user, not the typical subscriber. The figure has been widely cited and rounded, and the methodology has not been published. The directional fact, that flat-rate plans can be exploited by automated agents at the extreme tail, is not in dispute.</p>
        <p class="chart-source"><strong>Source.</strong> TechCrunch tokenmaxxing reporting (April 2026), via Artefact analysis.</p>
      </div>`;

    const barPaid = visual.querySelector('#sg-bar-paid');
    const barComp = visual.querySelector('#sg-bar-comp');
    const lblPaid = visual.querySelector('#sg-lbl-paid');
    const lblComp = visual.querySelector('#sg-lbl-comp');
    const gapBox  = visual.querySelector('#sg-gap-box');
    const gapLineL = visual.querySelector('#sg-gap-line-l');
    const gapLineR = visual.querySelector('#sg-gap-line-r');
    const gapLbl  = visual.querySelector('#sg-gap-lbl');
    const captionItalic = visual.querySelector('#sg-caption-italic');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl
      // Paid bar grows up (tiny)
      .to(barPaid, { attr: { y: yPaid, height: hPaid }, duration: 0.5, ease: 'power2.out' })
      .to(lblPaid, { opacity: 1, duration: 0.3 }, '-=0.1')
      // Compute bar grows up (dramatic, slow)
      .to(barComp, { attr: { y: yComp, height: hComp }, duration: 1.4, ease: 'power3.out' }, '+=0.3')
      .to(lblComp, { opacity: 1, duration: 0.35 }, '-=0.3')
      // Gap box + lines appear
      .to([gapBox, gapLineL, gapLineR], { opacity: 1, duration: 0.4 }, '+=0.3')
      .to(gapLbl, { opacity: 1, duration: 0.35 }, '-=0.15')
      // Italic caption + source
      .to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, '+=0.3')
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2')
      // Subtle pulse on gap label (finite)
      .to(gapLbl, { scale: 1.08, transformOrigin: 'center', duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, '+=0.5');
  },

  'user-distribution': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );

    if (!visual) return;

    // Chart geometry
    const W = 560, H = 290;
    const L = 52, R = 516, T = 42, B = 230;
    const IW = R - L, IH = B - T;  // 464 × 188
    const MAX_BAR_H = IH * 0.78;   // ~147px — reserves ~41px above tallest bar for labels

    // Log-scale x mapper  ($5 → L,  $35k → R)
    const logMin = Math.log10(5), logRange = Math.log10(35000) - logMin;
    const xS = v => L + ((Math.log10(v) - logMin) / logRange) * IW;

    // 7 histogram bins + 1 outlier dot
    const bins = [
      { lbl:'$5',   v:5,     h:0.62, blue:true  },
      { lbl:'$20',  v:20,    h:0.88, blue:true  },
      { lbl:'$80',  v:80,    h:1.00, blue:true  },
      { lbl:'$300', v:300,   h:0.72, blue:false },
      { lbl:'$1K',  v:1000,  h:0.52, blue:false },
      { lbl:'$5K',  v:5000,  h:0.35, blue:false },
      { lbl:'$20K', v:20000, h:0.22, blue:false },
    ];

    const BW = 34;  // bar width px

    const barsHTML = bins.map((b, i) => {
      const cx  = xS(b.v);
      const bh  = b.h * MAX_BAR_H;
      const by  = B - bh;
      const col = b.blue ? '#5b8fd4' : '#c05a52';
      return `
        <rect class="ud-bar" id="ud-bar-${i}"
              x="${(cx - BW/2).toFixed(1)}" y="${B}" width="${BW}" height="0"
              fill="${col}" rx="2"
              data-by="${by.toFixed(1)}" data-bh="${bh.toFixed(1)}"/>
        <text x="${cx.toFixed(1)}" y="${B + 16}" text-anchor="middle"
              font-size="9.5" fill="#777">${b.lbl}</text>`;
    }).join('');

    // Geometry for annotations
    const x200    = xS(200);
    const x35k    = xS(35000);
    const dotY    = B - 0.08 * MAX_BAR_H;              // tiny stub + dot
    const midBlue = ((xS(5) + x200) / 2).toFixed(1);
    const midRed  = ((x200 + xS(20000)) / 2).toFixed(1);

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">Monthly compute consumed by Claude Max subscribers (illustrative)</div>
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px">
          <!-- y-axis label rotated -->
          <text transform="rotate(-90,14,${((T+B)/2).toFixed(1)})"
                x="14" y="${((T+B)/2+4).toFixed(1)}"
                text-anchor="middle" font-size="9" fill="#666">share of subscribers</text>

          <!-- baseline -->
          <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#3a3a3a" stroke-width="1"/>

          <!-- x-axis label -->
          <text x="${((L+R)/2).toFixed(1)}" y="${H-6}" text-anchor="middle"
                font-size="9" fill="#666" font-style="italic">monthly compute consumed (retail API equivalent, log scale)</text>

          <!-- histogram bars -->
          ${barsHTML}

          <!-- $200 dashed line -->
          <line id="ud-pline" x1="${x200.toFixed(1)}" y1="${T}"
                x2="${x200.toFixed(1)}" y2="${B}"
                stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="5,3" opacity="0"/>
          <text id="ud-plbl1" x="${x200.toFixed(1)}" y="${T - 4}"
                text-anchor="middle" font-size="9" font-weight="600"
                fill="#e2e8f0" opacity="0">$200 paid</text>
          <text id="ud-plbl2" x="${x200.toFixed(1)}" y="${T + 7}"
                text-anchor="middle" font-size="8.5" fill="#9ca3af" opacity="0">monthly subscription</text>

          <!-- Cross-subsidy pool label -->
          <text id="ud-blbl1" x="${midBlue}" y="${T + 16}"
                text-anchor="middle" font-size="9.5" font-weight="600"
                fill="#5b8fd4" opacity="0">Cross-subsidy pool</text>
          <text id="ud-blbl2" x="${midBlue}" y="${T + 28}"
                text-anchor="middle" font-size="8.5" fill="#9ca3af" opacity="0">most users, well below $200</text>

          <!-- Margin-eating tail label -->
          <text id="ud-rlbl1" x="${midRed}" y="${T + 16}"
                text-anchor="middle" font-size="9.5" font-weight="600"
                fill="#c05a52" opacity="0">Margin-eating tail</text>
          <text id="ud-rlbl2" x="${midRed}" y="${T + 28}"
                text-anchor="middle" font-size="8.5" fill="#9ca3af" opacity="0">small minority, far above $200</text>

          <!-- $35K outlier dot -->
          <circle id="ud-dot" cx="${x35k.toFixed(1)}" cy="${dotY.toFixed(1)}"
                  r="5" fill="#c05a52" opacity="0"/>
          <text id="ud-dlbl1" x="${(x35k + 10).toFixed(1)}" y="${(dotY - 5).toFixed(1)}"
                font-size="8.5" fill="#c05a52" opacity="0">~99th percentile</text>
          <text id="ud-dlbl2" x="${(x35k + 10).toFixed(1)}" y="${(dotY + 6).toFixed(1)}"
                font-size="8.5" fill="#c05a52" opacity="0">$35K user</text>
        </svg>
        <p class="chart-caption">The shape above is a log-normal distribution, the empirically observed pattern of consumer usage across nearly every flat-rate service ever measured. Most subscribers consume well below the price they pay. A small minority consume far more. AI follows the same shape with a fatter tail than most.</p>
        <p class="chart-source"><strong>Sources.</strong> Distribution shape based on the long-tail / log-normal pattern documented across SaaS usage research (the Pareto principle, dating to 1896, generalizes to most consumer-service usage). Specific subscriber counts at each spending level are illustrative. Anthropic has not published its actual usage distribution. The $35K user is the single documented case (TechCrunch, April 2026).</p>
      </div>`;

    const barEls  = [...visual.querySelectorAll('.ud-bar')];
    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

    // Bars grow up left-to-right, staggered
    barEls.forEach((bar, i) => {
      const bh = parseFloat(bar.dataset.bh);
      const by = parseFloat(bar.dataset.by);
      tl.to(bar, { attr: { y: by, height: bh }, duration: 0.38, ease: 'power2.out' }, i * 0.13);
    });

    const after = barEls.length * 0.13 + 0.42;

    tl
      // $200 line
      .to(['#ud-pline','#ud-plbl1','#ud-plbl2'], { opacity: 1, duration: 0.4 }, after)
      // Annotation labels
      .to(['#ud-blbl1','#ud-blbl2'], { opacity: 1, duration: 0.35, stagger: 0.1 }, after + 0.3)
      .to(['#ud-rlbl1','#ud-rlbl2'], { opacity: 1, duration: 0.35, stagger: 0.1 }, after + 0.5)
      // Outlier dot
      .to(['#ud-dot','#ud-dlbl1','#ud-dlbl2'], { opacity: 1, duration: 0.35 }, after + 0.8)
      .to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 1.1)
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 1.4)
      // Pulse dot (finite)
      .to('#ud-dot', { attr: { r: 8 }, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, after + 1.7);
  },

  'price-table': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const rows = [
      { market: 'Consumer API rate',                  arrow: '↓', dir: 'Down',            color: '#6ee7b7' },
      { market: 'Consumer subscription effective price', arrow: '→', dir: 'Flat or unclear', color: '#9ca3af' },
      { market: 'Enterprise sticker rate',            arrow: '→', dir: 'Flat',            color: '#9ca3af' },
      { market: 'Enterprise invoice (total spend)',   arrow: '↑', dir: 'Up near-term',    color: '#fda4af' },
      { market: 'Cost per successful task',           arrow: '→', dir: 'Unclear',         color: '#9ca3af' },
      { market: 'Provider unit cost to serve',        arrow: '↓', dir: 'Down',            color: '#6ee7b7' },
    ];

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="pt-head">
          <span class="pt-head-l">MARKET &amp; METRIC</span>
          <span class="pt-head-r">DIRECTION</span>
        </div>
        ${rows.map(r => `
          <div class="pt-row">
            <span class="pt-market">${r.market}</span>
            <span class="pt-dir" style="color:${r.color}"><span class="pt-arrow">${r.arrow}</span> <strong>${r.dir}</strong></span>
          </div>`).join('')}
      </div>`;

    const ptRows = visual.querySelectorAll('.pt-row');
    gsap.set(ptRows, { autoAlpha: 0, x: -16 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    tl.to(ptRows, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.13, ease: 'power2.out' });
  },

  'price-timeline': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    // Chart area (labels live to the right of R)
    const VW = 560, VH = 260;
    const L = 44, R = 380, T = 18, B = 226;
    const IW = R - L, IH = B - T;

    // Scales
    const maxY = 265, xEnd = 2026.8;
    const py = v  => B - (v / maxY) * IH;
    const px = yr => L + ((yr - 2023) / (xEnd - 2023)) * IW;

    // Y grid lines + labels
    const yTicks = [20, 100, 200, 250];
    const yGrid = yTicks.map(v => `
      <line x1="${L}" y1="${py(v).toFixed(1)}" x2="${R}" y2="${py(v).toFixed(1)}"
            stroke="#1e1e1e" stroke-width="0.6"/>
      <text x="${L-5}" y="${(py(v)+3.5).toFixed(1)}" text-anchor="end"
            font-size="9" fill="#555">$${v}</text>`).join('');

    // X tick labels
    const xTicks = [2023,2024,2025,2026].map(yr => `
      <text x="${px(yr).toFixed(1)}" y="${B+14}" text-anchor="middle"
            font-size="9" fill="#555">${yr}</text>`).join('');

    // Four tiers: [label, sublabel, price, launch year decimal, color, dashed]
    const tiers = [
      { lbl:'$20 standard',   sub:'flat for 3+ years',   val:20,  xr:2023.0,   col:'#3b82f6', dash:false },
      { lbl:'$200 ceiling',   sub:'added Dec 2024',       val:200, xr:2024.92,  col:'#c05a52', dash:false },
      { lbl:'$100 power-user',sub:'added May 2025',       val:100, xr:2025.375, col:'#d97706', dash:false },
      { lbl:'$250 Google Ultra', sub:'',                  val:250, xr:2025.375, col:'#c0524a', dash:true  },
    ];

    const tiersHTML = tiers.map((t, i) => {
      const lx = px(t.xr), ty = py(t.val);
      const dashAttr = t.dash ? 'stroke-dasharray="6,4"' : '';
      const lxF = lx.toFixed(1), tyF = ty.toFixed(1);
      const lblX = (R + 8).toFixed(1);
      return `
        <!-- tier ${i}: ${t.lbl} -->
        <line id="pt-line-${i}" x1="${lxF}" y1="${tyF}" x2="${lxF}" y2="${tyF}"
              stroke="${t.col}" stroke-width="${i===0?2.8:2}" ${dashAttr}
              stroke-linecap="round" opacity="${i===0?1:0}"/>
        <circle id="pt-dot-${i}" cx="${lxF}" cy="${tyF}" r="4.5"
                fill="${t.col}" opacity="0"/>
        <text id="pt-lbl-${i}" x="${lblX}" y="${(ty+1).toFixed(1)}"
              font-size="9.5" font-weight="600" fill="${t.col}" opacity="0">${t.lbl}</text>
        ${t.sub ? `<text id="pt-sub-${i}" x="${lblX}" y="${(ty+12).toFixed(1)}"
              font-size="8.5" fill="#666" opacity="0">${t.sub}</text>` : ''}`;
    }).join('');

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">Monthly subscription tiers, 2023 to 2026</div>
        <svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:${VW}px">
          <!-- axes -->
          <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#333" stroke-width="1"/>
          <line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="#333" stroke-width="1"/>
          ${yGrid}
          ${xTicks}
          ${tiersHTML}
        </svg>
        <p class="chart-caption">The labs raised the ceiling by adding new tiers. They did not raise the existing ones. ChatGPT Plus, Claude Pro, Google AI Pro, and Perplexity Pro all still sit at the $20 line.</p>
        <p class="chart-source"><strong>Source.</strong> Fello AI pricing comparison (2026), Sentisight pricing analysis. Plan launch dates from official lab announcements.</p>
      </div>`;

    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

    // $20 line draws across entire x range first
    tl.to('#pt-line-0', { attr: { x2: R }, duration: 1.5, ease: 'power1.inOut' })
      .to('#pt-dot-0',  { opacity: 1, duration: 0.3 }, 0.1)
      .to(['#pt-lbl-0','#pt-sub-0'], { opacity: 1, duration: 0.3, stagger: 0.1 }, '-=0.3');

    // Remaining tiers appear in sequence, each drawing from launch to R
    [[1,'#pt-line-1','#pt-dot-1',['#pt-lbl-1','#pt-sub-1']],
     [2,'#pt-line-2','#pt-dot-2',['#pt-lbl-2','#pt-sub-2']],
     [3,'#pt-line-3','#pt-dot-3',['#pt-lbl-3']]
    ].forEach(([i, lineId, dotId, lblIds]) => {
      const launchX = px(tiers[i].xr).toFixed(1);
      tl
        .to(lineId, { opacity: 1, attr: { x2: R }, duration: 0.65, ease: 'power2.out' }, '+=0.3')
        .to(dotId,  { opacity: 1, duration: 0.2 }, '<+0.1')
        .to(lblIds, { opacity: 1, duration: 0.25, stagger: 0.08 }, '-=0.15');
    });

    tl.to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, '+=0.2')
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2');
  },

  'shrinkflation': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const VW = 520, VH = 270;
    const L = 44, R = 490, T = 52, B = 220;
    const IW = R - L, IH = B - T;

    const bars = [
      { q:"Q1 '24", v:100, red:false },
      { q:"Q3 '24", v:95,  red:false },
      { q:"Q1 '25", v:80,  red:false },
      { q:"Q3 '25", v:70,  red:false },
      { q:"Q1 '26", v:55,  red:false },
      { q:"Q2 '26", v:45,  red:true  },
    ];

    const maxV = 110;
    const n = bars.length;
    const slot = IW / n;
    const BW   = slot * 0.62;
    const py   = v => B - (v / maxV) * IH;

    // Y grid
    const yGrid = [0, 50, 100].map(v => `
      <line x1="${L}" y1="${py(v).toFixed(1)}" x2="${R}" y2="${py(v).toFixed(1)}"
            stroke="#1e1e1e" stroke-width="0.6"/>
      <text x="${L-4}" y="${(py(v)+3.5).toFixed(1)}" text-anchor="end"
            font-size="9" fill="#555">${v}</text>`).join('');

    const barsHTML = bars.map((b, i) => {
      const cx  = L + i * slot + slot / 2;
      const bh  = (b.v / maxV) * IH;
      const by  = B - bh;
      const col = b.red ? '#c05a52' : '#5b8fd4';
      const valCol = b.red ? '#c05a52' : '#93bbf0';
      return `
        <rect class="sf-bar" id="sf-bar-${i}"
              x="${(cx-BW/2).toFixed(1)}" y="${B}" width="${BW.toFixed(1)}" height="0"
              fill="${col}" rx="3"
              data-by="${by.toFixed(1)}" data-bh="${bh.toFixed(1)}"/>
        <text id="sf-val-${i}" x="${cx.toFixed(1)}" y="${(by-6).toFixed(1)}"
              text-anchor="middle" font-size="11" font-weight="700"
              fill="${valCol}" opacity="0">${b.v}</text>
        <text x="${cx.toFixed(1)}" y="${B+15}" text-anchor="middle"
              font-size="9" fill="#666">${b.q}</text>`;
    }).join('');

    // "AI shrinkflation" annotation at top-right
    const tagX = (R - 10).toFixed(1);
    const tagY = (T - 10).toFixed(1);

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">Included usage at a $20 plan, indexed (Q1 2024 = 100)</div>
        <svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:${VW}px">
          <!-- grid + axes -->
          <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#333" stroke-width="1"/>
          ${yGrid}
          ${barsHTML}
          <!-- AI shrinkflation tag -->
          <text id="sf-tag1" x="${tagX}" y="${tagY}" text-anchor="end"
                font-size="10.5" font-weight="700" fill="#c05a52" opacity="0">"AI shrinkflation"</text>
          <text id="sf-tag2" x="${tagX}" y="${(parseFloat(tagY)+13).toFixed(1)}" text-anchor="end"
                font-size="9" fill="#888" opacity="0">went viral, April 2026</text>
        </svg>
        <p class="chart-caption">The pattern is illustrative. Quarterly figures are smoothed across plans. The direction, that included usage at $20 is roughly half what it was two years ago, is well documented across Anthropic, OpenAI, and Google.</p>
        <p class="chart-source"><strong>Sources.</strong> FindSkill.ai (April 2026 Plus limits), Aizolo subscription guide, AIviewer.ai. Index values illustrative.</p>
      </div>`;

    const barEls  = [...visual.querySelectorAll('.sf-bar')];
    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

    barEls.forEach((bar, i) => {
      const bh = parseFloat(bar.dataset.bh);
      const by = parseFloat(bar.dataset.by);
      tl.to(bar,           { attr: { y: by, height: bh }, duration: 0.38, ease: 'power2.out' }, i * 0.15);
      tl.to(`#sf-val-${i}`,{ opacity: 1, duration: 0.25 }, i * 0.15 + 0.25);
    });

    const after = barEls.length * 0.15 + 0.4;
    tl
      .to(['#sf-tag1','#sf-tag2'], { opacity: 1, duration: 0.35, stagger: 0.1 }, after)
      .to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 0.4)
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 0.7);
  },

  'billing-phases': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    // Gantt chart layout
    const VW = 560, VH = 280;
    const L = 52, R = 520, T = 24, B = 240;
    const IW = R - L, IH = B - T;

    const xMin = 2022.5, xMax = 2027.5, xRange = xMax - xMin;
    const px = yr => L + ((yr - xMin) / xRange) * IW;

    // 4 rows, evenly spaced
    const rows = 4;
    const rowH = IH / rows;
    const BAR_H = 24;
    const cy = i => T + (i + 0.5) * rowH;

    // Phase definitions: [label, sublabel, start year, end year, color]
    const phases = [
      { lbl:'Phase 1 · Pure API, pay per token',        col:'#3b82f6', x1:2022.9, x2:2024.3  },
      { lbl:'Phase 2 · Flat-rate seats',                col:'#1e40af', x1:2023.6, x2:2025.5  },
      { lbl:'Phase 3 · Hybrid (per-seat + consumption)',col:'#c05a52', x1:2024.75,x2:2027.5  },
      { lbl:'Phase 4 · Usage-based',                    col:'#d97706', x1:2026.0, x2:2027.5  },
    ];

    // X-axis tick labels
    const xTicks = [2023,2024,2025,2026,2027].map(yr => `
      <text x="${px(yr).toFixed(1)}" y="${B+16}" text-anchor="middle"
            font-size="9.5" fill="#555">${yr}</text>`).join('');

    // Grid verticals at year marks
    const xGrid = [2023,2024,2025,2026,2027].map(yr => `
      <line x1="${px(yr).toFixed(1)}" y1="${T}" x2="${px(yr).toFixed(1)}" y2="${B}"
            stroke="#1a1a1a" stroke-width="0.6"/>`).join('');

    // Phase bars + labels
    const phHTML = phases.map((p, i) => {
      const x1 = px(p.x1), x2 = px(p.x2);
      const yCtr = cy(i);
      return `
        <!-- phase ${i+1} label -->
        <text id="bp-lbl-${i}" x="${x1.toFixed(1)}" y="${(yCtr - BAR_H/2 - 5).toFixed(1)}"
              font-size="9.5" font-weight="600" fill="${p.col}" opacity="0">${p.lbl}</text>
        <!-- bar -->
        <rect id="bp-bar-${i}"
              x="${x1.toFixed(1)}" y="${(yCtr - BAR_H/2).toFixed(1)}"
              width="0" height="${BAR_H}" fill="${p.col}" rx="3" opacity="0"/>`;
    }).join('');

    // "NOW" marker at 2026
    const nowX = px(2026).toFixed(1);

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">Four phases of enterprise AI pricing</div>
        <svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:${VW}px">
          <!-- baseline -->
          <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#333" stroke-width="1"/>
          ${xGrid}
          ${xTicks}
          ${phHTML}
          <!-- NOW marker -->
          <line id="bp-now-line" x1="${nowX}" y1="${T}" x2="${nowX}" y2="${B}"
                stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,3" opacity="0"/>
          <text id="bp-now-lbl" x="${nowX}" y="${T-6}" text-anchor="middle"
                font-size="9" font-weight="700" fill="#fbbf24" opacity="0">NOW</text>
        </svg>
        <p class="chart-caption">Each new phase did not replace the previous one. Phase 1 still exists. Phase 2 still exists. The enterprise market now operates across all four simultaneously, with the bill assembled from whichever phases the customer is in.</p>
        <p class="chart-source"><strong>Sources.</strong> GitHub blog (April 2026), Microsoft Partner blog (May 2026), CNBC reporting on Anthropic enterprise contract changes (2026).</p>
      </div>`;

    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

    phases.forEach((p, i) => {
      const barW = px(p.x2) - px(p.x1);
      tl
        .to(`#bp-lbl-${i}`, { opacity: 1, duration: 0.25 }, i * 0.55)
        .to(`#bp-bar-${i}`,  { opacity: 1, attr: { width: barW }, duration: 0.5, ease: 'power2.out' }, i * 0.55 + 0.1);
    });

    const after = phases.length * 0.55 + 0.55;
    tl
      .to(['#bp-now-line','#bp-now-lbl'], { opacity: 1, duration: 0.4 }, after)
      .to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 0.3)
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 0.6);
  },

  'commodity-cycle': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const VW = 540, VH = 300;
    const L = 44, R = 510, T = 22, B = 200;
    const IW = R - L, IH = B - T;

    // X: 2022–2032, Y: 0–1 normalised
    const px = yr => L + ((yr - 2022) / 10) * IW;
    const py = v  => B - v * IH;

    // Three curves as [year, value] pairs
    const tokenPts  = [[2022,.82],[2023,.78],[2024,.70],[2025,.62],[2026,.52],[2027,.40],[2028,.34],[2029,.32],[2030,.38],[2031,.48],[2032,.58]];
    const capexPts  = [[2022,.14],[2023,.28],[2024,.50],[2025,.76],[2026,.94],[2027,.88],[2028,.65],[2029,.46],[2030,.34],[2031,.28],[2032,.26]];
    const supplyPts = [[2022,.07],[2023,.10],[2024,.16],[2025,.24],[2026,.36],[2027,.54],[2028,.74],[2029,.92],[2030,.98],[2031,.86],[2032,.76]];

    const toPath = pts => pts.map(([yr,v],i)=>`${i?'L':'M'}${px(yr).toFixed(1)},${py(v).toFixed(1)}`).join(' ');

    // Clip rect reveals all three curves left→right
    const clipId = 'cc-clip';

    // Phase bands labels below x-axis
    const phases = [
      { lbl:'Subsidy',               x1:2022, x2:2024 },
      { lbl:'Unwind',                x1:2024, x2:2026 },
      { lbl:'Oversupply (predicted)',x1:2026, x2:2030 },
      { lbl:'Rebound',               x1:2030, x2:2032 },
    ];
    const phaseBands = phases.map((p,i) => {
      const cx = ((px(p.x1)+px(p.x2))/2).toFixed(1);
      const colors = ['#5b8fd4','#d97706','#c05a52','#4ade80'];
      return `<text id="cc-ph-${i}" x="${cx}" y="${B+28}" text-anchor="middle"
                    font-size="9" font-weight="600" fill="${colors[i]}" opacity="0">${p.lbl}</text>`;
    }).join('');

    // Dividers between phases
    const dividers = [2024,2026,2030].map(yr =>
      `<line x1="${px(yr).toFixed(1)}" y1="${B}" x2="${px(yr).toFixed(1)}" y2="${B+6}"
             stroke="#333" stroke-width="0.8"/>`).join('');

    // X-axis tick labels
    const xTicks = [2022,2024,2026,2028,2030,2032].map(yr =>
      `<text x="${px(yr).toFixed(1)}" y="${B+14}" text-anchor="middle" font-size="9" fill="#555">'${String(yr).slice(2)}</text>`
    ).join('');

    // Annotation peaks
    const capexPeakX = px(2026).toFixed(1);
    const supplyPeakX = px(2030).toFixed(1);

    // Legend
    const legend = `
      <circle cx="${L}"    cy="${T-6}" r="4" fill="#ef4444"/>
      <text x="${L+8}"     y="${T-2}"  font-size="9" fill="#ef4444">Token price</text>
      <circle cx="${L+85}" cy="${T-6}" r="4" fill="#1e40af"/>
      <text x="${L+93}"    y="${T-2}"  font-size="9" fill="#3b82f6">Capex commitments</text>
      <line  x1="${L+205}" y1="${T-6}" x2="${L+225}" y2="${T-6}" stroke="#4ade80" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="${L+229}"   y="${T-2}"  font-size="9" fill="#4ade80">Supply (4-yr lag)</text>`;

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">The commodity supply cycle, applied to AI compute</div>
        <svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:${VW}px">
          <defs>
            <clipPath id="${clipId}">
              <rect id="cc-clip-rect" x="${L}" y="${T-4}" width="0" height="${IH+8}"/>
            </clipPath>
          </defs>

          <!-- axes + ticks -->
          <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#333" stroke-width="1"/>
          ${xTicks}${dividers}${phaseBands}${legend}

          <!-- three curves, clipped -->
          <path d="${toPath(tokenPts)}"  fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linejoin="round" clip-path="url(#${clipId})"/>
          <path d="${toPath(capexPts)}"  fill="none" stroke="#1e40af" stroke-width="2.2" stroke-linejoin="round" clip-path="url(#${clipId})"/>
          <path d="${toPath(supplyPts)}" fill="none" stroke="#4ade80" stroke-width="2"   stroke-linejoin="round" stroke-dasharray="6,4" clip-path="url(#${clipId})"/>

          <!-- annotation: capex peak -->
          <line id="cc-ann-cap-l" x1="${capexPeakX}" y1="${py(.94).toFixed(1)}" x2="${capexPeakX}" y2="${py(1.05).toFixed(1)}"
                stroke="#1e40af" stroke-width="1" stroke-dasharray="3,2" opacity="0"/>
          <text id="cc-ann-cap-t1" x="${capexPeakX}" y="${py(1.12).toFixed(1)}" text-anchor="middle"
                font-size="9" font-weight="600" fill="#3b82f6" opacity="0">Capex peaks</text>
          <text id="cc-ann-cap-t2" x="${capexPeakX}" y="${py(1.12+0.08).toFixed(1)}" text-anchor="middle"
                font-size="8.5" fill="#555" opacity="0">2025-26</text>

          <!-- annotation: supply peak -->
          <line id="cc-ann-sup-l" x1="${supplyPeakX}" y1="${py(.98).toFixed(1)}" x2="${supplyPeakX}" y2="${py(1.1).toFixed(1)}"
                stroke="#4ade80" stroke-width="1" stroke-dasharray="3,2" opacity="0"/>
          <text id="cc-ann-sup-t1" x="${supplyPeakX}" y="${py(1.17).toFixed(1)}" text-anchor="middle"
                font-size="9" font-weight="600" fill="#4ade80" opacity="0">Supply hits</text>
          <text id="cc-ann-sup-t2" x="${supplyPeakX}" y="${py(1.17+0.08).toFixed(1)}" text-anchor="middle"
                font-size="8.5" fill="#555" opacity="0">~2029-30</text>
        </svg>
        <p class="chart-caption">Capex peaking in 2025-26 plus a roughly four-year build cycle for power and data center capacity points to supply hitting around 2029-30. The price trough follows by a year or two. The right panel of any oil refinery cycle looks similar.</p>
        <p class="chart-source"><strong>Sources.</strong> Morgan Stanley AI capex forecasts, Sightline Climate (transformer lead times), Tom's Hardware (delayed builds). Cobweb model from commodity economics literature.</p>
      </div>`;

    const clipRect = visual.querySelector('#cc-clip-rect');
    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl
      // Reveal all three curves left→right (2.8s)
      .to(clipRect, { attr: { width: IW }, duration: 2.8, ease: 'power1.inOut' })

      // Phase labels appear as chart draws through their midpoints
      .to('#cc-ph-0', { opacity: 1, duration: 0.3 }, 0.3)
      .to('#cc-ph-1', { opacity: 1, duration: 0.3 }, 0.85)
      .to('#cc-ph-2', { opacity: 1, duration: 0.3 }, 1.2)
      .to('#cc-ph-3', { opacity: 1, duration: 0.3 }, 2.4)

      // Capex annotation at the peak (around 40% through draw = ~2026)
      .to(['#cc-ann-cap-l','#cc-ann-cap-t1','#cc-ann-cap-t2'], { opacity: 1, duration: 0.4, stagger: 0.1 }, 1.1)

      // Supply annotation near the end
      .to(['#cc-ann-sup-l','#cc-ann-sup-t1','#cc-ann-sup-t2'], { opacity: 1, duration: 0.4, stagger: 0.1 }, 2.2)

      .to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, '+=0.3')
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2');
  },

  'tokens-per-watt': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const VW = 520, VH = 290;
    const L = 52, R = 500, T = 28, B = 220;
    const IW = R - L, IH = B - T;

    // GPU generations matching PDF exactly: V100→A100→H100→H200→B200→Rubin*
    const chips = [
      { lbl:['V100','2017'],  val:0.4,  proj:false },
      { lbl:['A100','2020'],  val:1.2,  proj:false },
      { lbl:['H100','2022'],  val:3.5,  proj:false },
      { lbl:['H200','2024'],  val:6.0,  proj:false },
      { lbl:['B200','2025'],  val:18,   proj:false },
      { lbl:['Rubin*','2027'],val:45,   proj:true  },
    ];

    // Log scale: log10(0.4)=−0.4 to log10(45)=1.65
    const logMin = Math.log10(0.4), logMax = Math.log10(45);
    const barH = v => ((Math.log10(v) - logMin) / (logMax - logMin)) * IH;

    const n   = chips.length;
    const BW  = (IW / n) * 0.56;
    const gap = IW / n;

    const barsHTML = chips.map((c, i) => {
      const cx = L + i * gap + gap / 2;
      const bh = barH(c.val);
      const by = B - bh;
      // Projected = lighter green, confirmed = full green
      const fill = c.proj ? '#86efac' : '#16a34a';
      const valCol = c.proj ? '#86efac' : '#4ade80';
      const [line1, line2] = c.lbl;
      return `
        <rect class="tpw-bar" id="tpw-bar-${i}"
              x="${(cx-BW/2).toFixed(1)}" y="${B}" width="${BW.toFixed(1)}" height="0"
              fill="${fill}" rx="3"
              data-by="${by.toFixed(1)}" data-bh="${bh.toFixed(1)}"/>
        <text id="tpw-val-${i}" x="${cx.toFixed(1)}" y="${(by-5).toFixed(1)}"
              text-anchor="middle" font-size="10" font-weight="700"
              fill="${valCol}" opacity="0">${c.val}</text>
        <text x="${cx.toFixed(1)}" y="${B+14}" text-anchor="middle"
              font-size="9" fill="#888">${line1}</text>
        <text x="${cx.toFixed(1)}" y="${B+25}" text-anchor="middle"
              font-size="8.5" fill="#555">${line2}</text>`;
    }).join('');

    // Y-axis log ticks
    const yTicks = [0.4,1,3,10,30].map(v => {
      const ty = (B - barH(v)).toFixed(1);
      return `<line x1="${L-4}" y1="${ty}" x2="${L}" y2="${ty}" stroke="#444" stroke-width="0.8"/>
              <text x="${L-7}" y="${(parseFloat(ty)+3.5).toFixed(1)}" text-anchor="end"
                    font-size="8.5" fill="#555">${v}</text>
              <line x1="${L}" y1="${ty}" x2="${R}" y2="${ty}"
                    stroke="#181818" stroke-width="0.5" stroke-dasharray="3,4"/>`;
    }).join('');

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">Inference efficiency by GPU generation, log scale</div>
        <svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:${VW}px">
          <!-- axes -->
          <line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="#444" stroke-width="1"/>
          <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#444" stroke-width="1"/>
          ${yTicks}

          <!-- y-axis label -->
          <text transform="rotate(-90,14,${((T+B)/2).toFixed(1)})"
                x="14" y="${((T+B)/2+4).toFixed(1)}" text-anchor="middle"
                font-size="9" fill="#666">tokens / watt</text>

          ${barsHTML}

          <!-- Projected note -->
          <rect x="${(R-88).toFixed(1)}" y="${T+2}" width="86" height="16" fill="#86efac22" rx="3"/>
          <text x="${(R-44).toFixed(1)}" y="${T+13}" text-anchor="middle"
                font-size="8.5" fill="#86efac">* projected</text>
        </svg>
        <p class="chart-caption">Eight years, roughly 110 times more efficient. NVIDIA's published gain from Hopper to Blackwell is roughly 10×, with up to 50× cited for specific workloads (vendor-reported). Rubin is projected from public roadmap commentary.</p>
        <p class="chart-source"><strong>Source.</strong> NVIDIA developer blog ("Scaling token factory revenue", 2026). Generation-by-generation values are order-of-magnitude indicative.</p>
      </div>`;

    const barEls  = [...visual.querySelectorAll('.tpw-bar')];
    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([captionItalic, sourceLine], { autoAlpha: 0, y: 6 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    barEls.forEach((bar, i) => {
      const bh = parseFloat(bar.dataset.bh);
      const by = parseFloat(bar.dataset.by);
      tl
        .to(bar,             { attr: { y: by, height: bh }, duration: 0.42, ease: 'power2.out' }, i * 0.2)
        .to(`#tpw-val-${i}`, { opacity: 1, duration: 0.25 }, i * 0.2 + 0.3);
    });

    const after = barEls.length * 0.2 + 0.5;
    tl.to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, after)
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, after + 0.3);
  },

  'interactive-model': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    // ── Formula ─────────────────────────────────────────────────
    // Calibrated so My view (unwind=5, lockIn=55, tpw=4, demand=3)
    // lands at end2030 ≈ 111, peak ≈ 116. Matches PDF.
    function compute(unwind, lockIn, tpw, demand) {
      const ue = (10 - unwind) * 2;            // slower unwind → flatter near term
      const li = (lockIn / 100) * 18;          // lock-in raises the ceiling
      const ee = (tpw - 1) * 5;                // tokens/watt growth lowers it
      const de = (demand - 1) * 3;             // demand growth pushes it up
      const end2030 = Math.round(100 + ue + li - ee + de);
      const peak = end2030 + (10 - unwind);    // peak overshoot matches unwind speed

      const traj = [
        100,
        Math.round(100 + (peak - 100) * 0.75),
        peak,
        end2030 - 1,
        end2030
      ];
      return { end2030, peak, traj };
    }

    // ── Presets ──────────────────────────────────────────────────
    const presets = [
      { lbl:'My view',       unwind:5, lockIn:55, tpw:4.0, demand:3.0 },
      { lbl:'Deflation wins',unwind:8, lockIn:20, tpw:8.0, demand:2.0 },
      { lbl:'Lock-in wins',  unwind:3, lockIn:90, tpw:2.0, demand:4.0 },
      { lbl:'Power glut',    unwind:7, lockIn:30, tpw:10,  demand:2.0 },
    ];

    // ── SVG chart helper ─────────────────────────────────────────
    const CL=34,CR=220,CT=8,CB=70, CIW=CR-CL, CIH=CB-CT;
    const years = [2026,2027,2028,2029,2030];

    function buildChartPath(traj) {
      const yMin = 40, yMax = 200;
      const clamp = v => Math.max(yMin, Math.min(yMax, v));
      const px = i => CL + (i/4)*CIW;
      const py = v => CB - ((clamp(v) - yMin)/(yMax - yMin))*CIH;
      return traj.map((v,i)=>`${i?'L':'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    }

    function buildChart(traj, end2030) {
      const yMin=40,yMax=200;
      const py = v => CB - ((Math.max(yMin,Math.min(yMax,v))-yMin)/(yMax-yMin))*CIH;
      const px = i => CL + (i/4)*CIW;
      // Y grid every 20: 40, 60, 80, 100, 120, ... 200
      const ticks = [40,60,80,100,120,140,160,180,200];
      const gridLines = ticks.map(v=>`
        <line x1="${CL}" y1="${py(v).toFixed(1)}" x2="${CR}" y2="${py(v).toFixed(1)}"
              stroke="#1a1a1a" stroke-width="${v===100?'1':'0.5'}" stroke-dasharray="${v===100?'4,3':''}"/>
        <text x="${CL-3}" y="${(py(v)+3.5).toFixed(1)}" text-anchor="end" font-size="7" fill="#555">${v}</text>`).join('');
      const xLabels = years.map((yr,i)=>`
        <text x="${px(i).toFixed(1)}" y="${CB+10}" text-anchor="middle" font-size="7" fill="#666">${yr}</text>`).join('');
      const dots = traj.map((v,i)=>`
        <circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="2.6"
                fill="${i===traj.length-1?'#c05a52':'#0e0e0e'}"
                stroke="#c05a52" stroke-width="1.5"/>`).join('');
      // light coral fill under the curve
      const areaPath = buildChartPath(traj) +
        ` L ${px(4).toFixed(1)},${py(yMin).toFixed(1)} L ${px(0).toFixed(1)},${py(yMin).toFixed(1)} Z`;
      return `<svg viewBox="0 0 240 90" style="width:100%;display:block">
        <line x1="${CL}" y1="${CT}" x2="${CL}" y2="${CB}" stroke="#333" stroke-width="0.8"/>
        <line x1="${CL}" y1="${CB}" x2="${CR}" y2="${CB}" stroke="#333" stroke-width="0.8"/>
        ${gridLines}${xLabels}
        <path d="${areaPath}" fill="#c05a5212" stroke="none"/>
        <path d="${buildChartPath(traj)}" fill="none" stroke="#c05a52" stroke-width="2" stroke-linejoin="round"/>
        ${dots}
      </svg>`;
    }

    // ── Layout ───────────────────────────────────────────────────
    visual.innerHTML = `
      <div class="chart-frame" style="font-family:inherit;color:#e0e0e0">
        <div style="font-size:0.62rem;letter-spacing:0.1em;color:#c05a52;font-weight:700">TRY IT YOURSELF</div>

        <!-- chart -->
        <div id="im-chart" style="margin:0 -2px"></div>

        <!-- output boxes 2×2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div style="border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px">
            <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:.07em;color:#666">2030 token price</div>
            <div id="im-end" style="font-size:1.55rem;font-weight:700;line-height:1.1;color:#e0e0e0">—</div>
            <div id="im-end-sub" style="font-size:0.66rem;color:#555">vs today (100)</div>
          </div>
          <div style="border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px">
            <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:.07em;color:#666">peak (when)</div>
            <div id="im-peak" style="font-size:1.55rem;font-weight:700;line-height:1.1;color:#e0e0e0">—</div>
            <div style="font-size:0.66rem;color:#555">in 2028</div>
          </div>
          <div style="border:1px solid #c05a5233;border-radius:6px;padding:8px 10px;background:#c05a5208">
            <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:.07em;color:#c05a52">today's $20 plan in 2030</div>
            <div id="im-20" style="font-size:1.55rem;font-weight:700;line-height:1.1;color:#c05a52">—</div>
            <div style="font-size:0.66rem;color:#555">if effective price tracks the curve</div>
          </div>
          <div style="border:1px solid #c05a5233;border-radius:6px;padding:8px 10px;background:#c05a5208">
            <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:.07em;color:#c05a52">today's $200 plan in 2030</div>
            <div id="im-200" style="font-size:1.55rem;font-weight:700;line-height:1.1;color:#c05a52">—</div>
            <div style="font-size:0.66rem;color:#555">if effective price tracks the curve</div>
          </div>
        </div>

        <!-- sliders 2×2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 14px">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#888;margin-bottom:2px">
              <span>Subsidy unwind speed</span><span id="im-lbl-unwind" style="color:#e0e0e0;font-weight:600"></span>
            </div>
            <input id="im-unwind" type="range" min="1" max="10" step="1" value="5" style="width:100%;accent-color:#c05a52"/>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#888;margin-bottom:2px">
              <span>Lock-in pricing power</span><span id="im-lbl-lockin" style="color:#e0e0e0;font-weight:600"></span>
            </div>
            <input id="im-lockin" type="range" min="0" max="100" step="5" value="55" style="width:100%;accent-color:#c05a52"/>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#888;margin-bottom:2px">
              <span>Tokens-per-watt growth</span><span id="im-lbl-tpw" style="color:#e0e0e0;font-weight:600"></span>
            </div>
            <input id="im-tpw" type="range" min="1" max="12" step="0.5" value="4" style="width:100%;accent-color:#c05a52"/>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#888;margin-bottom:2px">
              <span>Token demand growth</span><span id="im-lbl-demand" style="color:#e0e0e0;font-weight:600"></span>
            </div>
            <input id="im-demand" type="range" min="1" max="6" step="0.5" value="3" style="width:100%;accent-color:#c05a52"/>
          </div>
        </div>

        <!-- preset buttons -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:2px">
          ${presets.map((p,i)=>`
            <button id="im-preset-${i}" data-i="${i}"
              style="font-size:0.66rem;letter-spacing:0.04em;text-transform:uppercase;
                     padding:6px 10px;border-radius:4px;cursor:pointer;
                     background:${i===0?'#c05a52':'transparent'};
                     color:${i===0?'#fff':'#888'};
                     border:1px solid ${i===0?'#c05a52':'#333'};
                     transition:all .2s">${p.lbl}</button>`).join('')}
        </div>

        <p class="chart-caption" style="margin:0">The model compresses several mechanisms into four levers. Each assumption is named, so you can see exactly which inputs drive the output. The 2030 endpoint is a directional projection. Uncertainty grows with horizon.</p>
      </div>`;

    // ── Update function ──────────────────────────────────────────
    function update() {
      const unwind = parseFloat(visual.querySelector('#im-unwind').value);
      const lockIn = parseFloat(visual.querySelector('#im-lockin').value);
      const tpw    = parseFloat(visual.querySelector('#im-tpw').value);
      const demand = parseFloat(visual.querySelector('#im-demand').value);

      const { end2030, peak, traj } = compute(unwind, lockIn, tpw, demand);

      visual.querySelector('#im-end').textContent  = end2030;
      visual.querySelector('#im-end-sub').textContent = `${end2030>100?'+':''}${end2030-100} vs today (100)`;
      visual.querySelector('#im-peak').textContent = peak;
      visual.querySelector('#im-20').textContent   = `$${(20 * end2030 / 100).toFixed(2)}`;
      visual.querySelector('#im-200').textContent  = `$${(200 * end2030 / 100).toFixed(0)}`;

      visual.querySelector('#im-lbl-unwind').textContent = `${unwind} yrs`;
      visual.querySelector('#im-lbl-lockin').textContent = `${lockIn}%`;
      visual.querySelector('#im-lbl-tpw').textContent    = `${tpw}×/gen`;
      visual.querySelector('#im-lbl-demand').textContent = `${demand}×/yr`;

      visual.querySelector('#im-chart').innerHTML = buildChart(traj, end2030);
    }

    // ── Wire inputs ──────────────────────────────────────────────
    ['#im-unwind','#im-lockin','#im-tpw','#im-demand'].forEach(id => {
      visual.querySelector(id).addEventListener('input', update);
    });

    presets.forEach((p, i) => {
      visual.querySelector(`#im-preset-${i}`).addEventListener('click', () => {
        visual.querySelector('#im-unwind').value = p.unwind;
        visual.querySelector('#im-lockin').value = p.lockIn;
        visual.querySelector('#im-tpw').value    = p.tpw;
        visual.querySelector('#im-demand').value = p.demand;

        presets.forEach((_,j) => {
          const btn = visual.querySelector(`#im-preset-${j}`);
          const active = j === i;
          btn.style.background = active ? '#c05a52' : 'transparent';
          btn.style.color      = active ? '#fff' : '#888';
          btn.style.borderColor = active ? '#c05a52' : '#333';
        });
        update();
      });
    });

    update();
  },

  'losses-grid': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const tiles = [
      { co:'OpenAI',    metric:'-$5B',     sub:'lost on <$4B revenue', src:'AI Automation Global, 2024',     col:'#c05a52' },
      { co:'Anthropic', metric:'-$10K+/mo',sub:'on heaviest Max users',src:'CNBC, Mar 2026',                  col:'#c05a52' },
      { co:'Notion',    metric:'-10pp',    sub:'gross margins, post-AI',src:'Artefact',                       col:'#d97706' },
      { co:'Replit',    metric:'+36% → -14%', sub:'gross margin swing', src:'Aakash Gupta',                    col:'#c05a52' },
    ];

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">Every major lab is pricing inference below cost</div>
        <div class="lg-grid">
          ${tiles.map((t,i)=>`
            <div class="lg-tile" id="lg-tile-${i}">
              <div class="lg-co">${t.co}</div>
              <div class="lg-metric" style="color:${t.col}">${t.metric}</div>
              <div class="lg-sub">${t.sub}</div>
              <div class="lg-src">${t.src}</div>
            </div>`).join('')}
        </div>
        <p class="chart-caption">Cross-subsidy can absorb a fat tail. It cannot absorb the entire pricing model.</p>
        <p class="chart-source"><strong>Sources.</strong> AI Automation Global (2024), CNBC reporting (March 2026), Artefact analysis, Aakash Gupta on Replit margins.</p>
      </div>`;

    const tileEls = visual.querySelectorAll('.lg-tile');
    const captionItalic = visual.querySelector('.chart-caption');
    const sourceLine = visual.querySelector('.chart-source');
    gsap.set([...tileEls, captionItalic, sourceLine], { autoAlpha: 0, y: 14 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    tl.to(tileEls, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.18, ease: 'power2.out' })
      .to(captionItalic, { autoAlpha: 1, y: 0, duration: 0.4 }, '+=0.2')
      .to(sourceLine, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2')
      // Subtle pulse on each metric (finite)
      .to('.lg-metric', { scale: 1.04, transformOrigin: 'left center', duration: 0.4, yoyo: true, repeat: 1, stagger: 0.1, ease: 'sine.inOut' }, '+=0.4');
  },

  'forecast-quote': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const W = 360, H = 90, CL = 16, CR = 344, CT = 14, CB = 78;
    const traj = [100, 112, 116, 110, 111];
    const yMin = 90, yMax = 122;
    const px = i => CL + (i/4)*(CR - CL);
    const py = v => CB - ((Math.max(yMin,Math.min(yMax,v))-yMin)/(yMax-yMin))*(CB - CT);
    const pathD = traj.map((v,i)=>`${i?'L':'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    const dots = traj.map((v,i)=>`<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="3.5" fill="${i===2?'#c05a52':'#0e0e0e'}" stroke="#c05a52" stroke-width="1.4"/>`).join('');
    const xLabels = [2026,2027,2028,2029,2030].map((yr,i)=>`<text x="${px(i).toFixed(1)}" y="${CB+8}" text-anchor="middle" font-size="7" fill="#666">${yr}</text>`).join('');
    const areaPath = pathD + ` L ${px(4).toFixed(1)},${py(yMin).toFixed(1)} L ${px(0).toFixed(1)},${py(yMin).toFixed(1)} Z`;

    visual.innerHTML = `
      <div class="quote-card">
        <div class="quote-eyebrow">MY VIEW</div>
        <div class="quote-headline">Enterprise effective prices rise modestly through 2028, plateau, then drift back down.</div>
        <svg id="fq-chart" viewBox="0 0 ${W} ${H}" style="width:100%;display:block;margin-top:0.6rem">
          <path id="fq-area" d="${areaPath}" fill="#c05a5215" stroke="none" opacity="0"/>
          <path id="fq-path" d="${pathD}" fill="none" stroke="#c05a52" stroke-width="2.4"
                stroke-linejoin="round" stroke-linecap="round"
                stroke-dasharray="600" stroke-dashoffset="600"/>
          <g id="fq-dots" opacity="0">${dots}</g>
          ${xLabels}
          <text id="fq-peak" x="${px(2).toFixed(1)}" y="${(py(116)-7).toFixed(1)}"
                text-anchor="middle" font-size="8" font-weight="700" fill="#c05a52" opacity="0">peak +16%</text>
        </svg>
        <div class="quote-stats">
          <div><span class="qs-num">+16%</span><span class="qs-lbl">peak in 2028</span></div>
          <div><span class="qs-num">+11%</span><span class="qs-lbl">at 2030</span></div>
        </div>
      </div>`;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    tl.to('#fq-area', { opacity: 1, duration: 0.5 }, 0.2)
      .to('#fq-path', { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 0.3)
      .to('#fq-dots', { opacity: 1, duration: 0.4 }, '-=0.4')
      .to('#fq-peak', { opacity: 1, y: -2, duration: 0.4, ease: 'power2.out' }, '+=0.1')
      .to('.qs-num', { scale: 1.08, transformOrigin: 'left center', duration: 0.4, yoyo: true, repeat: 1, stagger: 0.15, ease: 'sine.inOut' }, '+=0.3');
  },

  'audience-cards': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const cards = [
      { tag:'IF YOU BUILD WITH AI',  col:'#3b82f6',
        action:'Routing layers and exit optionality.',
        sub:'Not three-year price-locked contracts. The cost line is becoming its own bill.' },
      { tag:'IF YOU RUN FINANCE',     col:'#d97706',
        action:'Consumption budgets are the new governance.',
        sub:'Gartner: 40% of enterprises will exceed AI budgets by 2× by 2027.' },
      { tag:'IF YOU WATCH POLICY',   col:'#c05a52',
        action:'Interoperability and fair pricing, now.',
        sub:'Consolidation follows the bust. The digestion phase decides who wins.' },
    ];

    visual.innerHTML = `
      <div class="ac-stack">
        ${cards.map((c,i)=>`
          <div class="ac-card" id="ac-card-${i}" style="border-left:3px solid ${c.col}">
            <div class="ac-tag" style="color:${c.col}">${c.tag}</div>
            <div class="ac-action">${c.action}</div>
            <div class="ac-sub">${c.sub}</div>
          </div>`).join('')}
        <div class="ac-closer" id="ac-closer">Tokens cost too little today. Tomorrow, the question will be who pays.</div>
      </div>`;

    const cardEls = visual.querySelectorAll('.ac-card');
    const closer  = visual.querySelector('#ac-closer');
    gsap.set([...cardEls, closer], { autoAlpha: 0, x: -16 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    tl.to(cardEls, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.22, ease: 'power2.out' })
      .to(closer, { autoAlpha: 1, x: 0, duration: 0.5 }, '+=0.3');
  },

  'next-week-teaser': (scene, visual) => {
    gsap.fromTo(scene.querySelectorAll('.animate-in'),
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
    );
    if (!visual) return;

    const W = 360, H = 240;
    const CX = 60, CY = H/2;          // user origin
    const AX = 200, AY = H/2;         // agent
    const RX = 320;                    // inference column
    const N = 7;                       // visible inference call lines

    const lines = Array.from({length:N}, (_, i) => {
      const yy = 30 + i * ((H - 60) / (N - 1));
      return `<line class="nw-call" id="nw-call-${i}"
                x1="${AX}" y1="${AY}" x2="${RX}" y2="${yy.toFixed(1)}"
                stroke="#c05a52" stroke-width="1.4" stroke-linecap="round"
                stroke-dasharray="160" stroke-dashoffset="160" opacity="0.85"/>
              <circle id="nw-tok-${i}" cx="${RX}" cy="${yy.toFixed(1)}" r="3.6"
                      fill="#c05a52" opacity="0"/>`;
    }).join('');

    visual.innerHTML = `
      <div class="chart-frame">
        <div class="chart-header">One question. Many calls.</div>
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;max-width:${W}px">
          <!-- user node -->
          <circle cx="${CX}" cy="${CY}" r="22" fill="#3b82f6" opacity="0.18"/>
          <circle cx="${CX}" cy="${CY}" r="14" fill="#3b82f6"/>
          <text x="${CX}" y="${CY+38}" text-anchor="middle" font-size="9" fill="#888">you</text>
          <text x="${CX}" y="${CY+50}" text-anchor="middle" font-size="8" fill="#555">1 question</text>

          <!-- arrow user → agent -->
          <line id="nw-link" x1="${CX+18}" y1="${CY}" x2="${AX-18}" y2="${AY}"
                stroke="#888" stroke-width="1.2"
                stroke-dasharray="160" stroke-dashoffset="160"/>

          <!-- agent node -->
          <circle cx="${AX}" cy="${AY}" r="22" fill="#c05a52" opacity="0.2"/>
          <circle cx="${AX}" cy="${AY}" r="14" fill="#c05a52"/>
          <text x="${AX}" y="${AY+38}" text-anchor="middle" font-size="9" fill="#888">agent</text>
          <text x="${AX}" y="${AY+50}" text-anchor="middle" font-size="8" fill="#555">retries · verifies</text>

          <!-- inference fan-out -->
          ${lines}

          <!-- inference column header -->
          <text x="${RX}" y="22" text-anchor="middle" font-size="9" fill="#888">inference calls</text>
          <text id="nw-count" x="${RX}" y="${H-10}" text-anchor="middle"
                font-size="11" font-weight="700" fill="#c05a52" opacity="0">20×</text>
        </svg>
        <p class="chart-caption">You ask one question. The agent fires twenty inference calls. Then it retries. Then it verifies. Then it bills you.</p>
      </div>`;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl.to('#nw-link', { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' });
    for (let i = 0; i < N; i++) {
      tl.to(`#nw-call-${i}`, { strokeDashoffset: 0, duration: 0.32, ease: 'power1.out' }, `+=${i===0?0.1:0.04}`);
      tl.to(`#nw-tok-${i}`,  { opacity: 1, duration: 0.18 }, '-=0.12');
    }
    tl.to('#nw-count', { opacity: 1, duration: 0.4 }, '+=0.2')
      .to('#nw-count', { scale: 1.15, transformOrigin: 'center', duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, '+=0.1');
  }
};
