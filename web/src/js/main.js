document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('custom-cursor');
    
    // Custom Cursor Movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    });

    // Cursor Scale on Interactables
    const interactables = document.querySelectorAll('button, a, .feature-card, .code-card');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.transform += ' scale(1.5)';
            cursor.style.backgroundColor = 'rgba(124, 58, 237, 0.3)';
            cursor.style.border = '2px solid #7c3aed';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = '#7c3aed';
            cursor.style.border = 'none';
        });
    });

    // Scroll Revel Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .section-header, .hero-content, .hero-visual').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
});
