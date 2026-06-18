/**
 * Geetha Constructions - Premium Audio Controller
 * Handles background ambient loop, interactive hovers, click sounds,
 * and page transition sound effects with custom UI audio indicator.
 * Optimised with Web Audio API for sub-millisecond latency.
 */

class PremiumAudioController {
  constructor() {
    // Compressed MP3 Audio Paths (Relative to support file:// protocol)
    this.ambientSrc = 'public_assets/audio/ambient-loop.mp3';
    this.hoverSrc = 'public_assets/audio/hover.mp3';
    this.secondaryHoverSrc = 'public_assets/audio/secondary-hover.mp3';
    this.clickSrc = 'public_assets/audio/click.mp3';
    this.transitionSrc = 'public_assets/audio/home-transition.mp3';
    this.modalSrc = 'public_assets/audio/modal-open.mp3';

    // State management
    this.isMuted = localStorage.getItem('gc-audio-muted') === 'true';
    this.hasInteracted = false;
    this.ambientAudio = null;

    // Web Audio API State
    this.audioCtx = null;
    this.gainNode = null;
    this.buffers = {};
    this.pendingDecodes = [];
    this.useHtmlFallback = {};
    this.htmlPools = {};
    this.poolSize = 4;

    // Compatibility layer stubs for legacy scripts (e.g., investors.html)
    this.hoverPool = [];
    this.clickPool = [];
    this.secondaryHoverAudio = {
      currentTime: 0,
      play: () => {
        this.playEffect('secondaryHover');
        return Promise.resolve();
      }
    };
    this.transitionAudio = {
      currentTime: 0,
      play: () => {
        this.playEffect('transition');
        return Promise.resolve();
      }
    };
    this.modalAudio = {
      currentTime: 0,
      play: () => {
        this.playEffect('modal');
        return Promise.resolve();
      }
    };

    this.init();
  }

  init() {
    // 1. Create standard ambient Audio element (HTML5 is reliable for streaming loops)
    this.createAmbientElement();

    // 2. Pre-fetch sound effects immediately to start loading them as AudioBuffers
    this.prefetchSoundEffects();

    // 3. Insert premium sound waves toggle in the header
    this.injectAudioToggle();

    // 4. Set up event delegation for hover and click sounds
    this.setupEventListeners();

    // 5. Hook into Taxi.js transitions if present
    this.setupTaxiHooks();
  }

  createAmbientElement() {
    this.ambientAudio = new Audio(this.ambientSrc);
    this.ambientAudio.loop = true;
    this.ambientAudio.volume = this.isMuted ? 0 : 0.4; // Slightly louder ambient volume
    this.ambientAudio.preload = 'auto';
  }

  prefetchSoundEffects() {
    this.loadSound('hover', this.hoverSrc);
    this.loadSound('secondaryHover', this.secondaryHoverSrc);
    this.loadSound('click', this.clickSrc);
    this.loadSound('transition', this.transitionSrc);
    this.loadSound('modal', this.modalSrc);
  }

  getSrcByName(name) {
    switch (name) {
      case 'hover': return this.hoverSrc;
      case 'secondaryHover': return this.secondaryHoverSrc;
      case 'click': return this.clickSrc;
      case 'transition': return this.transitionSrc;
      case 'modal': return this.modalSrc;
      default: return '';
    }
  }

  getEffectVolume(name) {
    switch (name) {
      case 'hover': return 0.15;
      case 'secondaryHover': return 0.1;
      case 'click': return 0.25;
      case 'transition': return 0.3;
      case 'modal': return 0.25;
      default: return 0.2;
    }
  }

