class PathfindingDemo {
  constructor(mazeGenerator = null) {
    // Use provided maze generator or create a new one
    this.maze = mazeGenerator || new MazeGenerator();
    
    // Initialize maze if not already done
    if (!this.maze.getGrid() || this.maze.getGrid().length === 0) {
      this.maze.generate();
    }
    
    this.astar = new AstarAlgo(this.maze.getGrid());
    this.path = null;
    
    // Get start and end positions from the maze generator
    this.startPos = this.maze.getStartPosition() || { x: 0, y: 0 };
    this.endPos = this.maze.getEndPosition() || { x: 6, y: 9 };
    
    this.isPathfinding = false;
    this.currentProcessingNode = null;
    this.visitedNodes = [];
    this.currentPathFindingPromise = null;

    // Speed control elements
    this.speedSlider = null;
    this.speedValue = null;

    // Set up visualization callback for A* algorithm
    this.astar.setVisualizationCallback((data) => {
      this.onNodeProcessed(data);
    });
  }

  //  Pause the pathfinding process
  pause() {
    if (this.isPathfinding && !this.astar.isPaused) {
      console.log("Pausing pathfinding...");
      this.astar.pause();
      this.updateControlButtons('paused');
    }
  }

  // Resume the pathfinding process
  resume() {
    if (this.isPathfinding && this.astar.isPaused) {
      console.log("Resuming pathfinding...");
      this.astar.resume();
      this.updateControlButtons('running');
    }
  }

