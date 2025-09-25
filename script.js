let taille = 61;
let cells = [];

const tailleSelect = document.getElementById("tailleSelect");
const grille = document.getElementById("labyrinthe");
const bouton = document.getElementById("GenererLabyrinthe");

// Fonction pour créer la grille
function creerGrille() {
  // Met à jour la taille selon le select

  if (tailleSelect) {
    taille = parseInt(tailleSelect.value);
  }
  grille.innerHTML = "";
  cells = [];
  grille.style.gridTemplateColumns = `repeat(${taille}, 10px)`;
  grille.style.gridTemplateRows = `repeat(${taille}, 10px)`;
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

  // Sortie verte aléatoire (hors entrée)
  // On récupère toutes les cases "chemin" sauf la première ligne (entrée)
  let chemins = [];
  for (let y = 1; y < taille; y++) {
    for (let x = 0; x < taille; x++) {
      if (cells[index(x, y)].classList.contains("chemin")) {
        chemins.push([x, y]);
      }
    }
  }
  if (chemins.length > 0) {
    const [Sortie, sortie] =
      chemins[Math.floor(Math.random() * chemins.length)];
    cells[index(Sortie, sortie)].classList.add("sortie");
  }
}

// Générer le labyrinthe automatiquement au chargement
creerGrille();
genererLabyrinthe(1, 1);
faireEntreeSortie();

// Générer un nouveau labyrinthe au clic sur le bouton
if (bouton) {
  bouton.addEventListener("click", () => {
    creerGrille();
    genererLabyrinthe(1, 1);
    faireEntreeSortie();
  });
}
