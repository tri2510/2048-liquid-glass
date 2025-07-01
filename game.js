class Game2048 {
    constructor() {
        this.grid = [];
        this.previousGrid = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') || 0;
        this.size = 4;
        this.tileContainer = document.querySelector('.tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestDisplay = document.getElementById('best');
        this.messageContainer = document.querySelector('.game-message');
        this.messageText = document.querySelector('.game-message p');
        this.tileIdCounter = 0;
        this.tiles = new Map(); // Track tiles with unique IDs
        this.isAnimating = false;
        this.movingTiles = [];
        this.mergingTiles = [];
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.tileIdCounter = 0;
        this.tiles.clear();
        this.isAnimating = false;
        this.updateScore();
        this.clearMessage();
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
    }
    
    bindEvents() {
        document.getElementById('new-game').addEventListener('click', () => this.init());
        document.querySelector('.retry-button').addEventListener('click', () => this.init());
        
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                if (!this.isAnimating) {
                    this.move(e.key.replace('Arrow', '').toLowerCase());
                }
            }
        });
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        // Prevent all scrolling and default touch behaviors
        const gameContainer = document.querySelector('.main-container');
        
        // Prevent document scrolling
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: false });
        
        gameContainer.addEventListener('touchmove', (e) => {
            // Prevent scrolling/pull-to-refresh when touching the game area
            e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent any default touch behaviors
            
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const dt = touchEndTime - touchStartTime;
            
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            // Only register swipe if movement is significant and not too slow
            if (Math.max(absDx, absDy) > 30 && dt < 500 && !this.isAnimating) {
                if (absDx > absDy) {
                    this.move(dx > 0 ? 'right' : 'left');
                } else {
                    this.move(dy > 0 ? 'down' : 'up');
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
            touchStartTime = 0;
        }, { passive: false });
    }
    
    addNewTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({row: r, col: c});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
            
            // Create tile object with unique ID
            const tileId = `tile-${this.tileIdCounter++}`;
            this.tiles.set(tileId, {
                value: value,
                row: randomCell.row,
                col: randomCell.col,
                isNew: true
            });
        }
    }
    
    move(direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.previousGrid = this.grid.map(row => [...row]);
        this.movingTiles = [];
        this.mergingTiles = [];
        
        const movements = this.calculateMovements(direction);
        
        if (movements.length > 0) {
            this.animateMovements(movements).then(() => {
                this.addNewTile();
                this.updateDisplay();
                this.updateScore();
                this.isAnimating = false;
                
                if (this.checkWin()) {
                    this.showMessage('You Win!', 'game-won');
                } else if (this.checkGameOver()) {
                    this.showMessage('Game Over!', 'game-over');
                }
            });
        } else {
            this.isAnimating = false;
        }
    }
    
    calculateMovements(direction) {
        const movements = [];
        const newGrid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < this.size; r++) {
                const row = this.grid[r].slice();
                const result = this.slideAndMergeWithTracking(row, direction === 'right');
                newGrid[r] = result.row;
                
                // Track movements
                result.movements.forEach(movement => {
                    movements.push({
                        fromRow: r,
                        fromCol: movement.from,
                        toRow: r,
                        toCol: movement.to,
                        value: movement.value,
                        merged: movement.merged
                    });
                });
            }
        } else {
            for (let c = 0; c < this.size; c++) {
                const column = [];
                for (let r = 0; r < this.size; r++) {
                    column.push(this.grid[r][c]);
                }
                
                const result = this.slideAndMergeWithTracking(column, direction === 'down');
                
                // Set column values
                result.row.forEach((value, r) => {
                    newGrid[r][c] = value;
                });
                
                // Track movements
                result.movements.forEach(movement => {
                    movements.push({
                        fromRow: movement.from,
                        fromCol: c,
                        toRow: movement.to,
                        toCol: c,
                        value: movement.value,
                        merged: movement.merged
                    });
                });
            }
        }
        
        this.grid = newGrid;
        return movements;
    }
    
    slideAndMergeWithTracking(arr, reverse = false) {
        const movements = [];
        const workingArray = reverse ? arr.slice().reverse() : arr.slice();
        const filtered = [];
        const originalPositions = [];
        
        // Track original positions of non-zero values
        workingArray.forEach((value, index) => {
            if (value !== 0) {
                filtered.push(value);
                originalPositions.push(reverse ? arr.length - 1 - index : index);
            }
        });
        
        const merged = [];
        let targetIndex = 0;
        let skip = false;
        
        for (let i = 0; i < filtered.length; i++) {
            if (skip) {
                skip = false;
                continue;
            }
            
            const currentValue = filtered[i];
            const originalPos = originalPositions[i];
            
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                // Merge tiles
                const mergedValue = currentValue * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                
                // Movement for first tile
                movements.push({
                    from: originalPos,
                    to: reverse ? arr.length - 1 - targetIndex : targetIndex,
                    value: currentValue,
                    merged: true
                });
                
                // Movement for second tile
                movements.push({
                    from: originalPositions[i + 1],
                    to: reverse ? arr.length - 1 - targetIndex : targetIndex,
                    value: currentValue,
                    merged: true
                });
                
                skip = true;
            } else {
                // Just move tile
                merged.push(currentValue);
                movements.push({
                    from: originalPos,
                    to: reverse ? arr.length - 1 - targetIndex : targetIndex,
                    value: currentValue,
                    merged: false
                });
            }
            targetIndex++;
        }
        
        // Fill remaining positions with zeros
        while (merged.length < arr.length) {
            merged.push(0);
        }
        
        const result = reverse ? merged.reverse() : merged;
        return { row: result, movements };
    }
    
    animateMovements(movements) {
        return new Promise((resolve) => {
            // First, animate all tiles to their new positions
            movements.forEach(movement => {
                // Find existing tile element at from position using data attributes
                const tiles = Array.from(this.tileContainer.children);
                const tileElement = tiles.find(tile => {
                    return parseInt(tile.dataset.row) === movement.fromRow && 
                           parseInt(tile.dataset.col) === movement.fromCol &&
                           parseInt(tile.dataset.value) === movement.value;
                });
                
                if (tileElement) {
                    tileElement.classList.add('tile-moving');
                    
                    // Calculate new position using CSS calc
                    const gapSize = 10;
                    const totalGaps = 3;
                    tileElement.style.left = `calc(${movement.toCol} * ((100% - ${totalGaps * gapSize}px) / 4) + ${movement.toCol * gapSize}px)`;
                    tileElement.style.top = `calc(${movement.toRow} * ((100% - ${totalGaps * gapSize}px) / 4) + ${movement.toRow * gapSize}px)`;
                    
                    if (movement.merged) {
                        tileElement.classList.add('tile-merging');
                    }
                }
            });
            
            // Wait for animations to complete, then update display
            setTimeout(() => {
                resolve();
            }, 250);
        });
    }
    
    getPositionFromCoords(row, col) {
        // Calculate position to match the CSS calc formula
        const cellPercent = (100 - 30) / 4; // (100% - 30px) / 4
        const gapSize = 10;
        
        return {
            left: col * cellPercent + col * gapSize,
            top: row * cellPercent + row * gapSize
        };
    }
    
    slideAndMerge(arr) {
        const filtered = arr.filter(val => val !== 0);
        const merged = [];
        let skip = false;
        
        for (let i = 0; i < filtered.length; i++) {
            if (skip) {
                skip = false;
                continue;
            }
            
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                merged.push(filtered[i] * 2);
                this.score += filtered[i] * 2;
                skip = true;
            } else {
                merged.push(filtered[i]);
            }
        }
        
        while (merged.length < this.size) {
            merged.push(0);
        }
        
        return merged;
    }
    
    updateDisplay() {
        this.tileContainer.innerHTML = '';
        
        // Clear animation classes from any existing tiles
        const existingTiles = Array.from(this.tileContainer.children);
        existingTiles.forEach(tile => {
            tile.classList.remove('tile-moving', 'tile-merging', 'tile-new');
        });
        
        // The grid has 10px gaps between cells and cells take up the remaining space
        // Total width = 100%, with 3 gaps of 10px each
        const gapSize = 10; // px
        const totalGaps = 3; // 3 gaps between 4 cells
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[r][c]} tile-new`;
                    tile.textContent = this.grid[r][c];
                    tile.dataset.row = r;
                    tile.dataset.col = c;
                    tile.dataset.value = this.grid[r][c];
                    
                    // Calculate position and size
                    // Each cell width = (100% - 30px) / 4
                    tile.style.width = `calc((100% - ${totalGaps * gapSize}px) / 4)`;
                    tile.style.height = `calc((100% - ${totalGaps * gapSize}px) / 4)`;
                    tile.style.left = `calc(${c} * ((100% - ${totalGaps * gapSize}px) / 4) + ${c * gapSize}px)`;
                    tile.style.top = `calc(${r} * ((100% - ${totalGaps * gapSize}px) / 4) + ${r * gapSize}px)`;
                    
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }
    
    updateScore() {
        this.scoreDisplay.textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            this.bestDisplay.textContent = this.best;
            localStorage.setItem('best2048', this.best);
        }
    }
    
    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) {
                    return false;
                }
                
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) {
                    return false;
                }
                
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    showMessage(text, className) {
        this.messageText.textContent = text;
        this.messageContainer.classList.add(className);
    }
    
    clearMessage() {
        this.messageContainer.classList.remove('game-won', 'game-over');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});