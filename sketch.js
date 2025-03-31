// Voronoi algorithm implementation
// Cell href links
const cellHrefs = {
  "about": "#about",
  "work": "work",
  "play": "play",
  "contact": "contact-form",
  "tools": "#tools",
  "photos": "#photos"
};

class Voronoi {
  constructor(points) {
    this.points = points;
    this.cells = [];
    this.createCells();
  }

  createCells() {
    // Initialize cells
    for (let i = 0; i < this.points.length; i++) {
      this.cells.push({
        site: this.points[i],
        index: i + 1,
      });
    }
  }

  getCell(x, y) {
    let closestIndex = 0;
    let closestDist = Infinity;

    // Find the closest point (voronoi cell)
    for (let i = 0; i < this.points.length; i++) {
      const pt = this.points[i];
      const dist = this.dist(pt.x, pt.y, x, y);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }

    return this.cells[closestIndex];
  }

  dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
}

// P5.js sketch
let voronoi;
let points = [];
let colors = [];
let originalColors = []; // Store original colors
let lastColors = []; // Store last background colors before hover
let cellCenters = [];
let hoveredCell = null;
let cellPixels = []; // Store which pixels belong to which cell
const numPoints = 6; // Updated to 6 for all labels
const cellLabels = ["about", "work", "play", "contact", "tools", "photos"];
const resolution = 20; // Resolution for rendering the Voronoi cells
let hoverInterval;
let hueValue = 0;

function setup() {
  // Make canvas fill the entire window
  createCanvas(windowWidth, windowHeight);

  // Initialize cellPixels array
  for (let i = 0; i < numPoints; i++) {
    cellPixels.push([]);
  }

  // Create 5 random points
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: random(100, width - 100),
      y: random(100, height - 100),
    });
  }

  // Initialize Voronoi diagram
  voronoi = new Voronoi(points);

  // Generate random colors for cells
  for (let i = 0; i < numPoints; i++) {
    const newColor = color(random(100, 255), random(100, 255), random(100, 255), 1);
    colors.push(newColor);
    originalColors.push(newColor); // Store the original color
    lastColors.push(newColor); // Initialize last colors
  }

  // Find cell centers for text placement
  findCellCenters();

  // Enable looping for interaction
  loop();
}

// Resize canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  findCellCenters();
}

function draw() {
  background(240);

  // Clear cellPixels array
  for (let i = 0; i < numPoints; i++) {
    cellPixels[i] = [];
  }

  // Check for hover
  updateHoveredCell();

  // Draw Voronoi cells
  for (let x = 0; x < width; x += resolution) {
    for (let y = 0; y < height; y += resolution) {
      const cell = voronoi.getCell(x, y);
      const idx = cell.index - 1;

      // Store which pixels belong to which cell
      cellPixels[idx].push({ x, y });

      fill(colors[idx]);
      noStroke();
      rect(x, y, resolution, resolution);
    }
  }

  // Draw cell boundaries
  stroke(0);
  strokeWeight(2);
  // strokeCap(SQUARE);

  for (let x = 0; x < width; x += resolution) {
    for (let y = 0; y < height; y += resolution) {
      const cell = voronoi.getCell(x, y);
      const idx = cell.index - 1;

      // Check neighbors
      if (x + resolution < width) {
        const rightCell = voronoi.getCell(x + resolution, y);
        if (rightCell.index !== cell.index) {
          // line(x + resolution, y, x + resolution, y + resolution);
        }
      }

      if (y + resolution < height) {
        const bottomCell = voronoi.getCell(x, y + resolution);
        if (bottomCell.index !== cell.index) {
          // line(x, y + resolution, x + resolution, y + resolution);
        }
      }
    }
  }

  // Draw hover stroke for hovered cell
  if (hoveredCell !== null) {
    
    stroke(255, 255, 0);
    strokeWeight(4);

    // Draw a stroke around all pixels of the hovered cell
    for (let i = 0; i < cellPixels[hoveredCell].length; i++) {
      const px = cellPixels[hoveredCell][i];

      // Check if this pixel is at the edge of the cell
      let isEdge = false;

      // Check all neighbors
      const neighbors = [
        { x: px.x - resolution, y: px.y },
        { x: px.x + resolution, y: px.y },
        { x: px.x, y: px.y - resolution },
        { x: px.x, y: px.y + resolution },
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.x >= 0 &&
          neighbor.x < width &&
          neighbor.y >= 0 &&
          neighbor.y < height
        ) {
          const neighborCell = voronoi.getCell(neighbor.x, neighbor.y);
          if (neighborCell.index - 1 !== hoveredCell) {
            isEdge = true;
            break;
          }
        } else {
          // Canvas boundary is also an edge
          isEdge = true;
          break;
        }
      }

      if (isEdge) {
        noFill();
        // rect(px.x, px.y, resolution, resolution);
      }
      
    }
  }

  // Draw cell labels
  textSize(22);
  textAlign(CENTER, CENTER);
  fill(0);
  noStroke();
  for (let i = 0; i < cellCenters.length; i++) {
    push();
    if (hoveredCell === i) {
      // Use the last background color for text
      // fill(lastColors[i]);
      
      // Add underline
      const labelWidth = textWidth(cellLabels[i]);
      const x = cellCenters[i].x;
      const y = cellCenters[i].y;
      
      // Draw the text
      text(cellLabels[i], x, y);
      
    } else {
      fill(0);
      text(cellLabels[i], cellCenters[i].x, cellCenters[i].y);
    }
    pop();
  }

  // Draw original points
  fill(0);
  noStroke();
  for (let i = 0; i < points.length; i++) {
    // circle(points[i].x, points[i].y, 5);
  }
}

