const graph = {
  kaamelott: { village1: 4, village2: 2, broceliande: 5 },
  village1: { kaamelott: 4, orcanie: 7, mountain: 3 },
  village2: { kaamelott: 2, carmelide: 4, hammeau: 6 },
  broceliande: { kaamelott: 5, avalon: 2 },
  orcanie: { village1: 7, mountain: 2 },
  carmelide: { village2: 4, lugdunum: 3 },
  hammeau: { village2: 6, lugdunum: 5 },
  mountain: { village1: 3, orcanie: 2, avalon: 4 },
  avalon: {
    broceliande: 2,
    mountain: 4,
    lugdunum: 6,
  },
  lugdunum: { carmelide: 3, hammeau: 5, avalon: 6 },
};

// Fonction utilitaire pour attendre
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logInfo(msg) {
  const info = document.querySelector(".info");
  if (info) {
    info.innerHTML = msg;
    console.log(msg); // Aussi dans la console
  }
}

// Fonction pour effacer seulement les lignes d'algorithme, pas les routes de base
function clearAlgorithmLines() {
  const svg = document.getElementById("svg-lines");
  if (svg) {
    // Supprimer seulement les lignes qui ne sont pas des routes de base
    const paths = svg.querySelectorAll("path");
    paths.forEach((path) => {
      const stroke = path.getAttribute("stroke");
      if (
        stroke !== "#8B4513" &&
        stroke !== "#228B22" &&
        stroke !== "#4682B4" &&
        stroke !== "#708090" &&
        stroke !== "#CD853F" &&
        stroke !== "#20B2AA"
      ) {
        path.remove();
      }
    });
  }
}

// Fonction pour normaliser l'ordre des classes (toujours la même direction)
function normalizeOrder(classA, classB) {
  const order = [
    "kaamelott",
    "village1",
    "village2",
    "broceliande",
    "orcanie",
    "carmelide",
    "hammeau",
    "mountain",
    "avalon",
    "lugdunum",
  ];

  const indexA = order.indexOf(classA);
  const indexB = order.indexOf(classB);

  if (indexA < indexB) {
    return [classA, classB];
  } else {
    return [classB, classA];
  }
}

// Fonction modifiée pour dessiner les lignes toujours dans le même sens
function drawConsistentLine(classA, classB, color = "red", delay = 0) {
  const [firstClass, secondClass] = normalizeOrder(classA, classB);
  drawCurveBetweenCircles(firstClass, secondClass, color, delay);
}

function updateNodeDistance(nodeName, distance) {
  const element = document.querySelector(`.${nodeName}`);
  console.log("Mise à jour de la distance pour", nodeName, ":", distance);
  if (element) {
    const distanceElem = element.querySelector("p:nth-of-type(2)");
    if (distanceElem) {
      distanceElem.textContent = `Distance : ${distance}`;
    }
  }
}

async function dijkstra(graph, start, end) {
  clearAlgorithmLines();
  logInfo(`🎯 DIJKSTRA : ${start} → ${end}`);

  const distances = {};
  const previous = {};
  const visited = new Set();

  // Initialisation
  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;
  updateNodeDistance(start, 0); // Afficher 0 pour le point de départ
  await sleep(1500);

  let iteration = 1;

  while (true) {
    logInfo(`Itération ${iteration} - Recherche du plus proche...`);
    await sleep(800);

    // Trouver le nœud le plus proche non visité
    let closest = null;
    for (let node in distances) {
      if (!visited.has(node)) {
        if (closest === null || distances[node] < distances[closest]) {
          closest = node;
        }
      }
    }

    if (closest === null || distances[closest] === Infinity) {
      logInfo("Aucun chemin trouvé !");
      break;
    }

    if (closest === end) {
      await sleep(800);
      logInfo(`Destination ${end} atteinte !`);
      break;
    }

    logInfo(`📍 Examen de ${closest} (distance: ${distances[closest]})`);

    // Examiner les voisins
    for (let neighbor in graph[closest]) {
      const edgeWeight = graph[closest][neighbor];
      const newDist = distances[closest] + edgeWeight;
      const oldDist = distances[neighbor];

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = closest;

        // Mettre à jour l'affichage de la distance
        updateNodeDistance(neighbor, newDist);

        // Dessiner une ligne bleue temporaire pour montrer l'amélioration
        const blueLineId = drawConsistentLineWithId(
          closest,
          neighbor,
          "blue",
          0
        );

        // Surligner le voisin en bleu quand sa distance est améliorée
        highlightNode(neighbor, "#4444ff");

        logInfo(
          `💡 ${neighbor} : ${
            oldDist === Infinity ? "∞" : oldDist
          } → ${newDist} (via ${closest})`
        );

        await sleep(1500); // Plus de temps pour voir la ligne bleue

        // Supprimer la ligne bleue après l'animation
        setTimeout(() => {
          removeLineById(blueLineId);
        }, 2000);
      }
    }

    visited.add(closest);
    // Marquer comme visité en vert
    highlightNode(closest, "#44ff44");
    iteration++;
    await sleep(1000);
  }

  // Reconstruire et afficher le chemin optimal
  const path = [];
  let current = end;
  while (current && previous[current]) {
    path.unshift(current);
    current = previous[current];
  }
  if (current) path.unshift(current);

  // Tracer le chemin optimal en jaune épais avec lignes consistantes
  for (let i = 0; i < path.length - 1; i++) {
    drawConsistentLine(path[i], path[i + 1], "yellow", i * 200);
  }

  logInfo(
    `🏆 Chemin optimal: ${path.join(" → ")} (Distance: ${distances[end]})`
  );

  return { distance: distances[end], path };
}

