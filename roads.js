// ===== UTILITAIRES GÉOMÉTRIQUES =====
function getCircleData(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
    r: rect.width / 2,
  };
}

function getPointOnCircle(center, angleRad) {
  return {
    x: center.x + center.r * Math.cos(angleRad),
    y: center.y + center.r * Math.sin(angleRad),
  };
}

// ===== GESTION DU SVG =====
function createOrGetSVG() {
  let svg = document.getElementById("svg-lines");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "svg-lines");
    svg.style.cssText = `
      position: absolute; top: 0; left: 0; 
      width: 100vw; height: 100vh; 
      pointer-events: none; z-index: 1;
    `;
    document.body.appendChild(svg);
  }
  return svg;
}

// ===== ANIMATION DES LIGNES =====
function animatePath(path, duration = 1200) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = "12,8";
  path.style.strokeDashoffset = length;
  path.getBoundingClientRect(); // Force reflow

  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    path.style.strokeDashoffset = length * (1 - progress);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// ===== DESSIN DES LIGNES =====
function drawCurveBetweenNodes(classA, classB, color = "red", delay = 0) {
  setTimeout(() => {
    const elA = document.querySelector(`.${classA}`);
    const elB = document.querySelector(`.${classB}`);

    if (!elA || !elB) {
      console.error(`Éléments non trouvés: ${classA} ou ${classB}`);
      return;
    }

    const a = getCircleData(elA);
    const b = getCircleData(elB);

    // Calcul des points de connexion
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const start = getPointOnCircle(a, angle);
    const end = getPointOnCircle(b, angle + Math.PI);

    // Création de la courbe
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const perpAngle = angle + Math.PI / 2;
    const curveOffset = 50;
    const cx = mx + curveOffset * Math.cos(perpAngle);
    const cy = my + curveOffset * Math.sin(perpAngle);

    // Création du path SVG
    const svg = createOrGetSVG();
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`
    );
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "8,4");

    svg.appendChild(path);
    animatePath(path, 1500);
  }, delay);
}

// Fonction avec ID unique pour suppression ultérieure
function drawCurveWithId(classA, classB, color = "red", delay = 0) {
  const uniqueId = `line-${Date.now()}-${Math.random()}`;

  setTimeout(() => {
    drawCurveBetweenNodes(classA, classB, color, 0);
    const paths = document.querySelectorAll("#svg-lines path");
    const lastPath = paths[paths.length - 1];
    if (lastPath) lastPath.setAttribute("id", uniqueId);
  }, delay);

  return uniqueId;
}

// Suppression d'une ligne par ID
function removeLineById(lineId) {
  const line = document.getElementById(lineId);
  if (line) {
    line.style.transition = "opacity 0.5s ease-out";
    line.style.opacity = "0";
    setTimeout(() => line.remove(), 500);
  }
}

// ===== DESSIN DES ROUTES INITIALES =====
const ROAD_CONNECTIONS = [
  ["kaamelott", "village1"],
  ["kaamelott", "village2"],
  ["kaamelott", "broceliande"],
  ["village1", "orcanie"],
  ["village1", "mountain"],
  ["village2", "carmelide"],
  ["village2", "hammeau"],
  ["orcanie", "mountain"],
  ["carmelide", "lugdunum"],
  ["hammeau", "lugdunum"],
  ["broceliande", "avalon"],
  ["mountain", "avalon"],
  ["avalon", "lugdunum"],
];

function drawAllRoads() {
  setTimeout(() => {
    ROAD_CONNECTIONS.forEach(([nodeA, nodeB], index) => {
      drawCurveBetweenNodes(nodeA, nodeB, "#383E42", index * 200);
    });
  }, 500);
}

// Lancer le dessin des routes au chargement
window.addEventListener("load", () => {
  console.log("Début du tracé des routes...");
  drawAllRoads();
});
