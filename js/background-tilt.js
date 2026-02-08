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

    const rows = 12;
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

    function rotateX(y, z, rad) {
        return [y * Math.cos(rad) - z * Math.sin(rad), y * Math.sin(rad) + z * Math.cos(rad)];
    }

    function rotateY(x, z, rad) {
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
        
        // Calculate all tile data first for sorting
        const tileData = tiles.map(tile => {
            const tCenterX = (tile.c + 0.5) * tileW;
            const tCenterY = (tile.r + 0.5) * tileH;
            const dx = tCenterX - mouseX;
            const dy = tCenterY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 450;
            
            let rotX = 0, rotY = 0, transZ = 0, strength = 0;

            if (dist < maxDist) {
                strength = Math.pow(1 - dist / maxDist, 2);
                rotX = -dy * strength * 0.005; // Using radians for internal math
                rotY = dx * strength * 0.005;
                transZ = strength * 100;
                tile.el.style.transform = `scale(1.002) rotateX(${rotX * 180 / Math.PI}deg) rotateY(${rotY * 180 / Math.PI}deg) translateZ(${transZ}px)`;
            } else {
                tile.el.style.transform = 'scale(1.002)';
            }

            return { tile, tCenterX, tCenterY, rotX, rotY, transZ, strength };
        });

        // Sort by Z depth (Painter's algorithm)
        tileData.sort((a, b) => a.transZ - b.transZ);

        tileData.forEach(data => {
            if (data.strength <= 0) return;

            const halfW = (tileW / 2) * 1.002; 
            const halfH = (tileH / 2) * 1.002;
            const localCorners = [[-halfW, -halfH], [halfW, -halfH], [halfW, halfH], [-halfW, halfH]];

            const project = (cx, cy, cz) => {
                let x = cx, y = cy, z = cz;
                [x, z] = rotateY(x, z, data.rotY);
                [y, z] = rotateX(y, z, data.rotX);
                const gX = x + (data.tCenterX - screenCenterX);
                const gY = y + (data.tCenterY - screenCenterY);
                const f = PERSPECTIVE / (PERSPECTIVE - z);
                return { x: gX * f + screenCenterX, y: gY * f + screenCenterY };
            };

            const frontCorners = localCorners.map(([cx, cy]) => project(cx, cy, data.transZ));
            const backCorners = localCorners.map(([cx, cy]) => project(cx, cy, 0));

            // Draw the 4 sides
            frontCorners.forEach((p, i) => {
                const nextI = (i + 1) % 4;
                const pNext = frontCorners[nextI];
                const bP = backCorners[i];
                const bNext = backCorners[nextI];

                const sideColor = 15 + (i * 10);
                ctx.fillStyle = `rgba(${sideColor}, ${sideColor}, ${sideColor + 5}, ${0.9 * data.strength})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y); ctx.lineTo(pNext.x, pNext.y);
                ctx.lineTo(bNext.x, bNext.y); ctx.lineTo(bP.x, bP.y);
                ctx.closePath();
                ctx.fill();
            });

            // Draw the "top" face on canvas to prevent seeing through the box
            // We use the same color as the background image's average or just a dark fill
            // so it acts as an occlusion mask.
            ctx.fillStyle = `rgba(10, 10, 10, ${data.strength})`;
            ctx.beginPath();
            ctx.moveTo(frontCorners[0].x, frontCorners[0].y);
            frontCorners.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fill();
            
            // Edge highlight
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * data.strength})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
});
