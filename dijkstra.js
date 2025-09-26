// ===== GRAPHE DES CONNEXIONS =====
const graph = {
  kaamelott: { village1: 4, village2: 2, broceliande: 5 },
  village1: { kaamelott: 4, orcanie: 7, mountain: 3 },
  village2: { kaamelott: 2, carmelide: 4, hammeau: 6 },
  broceliande: { kaamelott: 5, avalon: 2 },
  orcanie: { village1: 7, mountain: 2 },
  carmelide: { village2: 4, lugdunum: 3 },
  hammeau: { village2: 6, lugdunum: 5 },
  mountain: { village1: 3, orcanie: 2, avalon: 4 },
  avalon: { broceliande: 2, mountain: 4, lugdunum: 6 },
  lugdunum: { carmelide: 3, hammeau: 5, avalon: 6 },
};

// ===== VARIABLES GLOBALES =====
let isPaused = false;
let pauseResolver = null;

// ===== UTILITAIRES =====
async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  await pauseExecution();
}

function logInfo(msg) {
  const info = document.querySelector(".info");
  if (info) {
    info.innerHTML = msg;
    console.log(msg);
  }
}

// ===== GESTION DE L'AFFICHAGE =====
function updateNodeDistance(nodeName, distance) {
  const element = document.querySelector(`.${nodeName}`);
  if (element) {
    const distanceElem = element.querySelector("p:nth-of-type(2)");
    if (distanceElem) {
      distanceElem.textContent = `Distance : ${distance}`;
    }
  }
}

function highlightNode(nodeName, color) {
  const element = document.querySelector(`.${nodeName}`);
  if (!element) return;

  element.style.border = `4px solid ${color}`;

  // Marquer comme visité (vert)
  if (color === "#B0F2B6") {
    const nameElement = element.querySelector("p:nth-of-type(1)");
    if (nameElement) {
      nameElement.style.cssText =
        "text-decoration: line-through; color: #666; opacity: 0.7;";
    }
  }

  // Retirer le surlignage après délai (sauf pour les visités)
  const duration = color === "#6984a3" ? 3000 : 2000;
  setTimeout(() => {
    if (color !== "#B0F2B6") {
      element.style.border = "";
      const nameElement = element.querySelector("p:nth-of-type(1)");
      if (nameElement) {
        nameElement.style.cssText = "";
      }
    }
  }, duration);
}

function clearAlgorithmLines() {
  const svg = document.getElementById("svg-lines");
  if (!svg) return;

  // SOLUTION TEMPORAIRE: Supprimer TOUTES les lignes puis redessiner les routes
  svg.innerHTML = ""; // Vide complètement le SVG
}

