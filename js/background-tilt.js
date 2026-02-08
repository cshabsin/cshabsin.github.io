document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'background-grid-container';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'background-lines-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    document.body.prepend(container);

    const ctx = canvas.getContext('2d');

    const rows = 15;
    const cols = 15;
    const tiles = [];

    // Create tiles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = document.createElement('div');
            tile.className = 'bg-tile';
            
            const posX = cols > 1 ? (c / (cols - 1)) * 100 : 0;
            const posY = rows > 1 ? (r / (rows - 1)) * 100 : 0;
            tile.style.backgroundPosition = `${posX}% ${posY}%`;
            tile.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;

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

    const resetMouse = () => {
        mouseX = -1000;
        mouseY = -1000;
    };

    document.addEventListener('mouseleave', resetMouse);
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
            resetMouse();
        }
    });

    window.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function update() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const centerX = vw / 2;
        const centerY = vh / 2;
        
        const tileW = vw / cols;
        const tileH = vh / rows;

        ctx.clearRect(0, 0, vw, vh);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        tiles.forEach(tile => {
            const tCenterX = (tile.c + 0.5) * tileW;
            const tCenterY = (tile.r + 0.5) * tileH;

            const dx = tCenterX - mouseX;
            const dy = tCenterY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const maxDist = 400;
            if (dist < maxDist) {
                const strength = Math.pow(1 - dist / maxDist, 2);
                const rotateX = -dy * strength * 0.3;
                const rotateY = dx * strength * 0.3;
                const translateZ = strength * 80;

                tile.el.style.transform = `scale(1.1) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;

                // Draw projection lines to vanishing point (center of screen)
                // We'll draw from the 4 corners of the tile's current position
                // To keep it simple and performant, we use the tile's grid corners
                const corners = [
                    { x: tile.c * tileW, y: tile.r * tileH },
                    { x: (tile.c + 1) * tileW, y: tile.r * tileH },
                    { x: (tile.c + 1) * tileW, y: (tile.r + 1) * tileH },
                    { x: tile.c * tileW, y: (tile.r + 1) * tileH }
                ];

                ctx.beginPath();
                corners.forEach(corner => {
                    ctx.moveTo(corner.x, corner.y);
                    ctx.lineTo(centerX, centerY);
                });
                ctx.stroke();

            } else {
                tile.el.style.transform = 'scale(1.1)';
            }
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
});