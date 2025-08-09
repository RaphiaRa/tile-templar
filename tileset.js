// tileset.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('gridForm');
    const canvas = document.getElementById('tilesetCanvas');
    const ctx = canvas.getContext('2d');
    const exportPngBtn = document.getElementById('exportPngBtn');

    function getInputs() {
        return {
            gridType: document.getElementById('gridType').value,
            tileWidth: parseInt(document.getElementById('tileWidth').value, 10),
            tileHeight: parseInt(document.getElementById('tileHeight').value, 10),
            margin: parseInt(document.getElementById('margin').value, 10),
            spacing: parseInt(document.getElementById('spacing').value, 10),
            tilesPerRow: parseInt(document.getElementById('tilesPerRow').value, 10),
            tilesPerCol: parseInt(document.getElementById('tilesPerCol').value, 10),
            drawPadding: parseInt(document.getElementById('drawPadding').value, 10),
            extraHeight: parseInt(document.getElementById('extraHeight').value, 10)
        };
    }
    
    function setInputs(state) {
        if (state.gridType) document.getElementById('gridType').value = state.gridType;
        if (state.tileWidth) document.getElementById('tileWidth').value = state.tileWidth;
        if (state.tileHeight) document.getElementById('tileHeight').value = state.tileHeight;
        if (state.margin !== undefined) document.getElementById('margin').value = state.margin;
        if (state.spacing !== undefined) document.getElementById('spacing').value = state.spacing;
        if (state.tilesPerRow) document.getElementById('tilesPerRow').value = state.tilesPerRow;
        if (state.tilesPerCol) document.getElementById('tilesPerCol').value = state.tilesPerCol;
        if (state.drawPadding !== undefined) document.getElementById('drawPadding').value = state.drawPadding;
        if (state.extraHeight !== undefined) document.getElementById('extraHeight').value = state.extraHeight;
    }

    function getStateUrlParams(state) {
        const params = new URLSearchParams();
        for (const key of Object.keys(state)) {
            params.set(key, state[key]);
        }
        return params.toString();
    }

    // On load, check for URL params and use them if present
    function tryRestoreFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('gridType')) {
            // Only set known keys
            const state = {};
            ['gridType','tileWidth','tileHeight','margin','spacing','tilesPerRow','tilesPerCol','drawPadding','extraHeight'].forEach(key => {
                if (params.has(key)) state[key] = params.get(key);
            });
            setInputs(state);
            updateHeightInputState();
            drawGrid();
            saveState();
            return true;
        }
        return false;
    }

    if (!tryRestoreFromUrl()) {
        restoreState();
        updateHeightInputState();
    }

    // Share button logic
    document.getElementById('shareBtn').onclick = function () {
        const state = getInputs();
        const params = getStateUrlParams(state);
        const url = window.location.origin + window.location.pathname + '?' + params;
        navigator.clipboard.writeText(url).then(function() {
            document.getElementById('shareBtn').textContent = 'Copied!';
            setTimeout(() => {
                document.getElementById('shareBtn').textContent = 'Share';
            }, 1200);
        });
    };

    function updateHeightInputState() {
        const gridType = document.getElementById('gridType').value;
        const heightInput = document.getElementById('tileHeight');
        const widthInput = document.getElementById('tileWidth');
        if (gridType === 'isometric') {
            heightInput.disabled = true;
            heightInput.value = Math.round(widthInput.value / 2);
        } else {
            heightInput.disabled = false;
        }
    }

    function saveState() {
        const state = getInputs();
        const key = 'tilesetGridState_' + state.gridType;
        localStorage.setItem('gridType', state.gridType);
        localStorage.setItem(key, JSON.stringify(state));
    }

    function restoreState(gridType) {
        const type = gridType || localStorage.getItem('gridType')
        if (type !== null) document.getElementById('gridType').value = type;
        const key = 'tilesetGridState_' + type;
        const stateStr = localStorage.getItem(key);
        if (!stateStr) return;
        try {
            const state = JSON.parse(stateStr);
            if (state.tileWidth) document.getElementById('tileWidth').value = state.tileWidth;
            if (state.tileHeight) document.getElementById('tileHeight').value = state.tileHeight;
            if (state.margin !== undefined) document.getElementById('margin').value = state.margin;
            if (state.spacing !== undefined) document.getElementById('spacing').value = state.spacing;
            if (state.tilesPerRow) document.getElementById('tilesPerRow').value = state.tilesPerRow;
            if (state.tilesPerCol) document.getElementById('tilesPerCol').value = state.tilesPerCol;
            if (state.drawPadding !== undefined) document.getElementById('drawPadding').value = state.drawPadding;
            if (state.extraHeight !== undefined) document.getElementById('extraHeight').value = state.extraHeight;
        } catch (e) { }
    }

    function drawGrid() {
        const { gridType, tileWidth, tileHeight, margin, spacing, tilesPerRow, tilesPerCol, drawPadding, extraHeight } = getInputs();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

        let drawRectWidth = tileWidth + 2 * drawPadding;
        let drawRectHeight = tileHeight + 2 * drawPadding + extraHeight;
        let width = margin * 2 + tilesPerRow * drawRectWidth + (tilesPerRow - 1) * spacing;
        let height = margin * 2 + tilesPerCol * drawRectHeight + (tilesPerCol - 1) * spacing;
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        const colorA = '#e3eafc';
        const colorB = '#b6c8e6';
        for (let row = 0; row < tilesPerCol; row++) {
            for (let col = 0; col < tilesPerRow; col++) {
                const drawRectX = margin + col * (drawRectWidth + spacing);
                const drawRectY = margin + row * (drawRectHeight + spacing);
                ctx.clearRect(drawRectX, drawRectY, drawRectWidth, drawRectHeight);
                const cellX = drawRectX + drawPadding;
                const cellY = drawRectY + drawPadding + extraHeight;
                const isEven = (row + col) % 2 === 0;
                ctx.fillStyle = isEven ? colorA : colorB;

                if (gridType === 'orthogonal') {
                    ctx.fillRect(cellX, cellY, tileWidth, tileHeight);
                } else if (gridType === 'isometric') {
                    const halfW = tileWidth / 2;
                    const halfH = tileHeight / 2;
                    const left = [cellX, cellY + halfH];
                    for (let dy = 0; dy < halfH; dy++) {
                        const y = left[1] - dy - 1;
                        ctx.fillRect(left[0] + 2 * dy, y, tileWidth - 4 * dy, 1);
                    }
                    for (let dy = 0; dy < halfH; dy++) {
                        const y = left[1] + dy;
                        ctx.fillRect(left[0] + 2 * dy, y, tileWidth - 4 * dy, 1);
                    }
                }
            }
        }


        ctx.save();
        ctx.restore();
    }

    document.getElementById('exportTsxBtn').onclick = function () {
        const { tileWidth, tileHeight, margin, spacing, tilesPerRow, tilesPerCol, drawPadding, extraHeight } = getInputs();
        const drawRectWidth = tileWidth + 2 * drawPadding;
        const drawRectHeight = tileHeight + 2 * drawPadding + extraHeight;
        const width = margin * 2 + tilesPerRow * drawRectWidth + (tilesPerRow - 1) * spacing;
        const height = margin * 2 + tilesPerCol * drawRectHeight + (tilesPerCol - 1) * spacing;
        let tsx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        tsx += `<tileset version="1.10" tiledversion="1.10.2" name="tileset" tilewidth="${drawRectWidth}" tileheight="${drawRectHeight}" tilecount="${tilesPerRow * tilesPerCol}" columns="${tilesPerRow}" spacing="${spacing}" margin="${margin}">\n`;
        if (drawPadding !== 0) {
            tsx += `<tileoffset x="-${drawPadding}" y="${drawPadding}"/>\n`;
        }
        tsx += `<image source="tileset.png" width="${width}" height="${height}"/>\n`;
        tsx += `</tileset>`;
        const blob = new Blob([tsx], { type: 'application/xml' });
        const link = document.createElement('a');
        link.download = 'tileset.tsx';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    form.onchange = function () {
        updateHeightInputState();
        drawGrid();
        saveState();
    };

    document.getElementById('gridType').addEventListener('change', function () {
        restoreState(document.getElementById('gridType').value);
        updateHeightInputState();
        drawGrid();
        saveState(); // Save again in case gridType disables/enables fields
    });

    restoreState();
    updateHeightInputState();

    exportPngBtn.onclick = function () {
        const link = document.createElement('a');
        link.download = 'tileset-grid.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    drawGrid();
});
