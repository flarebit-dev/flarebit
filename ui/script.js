// ============================================
// FLAREBIT — NUI Script
// ============================================

(function() {
    'use strict';

    const VALID_POSITIONS = [
        'top-left', 'top-center', 'top-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    ];
    const DEFAULT_POSITION = 'top-center';
    const MAX_NOTIFICATIONS_PER_POSITION = 5;
    const ANIMATION_DURATION_EXIT = 400;
    const ANIMATION_DURATION_REPOSITION = 500;

    const activeNotifications = new Map();

    // ============================================
    // Sound System (Web Audio API)
    // ============================================

    let audioContext = null;
    let globalVolume = 0.4;
    let globalMuted = false;

    function getAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('[Flarebit] Web Audio not supported');
                return null;
            }
        }
        return audioContext;
    }

    /**
     * Plays a sound for the given variant.
     * Each variant has a distinct sonic identity.
     */
    function playSound(variant) {
        if (globalMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        // Resume if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        switch (variant) {
            case 'success':
                playSuccessSound(ctx, now);
                break;
            case 'error':
                playErrorSound(ctx, now);
                break;
            case 'warning':
                playWarningSound(ctx, now);
                break;
            case 'info':
            default:
                playInfoSound(ctx, now);
                break;
        }
    }

    // Info: subtle two-tone chime (ascending)
    function playInfoSound(ctx, now) {
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(globalVolume * 0.5, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(1100, now + 0.08);
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.4);
    }

    // Success: pleasant bright two-note (major third up)
    function playSuccessSound(ctx, now) {
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(globalVolume * 0.6, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.15);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, now + 0.1); // B5
        osc2.connect(gain);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
    }

    // Warning: descending two-tone (attention-grabbing but not alarming)
    function playWarningSound(ctx, now) {
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(globalVolume * 0.55, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(660, now);
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.18);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(495, now + 0.18);
        osc2.connect(gain);
        osc2.start(now + 0.18);
        osc2.stop(now + 0.5);
    }

    // Error: short low buzz (urgent but tasteful)
    function playErrorSound(ctx, now) {
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(globalVolume * 0.55, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.35);
    }

    // ============================================
    // Icons per Variant
    // ============================================

    const ICONS = {
        info: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`,
        success: `<polyline points="20 6 9 17 4 12"></polyline>`,
        warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`,
        error: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`
    };

    // ============================================
    // Utility
    // ============================================

    function getContainerForPosition(position) {
        return document.querySelector(`.flarebit-notification-container[data-position="${position}"]`);
    }

    function getNotificationsByPosition(position) {
        return Array.from(activeNotifications.values()).filter(n => n.position === position);
    }

    // ============================================
    // Renderer
    // ============================================

    function createNotificationElement(payload) {
        const variant = payload.variant || 'info';
        const iconSvg = ICONS[variant] || ICONS.info;

        const el = document.createElement('div');
        el.className = 'flarebit-notification';
        el.dataset.id = payload.id;
        el.dataset.variant = variant;

        el.innerHTML = `
            <div class="flarebit-notification__glow"></div>
            <div class="flarebit-notification__inner">
                <div class="flarebit-notification__icon">
                    <div class="flarebit-notification__dot-outer">
                        <div class="flarebit-notification__dot-inner"></div>
                    </div>
                </div>
                <div class="flarebit-notification__content">
                    <div class="flarebit-notification__title"></div>
                    <div class="flarebit-notification__subtitle"></div>
                </div>
                <div class="flarebit-notification__meta">
                    <svg class="flarebit-notification__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${iconSvg}
                    </svg>
                    <span class="flarebit-notification__meta-time">now</span>
                </div>
                <div class="flarebit-notification__progress">
                    <div class="flarebit-notification__progress-fill"></div>
                </div>
            </div>
        `;

        el.querySelector('.flarebit-notification__title').textContent = payload.title || '';
        el.querySelector('.flarebit-notification__subtitle').textContent = payload.subtitle || '';

        return el;
    }

    // ============================================
    // FLIP Animation Helper
    // ============================================

    function captureFirstPositions(container) {
        const positions = new Map();
        const children = container.querySelectorAll('.flarebit-notification');
        children.forEach((child) => {
            const id = child.dataset.id;
            positions.set(id, child.getBoundingClientRect().top);
        });
        return positions;
    }

    function animateFromFirstPositions(container, firstPositions) {
        const children = container.querySelectorAll('.flarebit-notification');
        children.forEach((child) => {
            const id = child.dataset.id;
            const firstTop = firstPositions.get(id);
            if (firstTop === undefined) return;

            const lastTop = child.getBoundingClientRect().top;
            const deltaY = firstTop - lastTop;

            if (Math.abs(deltaY) < 1) return;

            const isEntering = !child.classList.contains('visible');
            if (isEntering) return;

            child.style.transition = 'none';
            child.style.transform = `translateY(${deltaY}px)`;

            requestAnimationFrame(() => {
                child.style.transition = `transform ${ANIMATION_DURATION_REPOSITION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
                child.style.transform = '';
            });
        });
    }

    // ============================================
    // Progress Bar Animation
    // ============================================

    function startProgressAnimation(el, duration) {
        const fill = el.querySelector('.flarebit-notification__progress-fill');
        if (!fill) return;

        return fill.animate(
            [
                { transform: 'scaleX(1)' },
                { transform: 'scaleX(0)' }
            ],
            {
                duration: duration,
                easing: 'linear',
                fill: 'forwards'
            }
        );
    }

    // ============================================
    // Hover Pause / Click Dismiss
    // ============================================

    function attachHoverHandlers(el, id) {
        el.addEventListener('mouseenter', () => {
            const entry = activeNotifications.get(id);
            if (!entry || entry.paused) return;

            const elapsed = Date.now() - entry.startTime;
            const remaining = Math.max(0, entry.duration - elapsed);

            clearTimeout(entry.timeout);
            entry.paused = true;
            entry.remaining = remaining;

            if (entry.progressAnimation) {
                entry.progressAnimation.pause();
            }
        });

        el.addEventListener('mouseleave', () => {
            const entry = activeNotifications.get(id);
            if (!entry || !entry.paused) return;

            entry.paused = false;
            entry.startTime = Date.now();
            entry.duration = entry.remaining;
            entry.timeout = setTimeout(() => {
                removeNotification(id);
            }, entry.remaining);

            if (entry.progressAnimation) {
                entry.progressAnimation.play();
            }
        });

        el.addEventListener('click', () => {
            removeNotification(id);
        });
    }

    // ============================================
    // Notification Lifecycle
    // ============================================

    function showNotification(payload) {
        const position = VALID_POSITIONS.includes(payload.position) 
            ? payload.position 
            : DEFAULT_POSITION;

        const container = getContainerForPosition(position);
        if (!container) {
            console.error('[Flarebit] Container not found for position:', position);
            return;
        }

        const inThisPosition = getNotificationsByPosition(position);
        if (inThisPosition.length >= MAX_NOTIFICATIONS_PER_POSITION) {
            const oldest = inThisPosition[0];
            removeNotification(oldest.id, true);
        }

        const firstPositions = captureFirstPositions(container);

        const el = createNotificationElement(payload);
        container.insertBefore(el, container.firstChild);

        animateFromFirstPositions(container, firstPositions);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.add('visible');
            });
        });

        attachHoverHandlers(el, payload.id);

        // Play sound (unless explicitly muted)
        if (payload.sound !== false) {
            playSound(payload.variant || 'info');
        }

        const duration = payload.duration || 4000;

        setTimeout(() => {
            const animation = startProgressAnimation(el, duration);
            const entry = activeNotifications.get(payload.id);
            if (entry) {
                entry.progressAnimation = animation;
            }
        }, 100);

        const timeoutId = setTimeout(() => {
            removeNotification(payload.id);
        }, duration);

        activeNotifications.set(payload.id, {
            id: payload.id,
            element: el,
            timeout: timeoutId,
            duration: duration,
            startTime: Date.now(),
            paused: false,
            remaining: duration,
            progressAnimation: null,
            position: position,
            payload: payload
        });
    }

    function removeNotification(id, immediate = false) {
        const entry = activeNotifications.get(id);
        if (!entry) return;

        clearTimeout(entry.timeout);

        if (entry.progressAnimation) {
            entry.progressAnimation.cancel();
        }

        activeNotifications.delete(id);

        const el = entry.element;
        const container = getContainerForPosition(entry.position);

        el.style.transition = '';
        el.style.transform = '';

        requestAnimationFrame(() => {
            el.classList.remove('visible');
            el.classList.add('exiting');
        });

        setTimeout(() => {
            const firstPositions = container ? captureFirstPositions(container) : new Map();

            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }

            if (container) {
                animateFromFirstPositions(container, firstPositions);
            }
        }, immediate ? 0 : ANIMATION_DURATION_EXIT);
    }

    // ============================================
