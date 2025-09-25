class PathfindingDemo {
  constructor() {
    this.maze = new Maze();
    this.astar = new AstarAlgo(this.maze.getGrid());
    this.path = null;
    this.startPos = { x: 0, y: 0 };
    this.endPos = { x: 6, y: 9 };
    this.isPathfinding = false;
    this.currentProcessingNode = null;
    this.visitedNodes = [];
    this.currentPathFindingPromise = null;

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
    const mazeContainer = document.getElementById("maze-container");
    if (!mazeContainer) return;

    const grid = this.maze.getGrid();
    const dimensions = this.maze.getDimensions();

    // Clear existing visualization
    mazeContainer.innerHTML = "";

    // Set CSS grid properties
    mazeContainer.style.gridTemplateColumns = `repeat(${dimensions.cols}, 30px)`;
    mazeContainer.style.gridTemplateRows = `repeat(${dimensions.rows}, 30px)`;

    for (let y = 0; y < dimensions.rows; y++) {
      for (let x = 0; x < dimensions.cols; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;

        // Determine cell type
        if (grid[y][x] === 1) {
          cell.classList.add("wall");
        } else {
          cell.classList.add("walkable");
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

        mazeContainer.appendChild(cell);
      }
    }
  }

  // Render the maze in the HTML
  renderMaze() {
    const mazeContainer = document.getElementById("maze-container");
    if (!mazeContainer) return;

    mazeContainer.innerHTML = "";
    const grid = this.maze.getGrid();
    const dimensions = this.maze.getDimensions();

    // Set CSS grid properties
    mazeContainer.style.gridTemplateColumns = `repeat(${dimensions.cols}, 30px)`;
    mazeContainer.style.gridTemplateRows = `repeat(${dimensions.rows}, 30px)`;

    for (let y = 0; y < dimensions.rows; y++) {
      for (let x = 0; x < dimensions.cols; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;

        // Determine cell type
        if (grid[y][x] === 1) {
          cell.classList.add("wall");
        } else {
          cell.classList.add("walkable");
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

        mazeContainer.appendChild(cell);
      }
    }
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
const demo = new PathfindingDemo();
demo.init();

// Make demo available globally for debugging
window.pathfindingDemo = demo;
