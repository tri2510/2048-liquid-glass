class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') || 0;
        this.size = 4;
        this.tileContainer = document.querySelector('.tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestDisplay = document.getElementById('best');
        this.messageContainer = document.querySelector('.game-message');
        this.messageText = document.querySelector('.game-message p');
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
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
                this.move(e.key.replace('Arrow', '').toLowerCase());
            }
        });
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            if (Math.max(absDx, absDy) > 30) {
                if (absDx > absDy) {
                    this.move(dx > 0 ? 'right' : 'left');
                } else {
                    this.move(dy > 0 ? 'down' : 'up');
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
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
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        
        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < this.size; r++) {
                const row = this.grid[r];
                const filtered = direction === 'left' ? 
                    this.slideAndMerge(row) : 
                    this.slideAndMerge(row.reverse()).reverse();
                    
                if (JSON.stringify(filtered) !== JSON.stringify(row)) {
                    moved = true;
                }
                
                this.grid[r] = direction === 'left' ? filtered : filtered;
            }
        } else {
            for (let c = 0; c < this.size; c++) {
                const column = [];
                for (let r = 0; r < this.size; r++) {
                    column.push(this.grid[r][c]);
                }
                
                const filtered = direction === 'up' ? 
                    this.slideAndMerge(column) : 
                    this.slideAndMerge(column.reverse()).reverse();
                    
                if (JSON.stringify(filtered) !== JSON.stringify(column)) {
                    moved = true;
                }
                
                for (let r = 0; r < this.size; r++) {
                    this.grid[r][c] = filtered[direction === 'up' ? r : r];
                }
            }
        }
        
        if (moved) {
            this.addNewTile();
            this.updateDisplay();
            this.updateScore();
            
            if (this.checkWin()) {
                this.showMessage('You Win!', 'game-won');
            } else if (this.checkGameOver()) {
                this.showMessage('Game Over!', 'game-over');
            }
        }
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