  async loadSound(name, src) {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      
      if (!this.audioCtx) {
        this.pendingDecodes.push({ name, arrayBuffer });
      } else {
        await this.decodeAndCache(name, arrayBuffer);
      }
    } catch (error) {
      console.warn(`Web Audio API failed to load "${name}" from "${src}" (CORS/file:// or network issue). Falling back to HTML5 Audio pool.`, error);
      this.initHtmlFallback(name, src);
    }
  }

  initHtmlFallback(name, src) {
    this.useHtmlFallback[name] = true;
    this.htmlPools[name] = [];
    for (let i = 0; i < this.poolSize; i++) {
      const aud = new Audio(src);
      aud.volume = this.isMuted ? 0 : this.getEffectVolume(name);
      aud.preload = 'auto';
      this.htmlPools[name].push(aud);
    }
  }

  ensureAudioContext() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      // Process any audio files that were loaded before context was created
      while (this.pendingDecodes.length > 0) {
        const { name, arrayBuffer } = this.pendingDecodes.shift();
        this.decodeAndCache(name, arrayBuffer);
      }
    } catch (e) {
      console.error("Failed to create AudioContext:", e);
    }
  }

  async decodeAndCache(name, arrayBuffer) {
    try {
      if (!this.audioCtx) return;
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.buffers[name] = audioBuffer;
    } catch (error) {
      console.error(`Failed to decode audio data for "${name}":`, error);
      this.initHtmlFallback(name, this.getSrcByName(name));
    }
  }

  unlockAudioContext() {
    this.ensureAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(e => console.warn('Failed to resume AudioContext:', e));
    }
  }

  playEffect(name) {
    if (this.isMuted) return;

    this.unlockAudioContext();

    if (this.buffers[name] && this.audioCtx) {
      try {
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffers[name];

        const effectGain = this.audioCtx.createGain();
        effectGain.gain.setValueAtTime(this.getEffectVolume(name), this.audioCtx.currentTime);

        source.connect(effectGain);
        effectGain.connect(this.gainNode);
        source.start(0);
      } catch (e) {
        console.warn(`Error playing Web Audio effect: ${name}, playing HTML5 fallback instead.`, e);
        this.playHtmlFallback(name);
      }
    } else {
      this.playHtmlFallback(name);
    }
  }

  playHtmlFallback(name) {
    const pool = this.htmlPools[name];
    if (pool && pool.length > 0) {
      const audio = pool.find(a => a.paused) || pool[0];
      audio.currentTime = 0;
      audio.volume = this.isMuted ? 0 : this.getEffectVolume(name);
      audio.play().catch(e => console.log(`HTML5 fallback play blocked for ${name}:`, e));
    } else {
      const src = this.getSrcByName(name);
      if (src) {
        const tempAudio = new Audio(src);
        tempAudio.volume = this.isMuted ? 0 : this.getEffectVolume(name);
        tempAudio.play().catch(() => {});
      }
    }
  }

  setupEventListeners() {
    // Play background ambient on first interaction
    const unlockAudio = () => {
      this.unlockAudioContext();

      if (!this.isMuted) {
        const playPromise = this.ambientAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            if (!this.hasInteracted) {
              this.hasInteracted = true;
              window.removeEventListener('click', unlockAudio);
              window.removeEventListener('touchstart', unlockAudio);
              window.removeEventListener('keydown', unlockAudio);
            }
          }).catch(e => {
            console.log('Audio ambient autoplay blocked, waiting for next interaction: ', e);
            // Don't set hasInteracted=true so it can retry on the next click
          });
        }
      } else {
        // If it's muted, we just consider it unlocked
        this.hasInteracted = true;
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Event Delegation: Hover effects
    let lastHoveredElement = null;
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, .strategy_nav_item, .standard_block_item, .about_team_item, .geetha_project_item, .geetha_map_pin');
      if (!target || target === lastHoveredElement) return;
      lastHoveredElement = target;

      // Play hover sound
      if (target.classList.contains('header_nav_link') || target.classList.contains('link') || target.classList.contains('strategy_nav_item') || target.classList.contains('geetha_project_item') || target.classList.contains('geetha_map_pin')) {
        this.playEffect('hover');
      } else {
        // Soft hover for standard items
        this.playEffect('secondaryHover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, .strategy_nav_item, .standard_block_item, .about_team_item, .geetha_project_item, .geetha_map_pin');
      if (target) {
        lastHoveredElement = null;
      }
    });

    // Event Delegation: Click effects
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, .strategy_nav_item, .geetha_project_item, .geetha_map_pin');
      if (!target) return;
      
      this.playEffect('click');
    });
  }

  playFromPool(pool) {
    if (this.isMuted) return;
    
    // Compatibility interceptor for legacy scripts (like map markers in investors.html)
    if (pool === this.hoverPool) {
      this.playEffect('hover');
    } else if (pool === this.clickPool) {
      this.playEffect('click');
    } else {
      // Standard HTML5 pool playback if external scripts pass a custom pool
      const audio = pool.find(a => a.paused) || pool[0];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    }
  }

  playTransition() {
    this.playEffect('transition');
  }

  setupTaxiHooks() {
    // Hook into Taxi.js transitions to play transition sound
    document.addEventListener('taxi:transition-out', () => {
      this.playTransition();
    });
  }

  injectAudioToggle() {
    // Build premium SVG soundwave toggler
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'header_audio_toggle';
    toggleContainer.id = 'gc-audio-toggle';
    toggleContainer.innerHTML = `
      <div class="audio_toggle_icon">
        <svg id="gc-sound-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: inherit; display: block;">
          <!-- Speaker Horn -->
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <!-- Sound waves (hidden when muted) -->
          <path class="sound-wave-arc" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path class="sound-wave-arc" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <!-- Mute lines (visible when muted) -->
          <line class="sound-mute-line" x1="22" y1="9" x2="16" y2="15" style="display: none;" />
          <line class="sound-mute-line" x1="16" y1="9" x2="22" y2="15" style="display: none;" />
        </svg>
      </div>
      <div class="audio_toggle_wave ${this.isMuted ? 'is--muted' : ''}">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="audio_toggle_label ff0">SOUND</div>
    `;

    // Append styles directly
    const style = document.createElement('style');
    style.innerHTML = `
      .header_audio_toggle {
        display: flex;
        align-items: center;
        grid-column-gap: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        user-select: none;
        z-index: 1001;
        opacity: 0.6;
        transition: opacity 0.3s;
      }
      .header_audio_toggle:hover {
        opacity: 1;
      }
      .audio_toggle_icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        opacity: 0.8;
      }
      .audio_toggle_label {
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        color: var(--_color-values---swatch--red, #FF2C2F);
      }
      .audio_toggle_wave {
        display: flex;
        align-items: flex-end;
        grid-column-gap: 2.5px;
        width: 16px;
        height: 12px;
      }
      .audio_toggle_wave span {
        width: 1.5px;
        height: 100%;
        background-color: var(--_color-values---swatch--red, #FF2C2F);
        animation: audioWave 1.2s ease-in-out infinite alternate;
        transform-origin: bottom center;
      }
      .audio_toggle_wave span:nth-child(1) { animation-delay: 0.1s; }
      .audio_toggle_wave span:nth-child(2) { animation-delay: 0.4s; }
      .audio_toggle_wave span:nth-child(3) { animation-delay: 0.2s; }
      .audio_toggle_wave span:nth-child(4) { animation-delay: 0.5s; }

      .audio_toggle_wave.is--muted span {
        animation: none;
        height: 1.5px !important;
        background-color: currentColor;
        opacity: 0.4;
      }

      @keyframes audioWave {
        0% { transform: scaleY(0.15); }
        100% { transform: scaleY(1); }
      }

      /* Desktop positioning inside the header */
      @media screen and (min-width: 768px) {
        #gc-audio-toggle {
          margin-left: 1.5rem;
          margin-right: -0.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Place the toggle in the header block
    const targetHeader = document.querySelector('.header_brand_group');
    if (targetHeader) {
      targetHeader.appendChild(toggleContainer);
    }

    // Initialize the icon visual state
    this.updateIconState();

    // Toggle behavior
    toggleContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMute();
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('gc-audio-muted', this.isMuted);

    const wave = document.querySelector('.audio_toggle_wave');
    if (wave) {
      if (this.isMuted) {
        wave.classList.add('is--muted');
        this.ambientAudio.pause();
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        }
      } else {
        wave.classList.remove('is--muted');
        this.unlockAudioContext();
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(1, this.audioCtx.currentTime);
        }
        this.ambientAudio.volume = 0.4;
        if (this.hasInteracted) {
          this.ambientAudio.play().catch(() => {});
        }
      }
    }

    // Toggle SVG icon paths
    this.updateIconState();
  }

  updateIconState() {
    const soundWaves = document.querySelectorAll('#gc-sound-icon .sound-wave-arc');
    const muteLines = document.querySelectorAll('#gc-sound-icon .sound-mute-line');

    if (this.isMuted) {
      soundWaves.forEach(w => w.style.display = 'none');
      muteLines.forEach(l => l.style.display = 'block');
    } else {
      soundWaves.forEach(w => w.style.display = 'block');
      muteLines.forEach(l => l.style.display = 'none');
    }
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  window.GCAudioController = new PremiumAudioController();
});