// ===== DESSIN CONSISTANT =====
const NODE_ORDER = [
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

function normalizeOrder(classA, classB) {
  const indexA = NODE_ORDER.indexOf(classA);
  const indexB = NODE_ORDER.indexOf(classB);
  return indexA < indexB ? [classA, classB] : [classB, classA];
}

function drawConsistentLine(classA, classB, color = "red", delay = 0) {
  const [firstClass, secondClass] = normalizeOrder(classA, classB);
  drawCurveBetweenNodes(firstClass, secondClass, color, delay);
}

function drawConsistentLineWithId(classA, classB, color = "red", delay = 0) {
  const [firstClass, secondClass] = normalizeOrder(classA, classB);
  return drawCurveWithId(firstClass, secondClass, color, delay);
}

// ===== ALGORITHME DE DIJKSTRA =====
async function dijkstra(graph, start, end) {
  resetPause(); // Réinitialiser l'état de pause
  clearAlgorithmLines();
  logInfo(`DIJKSTRA : ${start} → ${end}`);
  await sleep(1000);

  // Afficher le bouton pause
  const pauseButton = document.getElementById("pauseButton");
  if (pauseButton) {
    pauseButton.style.display = "block";
  }

  // Initialisation
  const distances = {};
  const previous = {};
  const visited = new Set();

  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;
  updateNodeDistance(start, 0);
  await sleep(1500);

  let iteration = 1;

  // Boucle principale
  while (true) {
    logInfo(`Itération ${iteration} - Recherche du plus proche...`);
    await sleep(800);

    // Trouver le nœud non visité le plus proche
    let closest = null;
    for (let node in distances) {
      if (!visited.has(node)) {
        if (closest === null || distances[node] < distances[closest]) {
          closest = node;
        }
      }
    }

    // Vérifications de fin
    if (closest === null || distances[closest] === Infinity) {
      logInfo("Aucun chemin trouvé !");
      break;
    }

    if (closest === end) {
      await sleep(800);
      logInfo(`Destination ${end} atteinte !`);
      break;
    }

    logInfo(`Examen de ${closest} (distance: ${distances[closest]})`);
    await sleep(500); // Point de pause

    // Examiner les voisins
    for (let neighbor in graph[closest]) {
      const edgeWeight = graph[closest][neighbor];
      const newDist = distances[closest] + edgeWeight;
      const oldDist = distances[neighbor];

      // Amélioration trouvée
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = closest;

        updateNodeDistance(neighbor, newDist);

        // Animation de l'amélioration
        drawConsistentLineWithId(closest, neighbor, "#6984a3", 0);
        highlightNode(neighbor, "#6984a3");

        logInfo(
          `💡 ${neighbor} : ${
            oldDist === Infinity ? "∞" : oldDist
          } → ${newDist} (via ${closest})`
        );

        await sleep(1500); // Point de pause après chaque amélioration
      }
    }

    // Marquer comme visité
    visited.add(closest);
    highlightNode(closest, "#B0F2B6");
    iteration++;
    await sleep(1000); // Point de pause après chaque itération
  }

  // Cacher le bouton pause à la fin
  if (pauseButton) {
    pauseButton.style.display = "none";
  }

  // Reconstruction du chemin optimal
  const path = [];
  let current = end;
  while (current && previous[current]) {
    path.unshift(current);
    current = previous[current];
  }
  if (current) path.unshift(current);

  // Tracer le chemin optimal en jaune
  clearAlgorithmLines();
  await sleep(500);
  for (let i = 0; i < path.length - 1; i++) {
    drawConsistentLine(path[i], path[i + 1], "#D4AF37", i * 200);
    await sleep(200); // Pause entre chaque segment du chemin
  }

  logInfo(
    `🏆 Chemin optimal: ${path.join(" → ")} (Distance: ${distances[end]})`
  );
  return { distance: distances[end], path };
}

// ===== FONCTION PRINCIPALE =====
async function runDijkstra() {
  const start = "kaamelott";
  const end = "lugdunum";

  const result = await dijkstra(graph, start, end);

  // Afficher le résultat final

  logInfo(
    `RÉSULTAT: Distance ${result.distance}, Chemin: ${result.path.join(" → ")}`
  );
  await sleep(1000);
  const enterButton = document.getElementById("enterLab");
  if (enterButton) enterButton.style.display = "block";
}

// ===== FONCTIONS DE PAUSE =====
function pauseExecution() {
  return new Promise((resolve) => {
    if (isPaused) {
      pauseResolver = resolve;
    } else {
      resolve();
    }
  });
}

function togglePause() {
  isPaused = !isPaused;
  const pauseButton = document.getElementById("pauseButton");

  if (isPaused) {
    pauseButton.textContent = "Reprendre";
    pauseButton.style.backgroundColor = "#4CAF50";
    logInfo("⏸️ ALGORITHME EN PAUSE - Cliquez sur Reprendre");
  } else {
    pauseButton.textContent = "Pause";
    pauseButton.style.backgroundColor = "#ff9800";
    if (pauseResolver) {
      pauseResolver();
      pauseResolver = null;
    }
  }
}

function resetPause() {
  isPaused = false;
  pauseResolver = null;
  const pauseButton = document.getElementById("pauseButton");
  if (pauseButton) {
    pauseButton.textContent = "Pause";
    pauseButton.style.backgroundColor = "#ff9800";
  }
}
