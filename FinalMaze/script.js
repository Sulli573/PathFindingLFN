class MazeGenerator {
  constructor(size = 61) {
    this.taille = size;
    this.cells = [];
    this.grid = [];
    this.startPos = null;
    this.endPos = null;
    
    // DOM elements
    this.tailleSelect = document.getElementById("tailleSelect");
    this.grille = document.getElementById("labyrinthe");
    this.bouton = document.getElementById("GenererLabyrinthe");
  }

  // Fonction pour créer la grille
  creerGrille() {
    // Met à jour la taille selon le select
    if (this.tailleSelect) {
      this.taille = parseInt(this.tailleSelect.value);
    }
    
    if (!this.grille) return;
    
    this.grille.innerHTML = "";
    this.cells = [];
    this.grille.style.gridTemplateColumns = `repeat(${this.taille}, 20px)`;
    this.grille.style.gridTemplateRows = `repeat(${this.taille}, 20px)`;
    
    for (let i = 0; i < this.taille * this.taille; i++) {
      const div = document.createElement("div");
      div.classList.add("case");
      this.grille.appendChild(div);
      this.cells.push(div);
    }
  }

  // Retourne l'index dans le tableau à partir de x,y
  index(x, y) {
    return y * this.taille + x;
  }

  // Fonction simple pour mélanger un tableau (directions)
  melanger(arr) {
    for (let i = 0; i < arr.length; i++) {
      let j = Math.floor(Math.random() * arr.length);
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  // Génère le labyrinthe à partir d'une case
  genererLabyrinthe(x, y) {
    this.cells[this.index(x, y)].classList.add("chemin");

    // Les 4 directions possibles : droite, gauche, bas, haut
    const directions = [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ];
    this.melanger(directions); // mélanger les directions pour que le labyrinthe soit aléatoire

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      //dx est la direction horizontale (droite gauche)
      //dy est la direction verticale (haut bas)
      if (
        nx > 0 &&
        nx < this.taille - 1 &&
        ny > 0 &&
        ny < this.taille - 1 &&
        !this.cells[this.index(nx, ny)].classList.contains("chemin")
      ) {
        this.cells[this.index(x + dx / 2, y + dy / 2)].classList.add("chemin");
        this.genererLabyrinthe(nx, ny);
      }
    }
  }

  // Créer entrée et sortie
  faireEntreeSortie() {
    // Entrée en haut
    for (let x = 1; x < this.taille - 1; x++) {
      if (this.cells[this.index(x, 1)].classList.contains("chemin")) {
        this.cells[this.index(x, 0)].classList.add("chemin");
        this.startPos = { x, y: 0 }; // Store start position
        break;
      }
    }

    // Sortie verte aléatoire (hors entrée)
    // On récupère toutes les cases "chemin" sauf la première ligne (entrée)
    let chemins = [];
    for (let y = 1; y < this.taille; y++) {
      for (let x = 0; x < this.taille; x++) {
        if (this.cells[this.index(x, y)].classList.contains("chemin")) {
          chemins.push([x, y]);
        }
      }
    }
    if (chemins.length > 0) {
      const [sortieX, sortieY] = chemins[Math.floor(Math.random() * chemins.length)];
      this.cells[this.index(sortieX, sortieY)].classList.add("sortie");
      this.endPos = { x: sortieX, y: sortieY }; // Store end position
    }
  }

  // Convert DOM-based maze to 2D grid array for A* algorithm
  convertToGrid() {
    this.grid = [];
    for (let y = 0; y < this.taille; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.taille; x++) {
        const cellIndex = this.index(x, y);
        // If cell has "chemin" class, it's walkable (0), otherwise it's a wall (1)
        this.grid[y][x] = this.cells[cellIndex].classList.contains("chemin") ? 0 : 1;
      }
    }
    return this.grid;
  }

  // Interface methods for A* algorithm compatibility
  getGrid() {
    return this.grid;
  }

  getDimensions() {
    return {
      rows: this.taille,
      cols: this.taille
    };
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.taille || y < 0 || y >= this.taille) {
      return false;
    }
    return this.grid[y][x] === 0;
  }

  setCell(x, y, value) {
    if (x >= 0 && x < this.taille && y >= 0 && y < this.taille) {
      this.grid[y][x] = value;
    }
  }

  getCell(x, y) {
    if (x >= 0 && x < this.taille && y >= 0 && y < this.taille) {
      return this.grid[y][x];
    }
    return 1; // Return wall if out of bounds
  }

  printMaze() {
    for (let y = 0; y < this.taille; y++) {
      console.log(this.grid[y].join(' '));
    }
  }

  // Get start and end positions
  getStartPosition() {
    return this.startPos;
  }

  getEndPosition() {
    return this.endPos;
  }

  // Generate complete maze
  generate() {
    this.creerGrille();
    this.genererLabyrinthe(1, 1);
    this.faireEntreeSortie();
    this.convertToGrid();
    return {
      start: this.startPos,
      end: this.endPos
    };
  }

  // Initialize event listeners
  init() {
    // Generate initial maze
    this.generate();

    // Set up event listener for generate button
    if (this.bouton) {
      this.bouton.addEventListener("click", () => {
        this.generate();
        // Update pathfinding demo with new maze
        if (window.pathfindingDemo) {
          window.pathfindingDemo.regenerateMaze();
        }
      });
    }
  }
}

// Create global instance for backward compatibility
const mazeGenerator = new MazeGenerator();
mazeGenerator.init();

// Make it available globally
window.mazeGenerator = mazeGenerator;
