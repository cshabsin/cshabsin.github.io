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
            tiles.push({
                el: tile,
                r: r,
                c: c
            });
        }
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const resetMouse = () => {
        mouseX = -1000;
        mouseY = -1000;
    };

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
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
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [y * cos - z * sin, y * sin + z * cos];
    }

    function rotateY(x, z, deg) {
        const rad = deg * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [x * cos + z * sin, -x * sin + z * cos];
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
            
            const maxDist = 400;
            if (dist < maxDist) {
                const strength = Math.pow(1 - dist / maxDist, 2);
                const rotX = -dy * strength * 0.3;
                const rotY = dx * strength * 0.3;
                const transZ = strength * 80;

                tile.el.style.transform = `scale(1.1) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${transZ}px)`;

                const halfW = (tileW / 2) * 1.1; 
                const halfH = (tileH / 2) * 1.1;
                const localCorners = [[-halfW, -halfH], [halfW, -halfH], [halfW, halfH], [-halfW, halfH]];

                const projectedCorners = localCorners.map(([cx, cy]) => {
                    let x = cx, y = cy, z = 0;
                    z += transZ;
                    [x, z] = rotateY(x, z, rotY);
                    [y, z] = rotateX(y, z, rotX);

                    const globalX = x + (tCenterX - screenCenterX);
                    const globalY = y + (tCenterY - screenCenterY);
                    const factor = PERSPECTIVE / (PERSPECTIVE - z);
                    return {
                        x: globalX * factor + screenCenterX,
                        y: globalY * factor + screenCenterY
                    };
                });

                // Draw opaque sides by filling triangles to vanishing point
                // Using a dark color that's slightly transparent to allow some overlapping logic to look natural
                projectedCorners.forEach((p, i) => {
                    const nextP = projectedCorners[(i + 1) % 4];
                    
                    // Basic shading: color varies based on which side it is
                    const shade = 10 + (i * 15); 
                    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.9 * strength})`;
                    
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(nextP.x, nextP.y);
                    ctx.lineTo(screenCenterX, screenCenterY);
                    ctx.closePath();
                    ctx.fill();

                    // Optional: add a slight stroke to define edges
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * strength})`;
                    ctx.stroke();
                });

            } else {
                tile.el.style.transform = 'scale(1.1)';
            }
        });

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
});
