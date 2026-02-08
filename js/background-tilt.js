document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'background-grid-container';
    document.body.prepend(container);

    const rows = 15;
    const cols = 15;
    const tiles = [];

    // Create tiles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = document.createElement('div');
            tile.className = 'bg-tile';
            container.appendChild(tile);
            tiles.push({
                el: tile,
                r: r,
                c: c
            });
        }
    }

    let mouseX = -1000;
    let mouseY = -1000;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    });

    function update() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        const tileW = vw / cols;
        const tileH = vh / rows;

        tiles.forEach(tile => {
            const centerX = (tile.c + 0.5) * tileW;
            const centerY = (tile.r + 0.5) * tileH;

            const dx = centerX - mouseX;
            const dy = centerY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const maxDist = 400;
            if (dist < maxDist) {
                const strength = Math.pow(1 - dist / maxDist, 2);
                // Rotate more for more drama
                const rotateX = -dy * strength * 0.25;
                const rotateY = dx * strength * 0.25;
                const translateZ = strength * 60;

                tile.el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
            } else {
                tile.el.style.transform = '';
            }
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
});