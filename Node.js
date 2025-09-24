class Node {
  constructor(x, y) {
    // Cell/Node coordinates
    this.x = x;
    this.y = y;

    // Cost from starting point to this node
    this.g = 0;
    // Heuristic cost from current node to end
    this.h = 0;
    // Total cost
    this.f = 0;

    // Parent node in the path
    this.parent = null;
  }
}
