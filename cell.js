const gridContainer = document.getElementById("grid");
const totalCells = 10 * 6; // 60 cases

const imagePositions = {
  20: {
    src: "images/BigCastle.png",
    class: "kaamelott size",
    name: "Kaamelott",
  },
  12: {
    src: "images/village.png",
    class: "village1 size",
    name: "Village du Nord",
  },
  22: {
    src: "images/Forest.png",
    class: "broceliande size",
    name: "Brocéliande",
  },
  43: {
    src: "images/village.png",
    class: "village2 size",
    name: "Village du Sud",
  },
  6: {
    src: "images/Castle.png",
    class: "orcanie size",
    name: "Orcanie",
  },
  54: {
    src: "images/Castle.png",
    class: "carmelide size",
    name: "Carmelide",
  },
  46: {
    src: "images/Tower.png",
    class: "hammeau size",
    name: "Hameau Oublié",
  },
  17: {
    src: "images/Mountain.png",
    class: "mountain size",
    name: "Montagne Blanche",
  },
  38: {
    src: "images/village.png",
    class: "avalon size",
    name: "Avalon",
  },
  49: {
    src: "images/Port.png",
    class: "lugdunum size",
    name: "Lugdunum",
  },
};

for (let i = 0; i < totalCells; i++) {
  const gridItem = document.createElement("div");
  gridItem.className = "grid-item"; // Classe de base pour tous les éléments

  if (imagePositions[i]) {
    const img = document.createElement("img");
    const p = document.createElement("p");
    const distance = document.createElement("p");

    p.textContent = imagePositions[i].name;
    distance.textContent = "Distance : ∞";
    img.src = imagePositions[i].src;
    img.className = imagePositions[i].class;

    // CORRECTION: Ajouter la classe principale au gridItem
    const mainClass = imagePositions[i].class.split(" ")[0]; // Prendre "kaamelott" de "kaamelott size"
    gridItem.classList.add(mainClass);

    gridItem.appendChild(img);
    gridItem.appendChild(p);
    gridItem.appendChild(distance);
  }

  gridContainer.appendChild(gridItem);
}
