class Maze {
  constructor() {
    // Simple maze: 0 = walkable, 1 = wall/obstacle
    this.grid = [
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
    ];

    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
  }

  // Get the maze grid
  getGrid() {
    return this.grid;
  }

  // Check if a cell is walkable
  isWalkable(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return false;
    }
    return this.grid[y][x] === 0;
  }

  // Get maze dimensions
  getDimensions() {
    return {
      rows: this.rows,
      cols: this.cols
    };
  }

  // Set a cell value (for dynamic maze modification if needed)
  setCell(x, y, value) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.grid[y][x] = value;
    }
  }

  // Get cell value
  getCell(x, y) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      return this.grid[y][x];
    }
    return 1; // Return wall if out of bounds
  }

  // Print maze to console (for debugging)
  printMaze() {
    for (let y = 0; y < this.rows; y++) {
      console.log(this.grid[y].join(' '));
    }
  }
}
