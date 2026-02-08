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
            
            // To make the background image "stuck" to the tile:
            // 1. The background size must be the size of the whole grid relative to this tile.
            tile.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
            
            // 2. The background position must shift so this tile shows its specific slice.
            // Using percentages: (column / (total columns - 1)) * 100
            const posX = cols > 1 ? (c / (cols - 1)) * 100 : 0;
            const posY = rows > 1 ? (r / (rows - 1)) * 100 : 0;
            tile.style.backgroundPosition = `${posX}% ${posY}%`;

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

    window.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

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
                const rotateX = -dy * strength * 0.3; // Increased rotation for more "tilt" feel
                const rotateY = dx * strength * 0.3;
                const translateZ = strength * 80;

                tile.el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
            } else {
                tile.el.style.transform = '';
            }
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
});
