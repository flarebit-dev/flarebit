// ============================================
// FLAREBIT — NUI Script
// ============================================

(function() {
    'use strict';

    const CONTAINER_ID = 'flarebit-notification-container';
    const MAX_NOTIFICATIONS = 5;
    const ANIMATION_DURATION_ENTER = 550;
    const ANIMATION_DURATION_EXIT = 400;
    const ANIMATION_DURATION_REPOSITION = 500;

    // Active notifications: id -> { element, timeout, remaining, startTime, paused, payload }
    const activeNotifications = new Map();

    // ============================================
    // Icons per Variant (SVG)
    // ============================================

    const ICONS = {
        info: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`,
        success: `<polyline points="20 6 9 17 4 12"></polyline>`,
        warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`,
        error: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`
    };

    // ============================================
    // Notification Renderer
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

            // Capture current transform if any (during entry animation)
            const currentTransform = window.getComputedStyle(child).transform;
            const isEntering = !child.classList.contains('visible');

            // Don't disrupt entry animations
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
    // Hover Pause / Resume
    // ============================================

    function attachHoverHandlers(el, id) {
        el.addEventListener('mouseenter', () => {
            const entry = activeNotifications.get(id);
            if (!entry || entry.paused) return;

            // Calculate remaining time
            const elapsed = Date.now() - entry.startTime;
            const remaining = Math.max(0, entry.duration - elapsed);

            clearTimeout(entry.timeout);
            entry.paused = true;
            entry.remaining = remaining;
        });

        el.addEventListener('mouseleave', () => {
            const entry = activeNotifications.get(id);
            if (!entry || !entry.paused) return;

            // Resume with remaining time
            entry.paused = false;
            entry.startTime = Date.now();
            entry.duration = entry.remaining;
            entry.timeout = setTimeout(() => {
                removeNotification(id);
            }, entry.remaining);
        });

        // Click to dismiss
        el.addEventListener('click', () => {
            removeNotification(id);
        });
    }

    // ============================================
    // Notification Lifecycle
    // ============================================

    function showNotification(payload) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
            console.error('[Flarebit] Container not found');
            return;
        }

        // Enforce max — remove oldest if at limit
        if (activeNotifications.size >= MAX_NOTIFICATIONS) {
            const oldestId = activeNotifications.keys().next().value;
            removeNotification(oldestId, true);
        }

        // Capture positions BEFORE inserting new
        const firstPositions = captureFirstPositions(container);

        // Create + insert new at TOP
        const el = createNotificationElement(payload);
        container.insertBefore(el, container.firstChild);

        // Animate existing notifications (reposition)
        animateFromFirstPositions(container, firstPositions);

        // Trigger enter animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.add('visible');
            });
        });

        // Attach hover handlers
        attachHoverHandlers(el, payload.id);

        // Schedule auto-hide
        const duration = payload.duration || 4000;
        const timeoutId = setTimeout(() => {
            removeNotification(payload.id);
        }, duration);

        activeNotifications.set(payload.id, {
            element: el,
            timeout: timeoutId,
            duration: duration,
            startTime: Date.now(),
            paused: false,
            remaining: duration,
            payload: payload
        });
    }

    function removeNotification(id, immediate = false) {
    const entry = activeNotifications.get(id);
    if (!entry) return;

    clearTimeout(entry.timeout);
    activeNotifications.delete(id);

    const el = entry.element;
    const container = document.getElementById(CONTAINER_ID);

    // Clear any FLIP-leftover transforms BEFORE adding exit class
    el.style.transition = '';
    el.style.transform = '';

    // Trigger exit animation in next frame (so styles reset first)
    requestAnimationFrame(() => {
        el.classList.remove('visible');
        el.classList.add('exiting');
    });

    // Capture positions for the OTHER notifications
    setTimeout(() => {
        const firstPositions = container ? captureFirstPositions(container) : new Map();
        
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }

        // Animate remaining notifications to fill gap
        if (container) {
            animateFromFirstPositions(container, firstPositions);
        }
    }, immediate ? 0 : ANIMATION_DURATION_EXIT);
}

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
            default:
                console.warn('[Flarebit] Unknown action:', data.action);
        }
    });

    console.log('[Flarebit] NUI script loaded.');
})();