// ============================================
// FLAREBIT — NUI SCRIPT
// ============================================

window.addEventListener('message', (event) => {
    const data = event.data;

    console.log('[Flarebit] NUI message:', data);

    if (data.action === 'test') {
        showNotification({
            title: data.title || 'Flarebit is alive',
            subtitle: data.subtitle || 'System online and operational.',
            duration: data.duration || 4000
        });
    }
});

function showNotification({ title, subtitle, duration }) {
    const el = document.getElementById('notification');
    if (!el) return;

    const titleEl = el.querySelector('.notification-title');
    const subtitleEl = el.querySelector('.notification-subtitle');

    if (titleEl && title) titleEl.textContent = title;
    if (subtitleEl && subtitle) subtitleEl.textContent = subtitle;

    // Reset state
    el.classList.remove('hidden');

    // Trigger enter animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.classList.add('visible');
        });
    });

    // Auto-hide
    setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => {
            el.classList.add('hidden');
        }, 500);
    }, duration);
}