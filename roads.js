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

// Animation du tracé en pointillé
function animatePath(path, duration = 1200) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = "12,8";
  path.style.strokeDashoffset = length;
  path.getBoundingClientRect(); // Force le reflow

  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    path.style.strokeDashoffset = length * (1 - progress);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      path.style.strokeDashoffset = 0;
    }
  }
  requestAnimationFrame(step);
}

function drawCurveBetweenCircles(classA, classB, color = "red", delay = 0) {
  setTimeout(() => {
    const elA = document.querySelector(`.${classA}`);
    const elB = document.querySelector(`.${classB}`);

    console.log(`Recherche: .${classA} et .${classB}`);
    console.log("Élément A:", elA);
    console.log("Élément B:", elB);

    if (!elA || !elB) {
      console.error(`Éléments non trouvés: ${classA} ou ${classB}`);
      return;
    }

    const a = getCircleData(elA);
    const b = getCircleData(elB);

    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const start = getPointOnCircle(a, angle);
    const end = getPointOnCircle(b, angle + Math.PI);

    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    const perpAngle = angle + Math.PI / 2;
    const curveOffset = 50; // Réduit pour une grille plus petite
    const cx = mx + curveOffset * Math.cos(perpAngle);
    const cy = my + curveOffset * Math.sin(perpAngle);

    let svg = document.getElementById("svg-lines");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("id", "svg-lines");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100vw";
      svg.style.height = "100vh";
      svg.style.pointerEvents = "none";
      svg.style.zIndex = "1"; // Au-dessus de la grille mais sous le contenu
      document.body.appendChild(svg);
    }

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

function drawAllRoads() {
  // Attendre que tous les éléments soient chargés
  setTimeout(() => {
    // Routes depuis Kaamelott
    drawCurveBetweenCircles("kaamelott", "village1", "#383E42", 0); // Marron
    drawCurveBetweenCircles("kaamelott", "village2", "#383E42", 200); // Marron
    drawCurveBetweenCircles("kaamelott", "broceliande", "#383E42", 400); // Vert forêt

    // Routes entre villages
    drawCurveBetweenCircles("village1", "orcanie", "#383E42", 600); // Bleu acier
    drawCurveBetweenCircles("village1", "mountain", "#383E42", 800); // Gris ardoise

    drawCurveBetweenCircles("village2", "carmelide", "#383E42", 1000); // Bleu acier
    drawCurveBetweenCircles("village2", "hammeau", "#383E42", 1200); // Brun sable

    // Routes depuis autres lieux
    drawCurveBetweenCircles("orcanie", "mountain", "#383E42", 1400);
    drawCurveBetweenCircles("carmelide", "lugdunum", "#383E42", 1600); // Turquoise clair
    drawCurveBetweenCircles("hammeau", "lugdunum", "#383E42", 1800);
    drawCurveBetweenCircles("broceliande", "avalon", "#383E42", 2000);
    drawCurveBetweenCircles("mountain", "avalon", "#383E42", 2200);
    drawCurveBetweenCircles("avalon", "lugdunum", "#383E42", 2400);
  }, 500);
}

// Attendre le chargement complet
window.addEventListener("load", () => {
  console.log("Page chargée, début du tracé des routes...");
  drawAllRoads();
});