// ============================================
    // Message Handler
    // ============================================

    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || !data.action) return;

        switch (data.action) {
            case 'flarebit:notify':
                showNotification(data.payload || {});
                break;
            case 'flarebit:dismiss':
                if (data.id) removeNotification(data.id);
                break;
            case 'flarebit:dismissAll':
                Array.from(activeNotifications.keys()).forEach((id) => {
                    removeNotification(id);
                });
                break;
            case 'flarebit:setVolume':
                if (typeof data.volume === 'number') {
                    globalVolume = Math.max(0, Math.min(1, data.volume));
                }
                break;
            case 'flarebit:setMuted':
                globalMuted = !!data.muted;
                break;
            case 'flarebit:setTheme':
                if (data.theme && ['refined', 'cinematic', 'minimal'].includes(data.theme)) {
                    const app = document.getElementById('flarebit-app');
                    if (app) app.dataset.theme = data.theme;
                }
                break;
            default:
                console.warn('[Flarebit] Unknown action:', data.action);
        }
    });

    // ============================================
    // Audio Init Hack (browser autoplay policy)
    // ============================================
    // First user interaction unlocks audio. We trigger it on first message.
    let audioUnlocked = false;
    function unlockAudio() {
        if (audioUnlocked) return;
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().then(() => {
                audioUnlocked = true;
            });
        } else {
            audioUnlocked = true;
        }
    }
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    console.log('[Flarebit] NUI script loaded.');
})();