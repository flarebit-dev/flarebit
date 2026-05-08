// ============================================
// FLAREBIT — NUI Script
// ============================================

(function() {
    'use strict';

    const CONTAINER_ID = 'flarebit-notification-container';

    // ============================================
    // Notification Renderer
    // ============================================

    function createNotificationElement(payload) {
        const el = document.createElement('div');
        el.className = 'flarebit-notification';
        el.dataset.id = payload.id;
        el.dataset.variant = payload.variant || 'info';

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
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span class="flarebit-notification__meta-time">now</span>
                </div>
            </div>
        `;

        el.querySelector('.flarebit-notification__title').textContent = payload.title || '';
        el.querySelector('.flarebit-notification__subtitle').textContent = payload.subtitle || '';

        return el;
    }

    function showNotification(payload) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
            console.error('[Flarebit] Container not found');
            return;
        }

        const el = createNotificationElement(payload);
        container.appendChild(el);

        // Trigger enter animation (next frame)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.add('visible');
            });
        });

        // Auto-hide
        const duration = payload.duration || 4000;
        setTimeout(() => {
            removeNotification(el);
        }, duration);
    }

    function removeNotification(el) {
        if (!el || !el.parentNode) return;

        el.classList.remove('visible');
        el.classList.add('exiting');

        // Wait for exit animation, then remove from DOM
        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 500);
    }

    // ============================================
    // Message Handler
    // ============================================

    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || !data.action) return;

        console.log('[Flarebit] NUI message:', data);

        switch (data.action) {
            case 'flarebit:notify':
                showNotification(data.payload || {});
                break;
            default:
                console.warn('[Flarebit] Unknown action:', data.action);
        }
    });

    console.log('[Flarebit] NUI script loaded.');
})();