  // Update button visibility based on current state
  updateControlButtons(state) {
    const findPathBtn = document.getElementById("find-path-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const resumeBtn = document.getElementById("resume-btn");
    const resetBtn = document.getElementById("reset-btn");

    switch(state) {
      case 'running':
        findPathBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
        resetBtn.disabled = true;
        break;
      case 'paused':
        findPathBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
        resetBtn.disabled = false;
        break;
      case 'idle':
      default:
        findPathBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'none';
        resetBtn.disabled = false;
        break;
    }
  }

  // Callback for when A* algorithm processes a node
  onNodeProcessed(data) {
    this.currentProcessingNode = data.currentNode;
    this.visitedNodes = data.closedList;
    console.log("Processing node:", this.currentProcessingNode);

    // Update visualization to show current processing state
    this.updateVisualization();
  }

  // Find path using A* algorithm (async version)
  async findPath() {
    if (this.isPathfinding) {
      console.log("Pathfinding already in progress...");
      return;
    }

    console.log("Finding path from", this.startPos, "to", this.endPos);
    this.isPathfinding = true;
    this.path = null;
    this.currentProcessingNode = null;
    this.visitedNodes = [];

    // Update button states
    this.updateControlButtons('running');
    const findPathBtn = document.getElementById("find-path-btn");
    if (findPathBtn) {
      findPathBtn.textContent = "Finding Path...";
      findPathBtn.disabled = true;
    }

    try {
      this.currentPathFindingPromise = this.astar.findPath(this.startPos, this.endPos);
      this.path = await this.currentPathFindingPromise;

      if (this.path) {
        console.log("Path found! Length:", this.path.length);
        console.log("Path:", this.path);
      } else {
        console.log("No path found!");
      }
    } catch (error) {
      console.error("Error during pathfinding:", error);
    } finally {
      this.isPathfinding = false;
      this.currentProcessingNode = null;
      this.currentPathFindingPromise = null;

      // Update button states
      this.updateControlButtons('idle');
      if (findPathBtn) {
        findPathBtn.textContent = "Find Path";
        findPathBtn.disabled = false;
      }

      // Final render with complete path
      this.renderMaze();
    }
  }

  // Update visualization during pathfinding process
  updateVisualization() {
    const mazeContainer = document.getElementById("labyrinthe");
    if (!mazeContainer) return;

    const grid = this.maze.getGrid();
    const dimensions = this.maze.getDimensions();

    // Don't clear the container - update existing cells instead
    const cells = mazeContainer.querySelectorAll('.case');

    cells.forEach((cell, index) => {
      const x = index % dimensions.cols;
      const y = Math.floor(index / dimensions.cols);

      // Reset classes
      cell.className = 'case';

      // Determine cell type
      if (grid[y][x] === 1) {
        cell.classList.add("wall");
      } else {
        cell.classList.add("chemin");
      }

      // Mark start and end positions
      if (x === this.startPos.x && y === this.startPos.y) {
        cell.classList.add("start");
      }
      if (x === this.endPos.x && y === this.endPos.y) {
        cell.classList.add("end");
      }

      // Mark visited nodes
      if (this.visitedNodes) {
        const isVisited = this.visitedNodes.some(
          (node) => node.x === x && node.y === y
        );
        if (isVisited) {
          cell.classList.add("visited");
        }
      }

      // Mark current processing node
      if (
        this.currentProcessingNode &&
        this.currentProcessingNode.x === x &&
        this.currentProcessingNode.y === y
      ) {
        cell.classList.add("current");
      }
    });
  }

  // Render the maze in the HTML
  renderMaze() {
    const mazeContainer = document.getElementById("labyrinthe");
    if (!mazeContainer) return;

    // Update existing cells instead of recreating them
    const cells = mazeContainer.querySelectorAll('.case');

    cells.forEach((cell, index) => {
      const x = index % this.maze.taille;
      const y = Math.floor(index / this.maze.taille);

      // Reset classes
      cell.className = 'case';

      // Determine cell type
      if (this.maze.grid[y][x] === 1) {
        cell.classList.add("wall");
      } else {
        cell.classList.add("chemin");
      }

      // Mark start and end positions
      if (x === this.startPos.x && y === this.startPos.y) {
        cell.classList.add("start");
      }
      if (x === this.endPos.x && y === this.endPos.y) {
        cell.classList.add("end");
      }

      // Mark path if it exists
      if (this.path) {
        const isInPath = this.path.some(
          (pathNode) => pathNode.x === x && pathNode.y === y
        );
        if (isInPath) {
          cell.classList.add("path");
        }
      }
    });
  }

  // Initialize the demo
  init() {
    console.log("Initializing Pathfinding Demo");
    this.maze.printMaze();

    // Render when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.renderMaze());
    } else {
      this.renderMaze();
    }

    // Add button event listener
    const findPathBtn = document.getElementById("find-path-btn");
    if (findPathBtn) {
      findPathBtn.addEventListener("click", async () => {
        await this.findPath();
      });
    }

    // Add reset button event listener
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.reset();
      });
    }
    const pauseBtn = document.getElementById("pause-btn");
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        this.pause();
      });
    }
    const resumeBtn = document.getElementById("resume-btn");
    if (resumeBtn) {
      resumeBtn.addEventListener("click", () => {
        this.resume();
      });
    }

    // Initialize speed control
    this.speedSlider = document.getElementById("speed-slider");
    this.speedValue = document.getElementById("speed-value");

    if (this.speedSlider && this.speedValue) {
      // Set initial value display
      this.speedValue.textContent = this.speedSlider.value + "ms";

      // Add event listener for slider changes
      this.speedSlider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        this.speedValue.textContent = value + "ms";
        this.astar.setDelayDuration(value);
      });
    }
  }

  // Reset the visualization
  reset() {
    // Cancel any ongoing pathfinding
    console.log("Resetting visualization...");
    if (this.currentPathFindingPromise) {
      this.astar.cancel();
      this.currentPathFindingPromise = null;
    }

    // Reset state
    this.path = null;
    this.currentProcessingNode = null;
    this.visitedNodes = [];
    this.isPathfinding = false;

    // Update button states
    this.updateControlButtons('idle');
    const findPathBtn = document.getElementById("find-path-btn");
    if (findPathBtn) {
      findPathBtn.textContent = "Find Path";
      findPathBtn.disabled = false;
    }

    this.renderMaze();
  }

  // Regenerate maze with new size (called after maze generator updates)
  regenerateMaze(size = null) {
    // Reset any ongoing pathfinding
    this.reset();

    // Update maze size if specified
    if (size) {
      this.maze.taille = size;
    }

    // The maze generator has already updated the grid and positions
    // Just update A* algorithm with the new grid
    this.astar = new AstarAlgo(this.maze.getGrid());
    this.astar.setVisualizationCallback((data) => {
      this.onNodeProcessed(data);
    });

    // Update start and end positions from maze generator
    this.startPos = this.maze.getStartPosition() || { x: 0, y: 0 };
    this.endPos = this.maze.getEndPosition() || { x: 6, y: 9 };

    console.log("Maze regenerated with start:", this.startPos, "end:", this.endPos);

    // Re-render the maze (this will show the path if it exists)
    this.renderMaze();
  }

  // Allow changing start and end positions
  setStartPosition(x, y) {
    if (this.maze.isWalkable(x, y)) {
      this.startPos = { x, y };
      console.log("Start position set to:", this.startPos);
    }
  }

  setEndPosition(x, y) {
    if (this.maze.isWalkable(x, y)) {
      this.endPos = { x, y };
      console.log("End position set to:", this.endPos);
    }
  }
}

// Create and initialize the demo
// Check if we have a global mazeGenerator from script.js
const demo = new PathfindingDemo(window.mazeGenerator);
demo.init();

// Make demo available globally for debugging
window.pathfindingDemo = demo;