// Fonction pour dessiner une ligne avec ID unique
function drawConsistentLineWithId(classA, classB, color = "red", delay = 0) {
  const [firstClass, secondClass] = normalizeOrder(classA, classB);
  const uniqueId = `line-${Date.now()}-${Math.random()}`;

  setTimeout(() => {
    const svg = document.getElementById("svg-lines") || createSVG();

    const elA = document.querySelector(`.${firstClass}`);
    const elB = document.querySelector(`.${secondClass}`);

    if (!elA || !elB) return;

    const a = getCircleData(elA);
    const b = getCircleData(elB);

    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const start = getPointOnCircle(a, angle);
    const end = getPointOnCircle(b, angle + Math.PI);

    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const perpAngle = angle + Math.PI / 2;
    const curveOffset = 50;
    const cx = mx + curveOffset * Math.cos(perpAngle);
    const cy = my + curveOffset * Math.sin(perpAngle);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`
    );
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "8,4");
    path.setAttribute("id", uniqueId);

    svg.appendChild(path);
    animatePath(path, 1000);
  }, delay);

  return uniqueId;
}

// Fonction pour supprimer une ligne par son ID
function removeLineById(lineId) {
  const line = document.getElementById(lineId);
  if (line) {
    line.style.opacity = "0";
    line.style.transition = "opacity 0.5s ease-out";
    setTimeout(() => {
      if (line.parentNode) {
        line.parentNode.removeChild(line);
      }
    }, 500);
  }
}

// Fonction utilitaire pour créer le SVG s'il n'existe pas
function createSVG() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", "svg-lines");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100vw";
  svg.style.height = "100vh";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "1";
  document.body.appendChild(svg);
  return svg;
}

// Fonction pour surligner un nœud
function highlightNode(nodeName, color) {
  const element = document.querySelector(`.${nodeName}`);
  if (element) {
    element.style.border = `4px solid ${color}`;
    element.style.boxShadow = `0 0 15px ${color}`;

    // Si c'est vert (visité), rayer le texte du nom
    if (color === "#44ff44") {
      const nameElement = element.querySelector("p:nth-of-type(1)");
      if (nameElement) {
        nameElement.style.textDecoration = "line-through";
        nameElement.style.color = "#666"; // Couleur plus pâle
        nameElement.style.opacity = "0.7"; // Légèrement transparent
      }
    }

    // Durée différente selon la couleur
    const duration = color === "#4444ff" ? 3000 : 2000;

    // Retirer le surlignage après la durée définie
    setTimeout(() => {
      element.style.border = "";
      element.style.boxShadow = "";

      // Ne pas retirer le style barré pour les nœuds visités (vert)
      if (color !== "#44ff44") {
        const nameElement = element.querySelector("p:nth-of-type(1)");
        if (nameElement) {
          nameElement.style.textDecoration = "";
          nameElement.style.color = "";
          nameElement.style.opacity = "";
        }
      }
    }, duration);
  }
}

// Fonction principale pour lancer Dijkstra
async function runDijkstra() {
  // Exemple : de kaamelott vers lugdunum
  const start = "kaamelott";
  const end = "lugdunum";

  const result = await dijkstra(graph, start, end);

  setTimeout(() => {
    logInfo(
      `🎉 RÉSULTAT: Distance ${result.distance}, Chemin: ${result.path.join(
        " → "
      )}`
    );
  }, result.path.length * 200 + 1000);
}
