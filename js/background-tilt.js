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

    const rows = 12; // Slightly fewer rows/cols for clarity
    const cols = 12;
    const tiles = [];

    const PERSPECTIVE = 1000;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = document.createElement('div');
            tile.className = 'bg-tile';
            
            const posX = cols > 1 ? (c / (cols - 1)) * 100 : 0;
            const posY = rows > 1 ? (r / (rows - 1)) * 100 : 0;
            tile.style.backgroundPosition = `${posX}% ${posY}%`;
            tile.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;

            container.appendChild(tile);
            tiles.push({ el: tile, r, c });
        }
    }

    // Update grid template to match new rows/cols
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    let mouseX = -1000;
    let mouseY = -1000;

    const resetMouse = () => { mouseX = -1000; mouseY = -1000; };
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    document.addEventListener('mouseleave', resetMouse);
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') resetMouse();
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function rotateX(y, z, deg) {
        const rad = deg * Math.PI / 180;
        return [y * Math.cos(rad) - z * Math.sin(rad), y * Math.sin(rad) + z * Math.cos(rad)];
    }

    function rotateY(x, z, deg) {
        const rad = deg * Math.PI / 180;
        return [x * Math.cos(rad) + z * Math.sin(rad), -x * Math.sin(rad) + z * Math.cos(rad)];
    }

    function update() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const screenCenterX = vw / 2;
        const screenCenterY = vh / 2;
        const tileW = vw / cols;
        const tileH = vh / rows;

        ctx.clearRect(0, 0, vw, vh);
        
        tiles.forEach(tile => {
            const tCenterX = (tile.c + 0.5) * tileW;
            const tCenterY = (tile.r + 0.5) * tileH;
            const dx = tCenterX - mouseX;
            const dy = tCenterY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 450;

            if (dist < maxDist) {
                const strength = Math.pow(1 - dist / maxDist, 2);
                const rotX = -dy * strength * 0.25;
                const rotY = dx * strength * 0.25;
                const transZ = strength * 100;

                tile.el.style.transform = `scale(1.05) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${transZ}px)`;

                const halfW = (tileW / 2) * 1.05; 
                const halfH = (tileH / 2) * 1.05;
                const localCorners = [[-halfW, -halfH], [halfW, -halfH], [halfW, halfH], [-halfW, halfH]];

                const frontCorners = localCorners.map(([cx, cy]) => {
                    let x = cx, y = cy, z = transZ;
                    [x, z] = rotateY(x, z, rotY);
                    [y, z] = rotateX(y, z, rotX);
                    const gX = x + (tCenterX - screenCenterX);
                    const gY = y + (tCenterY - screenCenterY);
                    const f = PERSPECTIVE / (PERSPECTIVE - z);
                    return { x: gX * f + screenCenterX, y: gY * f + screenCenterY };
                });

                // Instead of the vanishing point, we project to a "back" plane to create a slab/block effect
                const backCorners = localCorners.map(([cx, cy]) => {
                    let x = cx, y = cy, z = -50; // Fixed depth back from the grid plane
                    [x, z] = rotateY(x, z, rotY);
                    [y, z] = rotateX(y, z, rotX);
                    const gX = x + (tCenterX - screenCenterX);
                    const gY = y + (tCenterY - screenCenterY);
                    const f = PERSPECTIVE / (PERSPECTIVE - z);
                    return { x: gX * f + screenCenterX, y: gY * f + screenCenterY };
                });

                // Draw the 4 sides
                frontCorners.forEach((p, i) => {
                    const nextI = (i + 1) % 4;
                    const pNext = frontCorners[nextI];
                    const bP = backCorners[i];
                    const bNext = backCorners[nextI];

                    // Shading based on side index
                    const baseColor = 20 + (i * 10);
                    ctx.fillStyle = `rgba(${baseColor}, ${baseColor}, ${baseColor + 10}, ${0.95 * strength})`;
                    
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(pNext.x, pNext.y);
                    ctx.lineTo(bNext.x, bNext.y);
                    ctx.lineTo(bP.x, bP.y);
                    ctx.closePath();
                    ctx.fill();

                    // Edge highlight
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * strength})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                });

            } else {
                tile.el.style.transform = 'scale(1.05)';
            }
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
});