// ============================================
// FLAREBIT — NUI Script
// ============================================

(function() {
    'use strict';

    const CONTAINER_ID = 'flarebit-notification-container';

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

    function showNotification(payload) {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
            console.error('[Flarebit] Container not found');
            return;
        }

        const el = createNotificationElement(payload);
        container.appendChild(el);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.add('visible');
            });
        });

        const duration = payload.duration || 4000;
        setTimeout(() => {
            removeNotification(el);
        }, duration);
    }

    function removeNotification(el) {
        if (!el || !el.parentNode) return;

        el.classList.remove('visible');
        el.classList.add('exiting');

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