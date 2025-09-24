const taille = 21;
let cells = [];

const grille = document.getElementById("labyrinthe");
const bouton = document.querySelector(".Génerer");

// Fonction pour créer la grille
function creerGrille() {
  grille.innerHTML = "";
  cells = [];
  for (let i = 0; i < taille * taille; i++) {
    const div = document.createElement("div");
    div.classList.add("case");
    grille.appendChild(div);
    cells.push(div);
  }
}
// Retourne l'index dans le tableau à partir de x,y
function index(x, y) {
  return y * taille + x;
}
// Fonction simple pour mélanger un tableau (directions)
function melanger(arr) {
  for (let i = 0; i < arr.length; i++) {
    let j = Math.floor(Math.random() * arr.length);
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
// Génère le labyrinthe à partir d'une case
function genererLabyrinthe(x, y) {
  cells[index(x, y)].classList.add("chemin");

  // Les 4 directions possibles : droite, gauche, bas, haut
  const directions = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];
  melanger(directions); // mélanger les directions pour que le labyrinthe soit aléatoire

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    //dx est la direction horizontale (droite gauche)
    //dy est la direction verticale (haut bas)
    if (
      nx > 0 &&
      nx < taille - 1 &&
      ny > 0 &&
      ny < taille - 1 &&
      !cells[index(nx, ny)].classList.contains("chemin")
    ) {
      cells[index(x + dx / 2, y + dy / 2)].classList.add("chemin");
      genererLabyrinthe(nx, ny);
    }
  }
}

// Créer entrée et sortie
function faireEntreeSortie() {
  // Entrée en haut
  for (let x = 1; x < taille - 1; x++) {
    if (cells[index(x, 1)].classList.contains("chemin")) {
      cells[index(x, 0)].classList.add("chemin");
      break;
    }
  }
  // Sortie en bas
  for (let x = taille - 2; x > 0; x--) {
    if (cells[index(x, taille - 2)].classList.contains("chemin")) {
      cells[index(x, taille - 1)].classList.add("chemin");
      break;
    }
  }
}

// Générer le labyrinthe automatiquement au chargement
creerGrille();
genererLabyrinthe(1, 1);
faireEntreeSortie();
