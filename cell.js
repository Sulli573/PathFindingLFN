// ===== CONFIGURATION =====
const GRID_CONFIG = {
  totalCells: 60, // 10x6 grille
  positions: {
    20: { src: "images/BigCastle.png", class: "kaamelott", name: "Kaamelott" },
    2: {
      src: "images/village.png",
      class: "village1",
      name: "Village du Nord",
    },
    22: { src: "images/Forest.png", class: "broceliande", name: "Brocéliande" },
    43: {
      src: "images/village.png",
      class: "village2",
      name: "Village du Sud",
    },
    6: { src: "images/Castle.png", class: "orcanie", name: "Orcanie" },
    54: { src: "images/Castle.png", class: "carmelide", name: "Carmelide" },
    46: { src: "images/Tower.png", class: "hammeau", name: "Hameau Oublié" },
    17: {
      src: "images/Mountain.png",
      class: "mountain",
      name: "Montagne Blanche",
    },
    38: { src: "images/village.png", class: "avalon", name: "Avalon" },
    49: { src: "images/Port.png", class: "lugdunum", name: "Lugdunum" },
  },
};

// ===== GÉNÉRATION DE LA GRILLE =====
function generateGrid() {
  const gridContainer = document.getElementById("grid");

  for (let i = 0; i < GRID_CONFIG.totalCells; i++) {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";

    // Si cette position contient un lieu
    if (GRID_CONFIG.positions[i]) {
      const location = GRID_CONFIG.positions[i];

      // Créer les éléments
      const img = document.createElement("img");
      const nameElement = document.createElement("p");
      const distanceElement = document.createElement("p");

      // Configurer les éléments
      img.src = location.src;
      img.className = `${location.class} size`;
      nameElement.textContent = location.name;
      distanceElement.textContent = "Distance : ∞";

      // Ajouter la classe principale au conteneur pour le ciblage
      gridItem.classList.add(location.class);

      // Assembler
      gridItem.appendChild(img);
      gridItem.appendChild(nameElement);
      gridItem.appendChild(distanceElement);
    }

    gridContainer.appendChild(gridItem);
  }
}

// Lancer la génération au chargement
document.addEventListener("DOMContentLoaded", generateGrid);