function updateHoveredCell() {
  // First check if mouse is actually over the canvas
  if (mouseX === 0 && mouseY === 0 && !mouseIsPressed && 
      (document.mouseX === undefined || document.mouseY === undefined || 
       document.mouseX < 0 || document.mouseX > width || 
       document.mouseY < 0 || document.mouseY > height)) {
    hoveredCell = null;
    return;
  }

  // Regular hover check
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    const cell = voronoi.getCell(mouseX, mouseY);
    const newHoveredCell = cell.index - 1;
    
    if (hoveredCell !== newHoveredCell) {
      if (hoveredCell !== null) {
        lastColors[hoveredCell] = colors[hoveredCell];
      }
      hoveredCell = newHoveredCell;
      // Add random offset to hue when changing cells
      hueValue = (hueValue + random(0, 360)) % 360;
    }
    
    // Smoothly cycle hue for hovered cell
    if (hoveredCell !== null) {
      colorMode(HSB);
      hueValue = (hueValue + 0.1) % 360;
      colors[hoveredCell] = color(hueValue, 70, 60);
      colorMode(RGB);
    }
  } else {
    hoveredCell = null;
  }
}

function findCellCenters() {
  // Initialize counters and sum for each cell
  let cellPoints = [];
  for (let i = 0; i < numPoints; i++) {
    cellPoints.push({
      count: 0,
      sumX: 0,
      sumY: 0,
    });
  }

  // Sample points across the canvas
  const sampleResolution = resolution * 2;
  for (let x = 0; x < width; x += sampleResolution) {
    for (let y = 0; y < height; y += sampleResolution) {
      const cell = voronoi.getCell(x, y);
      const idx = cell.index - 1;

      cellPoints[idx].count++;
      cellPoints[idx].sumX += x;
      cellPoints[idx].sumY += y;
    }
  }

  // Calculate average position (centroid) for each cell
  cellCenters = []; // Clear existing centers
  for (let i = 0; i < numPoints; i++) {
    if (cellPoints[i].count > 0) {
      // Calculate the raw center
      const rawX = cellPoints[i].sumX / cellPoints[i].count;
      const rawY = cellPoints[i].sumY / cellPoints[i].count;
      
      // Snap to grid by rounding to nearest resolution step
      const snappedX = Math.round(rawX / resolution) * resolution;
      const snappedY = Math.round(rawY / resolution) * resolution;
      
      cellCenters.push({
        x: snappedX,
        y: snappedY
      });
    } else {
      // Fallback to the original point if no samples, but still snap to grid
      const snappedX = Math.round(points[i].x / resolution) * resolution;
      const snappedY = Math.round(points[i].y / resolution) * resolution;
      
      cellCenters.push({
        x: snappedX,
        y: snappedY
      });
    }
  }
}

let mouseHoldInterval;

function mousePressed() {
  // Get the cell that was clicked
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    const cell = voronoi.getCell(mouseX, mouseY);
    const label = cellLabels[cell.index - 1];
    const href = cellHrefs[label];
    
    // Navigate using Cargo's internal page switching
    if (href) {
      // Create a temporary link with rel="history"
      const tempLink = document.createElement('a');
      tempLink.href = href;
      tempLink.rel = 'history';
      // Simulate click on this temporary link
      tempLink.click();
      return false; // Prevent default behavior
    }
    
    // Existing color change code
    randomColor(cell);
    
    mouseHoldInterval = setInterval(() => {
      if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        const currentCell = voronoi.getCell(mouseX, mouseY);
        randomColor(currentCell);
      }
    }, 50);
  }
  
  return false;
}

function mouseReleased() {
  // Clear the interval when mouse is released
  if (mouseHoldInterval) {
    clearInterval(mouseHoldInterval);
  }
  return false;
}


function randomColor(cell){
  
    // You can add your click action here
    // For example, change the color of the clicked cell
    colors[cell.index - 1] = color(
      random(100, 255),
      random(100, 255),
      random(100, 255),
      200
    );
  
}

// Touch events support
function touchStarted() {
  // Update the hovered cell for touch devices
  if (touches.length > 0) {
    const touch = touches[0];
    if (touch.x >= 0 && touch.x < width && touch.y >= 0 && touch.y < height) {
      const cell = voronoi.getCell(touch.x, touch.y);
      hoveredCell = cell.index - 1;
    }
  }
  return false; // Prevent default behavior
}

function touchMoved() {
  // Update the hovered cell when touch is moved
  if (touches.length > 0) {
    const touch = touches[0];
    if (touch.x >= 0 && touch.x < width && touch.y >= 0 && touch.y < height) {
      const cell = voronoi.getCell(touch.x, touch.y);
      hoveredCell = cell.index - 1;
    }
  }
  return false; // Prevent default behavior
}

function touchEnded() {
  hoveredCell = null;
  return false; // Prevent default behavior
}
