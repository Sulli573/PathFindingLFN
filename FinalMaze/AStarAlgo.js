class AstarAlgo {
  constructor(maze) {
    // The maze grid
    this.maze = maze;

    // Open list of nodes to be evaluated
    this.openList = [];

    // Closed list of nodes already evaluated
    this.closedList = [];

    // Dimensions of the maze
    this.rows = maze.length;
    this.cols = maze[0].length;

    // Callback for visualization updates
    this.onNodeProcessed = null;

    // Flag to control if we should use delays
    this.useDelay = true;

    // Delay duration in milliseconds (5 seconds)
    this.delayDuration = 100;

    //Boolean to pause and resume the algorithm
    this.isPaused = false;
    this.resumePromise = null;
    this.resumeCallback = null;

    // Cancellation flag
    this.isCancelled = false;
  }

  // Heuristic function: Manhattan distance
  heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
  }

  // Check if a position is valid and walkable
  isValidPosition(x, y) {
    return (
      x >= 0 &&
      x < this.cols &&
      y >= 0 &&
      y < this.rows &&
      this.maze[y][x] === 0
    );
  }

  // Check if node is in closed list
  isInClosedList(x, y) {
    return this.closedList.some((node) => node.x === x && node.y === y);
  }

  // Find node in open list
  findInOpenList(x, y) {
    return this.openList.find((node) => node.x === x && node.y === y);
  }

  // Get neighbors of current node
  getNeighbors(currentNode) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 }, // Right
      { x: 0, y: 1 }, // Down
      { x: -1, y: 0 }, // Left
    ];

    for (const dir of directions) {
      const newX = currentNode.x + dir.x;
      const newY = currentNode.y + dir.y;

      if (
        this.isValidPosition(newX, newY) &&
        !this.isInClosedList(newX, newY)
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  // Helper method to create delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Set callback for visualization updates
  setVisualizationCallback(callback) {
    this.onNodeProcessed = callback;
  }

  // Find path from start to end using A* algorithm (async version)
  async findPath(startPos, endPos) {
    // Reset lists for new search
    this.openList = [];
    this.closedList = [];
    // Reset pause state
    this.isPaused = false;
    this.resumePromise = null;
    this.resumeCallback = null;
    // Reset cancellation state
    this.isCancelled = false;

    // Node Position class
    const startNode = new Node(startPos.x, startPos.y);
    const endNode = new Node(endPos.x, endPos.y);

    // Calculate initial values for start node
    startNode.g = 0;
    startNode.h = this.heuristic(startNode, endNode);
    startNode.f = startNode.g + startNode.h;

    this.openList.push(startNode);

    // While current node is not the end node & openList is not empty
    while (this.openList.length > 0) {
      if (this.isCancelled) {
        console.log("Pathfinding cancelled.");
        return null;
      }
      // Find node with lowest f value
      let currentNode = this.openList[0];
      let currentIndex = 0;

      await this.waitIfPaused();

      for (let index = 0; index < this.openList.length; index++) {
        if (this.openList[index].f < currentNode.f) {
          currentNode = this.openList[index];
          currentIndex = index;
        }
      }

      // Remove current node from open list and add to closed list
      this.openList.splice(currentIndex, 1);
      this.closedList.push(currentNode);

      // Log current node coordinates and f, g, h values
      console.log(
        `Processing Node: (${currentNode.x}, ${currentNode.y}) | f: ${currentNode.f} | g: ${currentNode.g} | h: ${currentNode.h}`
      );

      // Notify visualization callback about current node being processed
      if (this.onNodeProcessed) {
        this.onNodeProcessed({
          currentNode: { x: currentNode.x, y: currentNode.y },
          openList: this.openList.map((node) => ({ x: node.x, y: node.y })),
          closedList: this.closedList.map((node) => ({ x: node.x, y: node.y })),
        });
      }

      // Add delay if enabled (5 seconds between each node processing)
      if (this.useDelay) {
        await this.delay(this.delayDuration);
      }

      // If we reached the end node, reconstruct the path
      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
        const path = [];
        let current = currentNode;
        while (current) {
          path.push({ x: current.x, y: current.y });
          current = current.parent;
        }
        return path.reverse();
      }

      // Get neighbors of current node
      const neighbors = this.getNeighbors(currentNode);

      for (const neighborPos of neighbors) {
        const neighbor = new Node(neighborPos.x, neighborPos.y);

        // Calculate g, h, f values
        neighbor.g = currentNode.g + 1; // Cost from start to neighbor
        neighbor.h = this.heuristic(neighbor, endNode); // Heuristic cost to end
        neighbor.f = neighbor.g + neighbor.h; // Total cost
        neighbor.parent = currentNode;

        // Check if this neighbor is already in open list with better path
        const existingNode = this.findInOpenList(neighbor.x, neighbor.y);
        if (existingNode && existingNode.g <= neighbor.g) {
          continue; // Skip this neighbor
        }

        // Remove existing node if found (we have a better path)
        if (existingNode) {
          const index = this.openList.indexOf(existingNode);
          this.openList.splice(index, 1);
        }

        // Add neighbor to open list
        this.openList.push(neighbor);
      }
    }

    // No path found
    return null;
  }

  // Cancel the pathfinding process
  cancel() {
    this.isCancelled = true;
    if (this.isPaused) {
      this.resume();
    }
  }

  // Pause the algorithm
  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.resumePromise = new Promise((resolve) => {
        this.resumeCallback = resolve;
      });
    }
  }

  // Resume the algorithm
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.resumeCallback) {
        this.resumeCallback();
        this.resumeCallback = null;
        this.resumePromise = null;
      }
    }
  }

  // Wait if the algorithm is paused
  async waitIfPaused() {
    if (this.isPaused && this.resumePromise) {
      await this.resumePromise;
    }
  }
}
