// Voronoi algorithm implementation
// Cell href links
const cellHrefs = {
  "about": "about",
  "work": "work",
  // "play": "play",
  "contact": "contact-form",
  // "tools": "/tools",
  // "photos": "photos"
};

// Get labels from hrefs object and filter out commented entries
const cellLabels = Object.keys(cellHrefs);
const numPoints = cellLabels.length;

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

// First, let's create a VoronoiCell class to manage both canvas and HTML elements
class VoronoiCell {
  constructor(index, label, href, position) {
    this.index = index;
    this.label = label;
    this.href = href;
    this.position = position;
    this.color = color(random(100, 255), random(100, 255), random(100, 255), 1);
    this.originalColor = this.color;
    this.lastColor = this.color;
    this.pixels = [];
    this.isHovered = false;
    
    // Create HTML link element
    this.createLinkElement();
  }

  createLinkElement() {
    this.linkElement = document.createElement('a');
    this.linkElement.id = `voronoi-link-${this.index}`;
    this.linkElement.rel = 'history';
    this.linkElement.href = this.href;
    this.linkElement.textContent = this.label;
    this.linkElement.className = 'voronoi-link';
    this.updateLinkStyle();
    // Change parent element to mainpage-container
    const container = document.getElementById('mainpage-container');
    if (container) {
      container.appendChild(this.linkElement);
    }
  }

  updateLinkStyle() {
    Object.assign(this.linkElement.style, {
      position: 'absolute',
      textDecoration: 'none',
      color: 'black',
      fontSize: '22px',
      left: `${this.position.x}px`,
      top: `${this.position.y}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: '1'
    });
  }

  updatePosition(x, y) {
    this.position = { x, y };
    this.updateLinkStyle();
  }

  setHovered(isHovered) {
    this.isHovered = isHovered;
    if (isHovered) {
      this.lastColor = this.color;
    }
  }

  updateColor(newColor) {
    this.color = newColor;
  }

  cleanup() {
    if (this.linkElement) {
      this.linkElement.remove();
    }
  }
}

// Then create a VoronoiManager class to handle the overall system
class VoronoiManager {
  constructor(cellHrefs) {
    this.cells = [];
    this.hoveredCell = null;
    this.resolution = 20;
    this.hueValue = 0;
    
    // Initialize cells from hrefs
    const labels = Object.keys(cellHrefs);
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const position = {
        x: random(100, windowWidth - 100),
        y: random(100, windowHeight - 100)
      };
      this.cells.push(new VoronoiCell(i, label, cellHrefs[label], position));
    }

    this.voronoi = new Voronoi(this.cells.map(cell => cell.position));
  }

  update() {
    this.updateHoveredCell();
    this.updateCellCenters();
  }

  draw() {
    background(240);

    // Clear cellPixels array
    for (let i = 0; i < numPoints; i++) {
      this.cells[i].pixels = [];
    }

    // Draw Voronoi cells
    for (let x = 0; x < width; x += this.resolution) {
      for (let y = 0; y < height; y += this.resolution) {
        const cell = this.voronoi.getCell(x, y);
        const idx = cell.index - 1;
        
        fill(this.cells[idx].color);
        noStroke();
        rect(x, y, this.resolution, this.resolution);
      }
    }

    // Draw cell boundaries
    stroke(0);
    strokeWeight(2);
    // strokeCap(SQUARE);

    for (let x = 0; x < width; x += this.resolution) {
      for (let y = 0; y < height; y += this.resolution) {
        const cell = this.voronoi.getCell(x, y);
        const idx = cell.index - 1;

        // Check neighbors
        if (x + this.resolution < width) {
          const rightCell = this.voronoi.getCell(x + this.resolution, y);
          if (rightCell.index !== cell.index) {
            // line(x + resolution, y, x + resolution, y + resolution);
          }
        }

        if (y + this.resolution < height) {
          const bottomCell = this.voronoi.getCell(x, y + this.resolution);
          if (bottomCell.index !== cell.index) {
            // line(x, y + resolution, x + resolution, y + resolution);
          }
        }
      }
    }

    // Draw hover stroke for hovered cell
    if (this.hoveredCell !== null) {
      stroke(255, 255, 0);
      strokeWeight(4);

      // Draw a stroke around all pixels of the hovered cell
      for (let i = 0; i < this.cells[this.hoveredCell].pixels.length; i++) {
        const px = this.cells[this.hoveredCell].pixels[i];

        // Check if this pixel is at the edge of the cell
        let isEdge = false;

        // Check all neighbors
        const neighbors = [
          { x: px.x - this.resolution, y: px.y },
          { x: px.x + this.resolution, y: px.y },
          { x: px.x, y: px.y - this.resolution },
          { x: px.x, y: px.y + this.resolution },
        ];

        for (const neighbor of neighbors) {
          if (
            neighbor.x >= 0 &&
            neighbor.x < width &&
            neighbor.y >= 0 &&
            neighbor.y < height
          ) {
            const neighborCell = this.voronoi.getCell(neighbor.x, neighbor.y);
            if (neighborCell.index - 1 !== this.hoveredCell) {
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
    for (let i = 0; i < this.cells.length; i++) {
      // Remove the text drawing code and create HTML links instead
      const label = this.cells[i].label;
      const href = this.cells[i].href;
      
      // Update link properties
      this.cells[i].linkElement.href = href;
      this.cells[i].linkElement.textContent = label;
      
      // Update styles for hovered state
      // if (hoveredCell === i) {
      //   linkElement.style.color = 'yellow'; // or any hover state styling you prefer
      // } else {
      //   linkElement.style.color = 'black';
      // }
    }

    // Draw original points
    fill(0);
    noStroke();
    for (let i = 0; i < this.cells.length; i++) {
      // circle(points[i].x, points[i].y, 5);
    }
  }

  updateHoveredCell() {
    // First check if mouse is actually over the canvas
    if (mouseX === 0 && mouseY === 0 && !mouseIsPressed && 
        (document.mouseX === undefined || document.mouseY === undefined || 
         document.mouseX < 0 || document.mouseX > width || 
         document.mouseY < 0 || document.mouseY > height)) {
      this.hoveredCell = null;
      return;
    }

    // Regular hover check
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
      const cell = this.voronoi.getCell(mouseX, mouseY);
      const newHoveredCell = cell.index - 1;
      
      if (this.hoveredCell !== newHoveredCell) {
        if (this.hoveredCell !== null) {
          this.cells[this.hoveredCell].lastColor = this.cells[this.hoveredCell].color;
        }
        this.hoveredCell = newHoveredCell;
        // Add random offset to hue when changing cells
        this.hueValue = (this.hueValue + random(0, 360)) % 360;
      }
      
      // Smoothly cycle hue for hovered cell
      if (this.hoveredCell !== null) {
        colorMode(HSB);
        this.hueValue = (this.hueValue + 0.1) % 360;
        this.cells[this.hoveredCell].color = color(this.hueValue, 70, 60);
        colorMode(RGB);
      }
    } else {
      this.hoveredCell = null;
    }
  }

  updateCellCenters() {
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
    const sampleResolution = this.resolution * 2;
    for (let x = 0; x < width; x += sampleResolution) {
      for (let y = 0; y < height; y += sampleResolution) {
        const cell = this.voronoi.getCell(x, y);
        const idx = cell.index - 1;

        cellPoints[idx].count++;
        cellPoints[idx].sumX += x;
        cellPoints[idx].sumY += y;
      }
    }

    // Calculate average position (centroid) for each cell
    let cellCenters = []; // Clear existing centers
    for (let i = 0; i < numPoints; i++) {
      if (cellPoints[i].count > 0) {
        // Calculate the raw center
        const rawX = cellPoints[i].sumX / cellPoints[i].count;
        const rawY = cellPoints[i].sumY / cellPoints[i].count;
        
        // Snap to grid by rounding to nearest resolution step
        const snappedX = Math.round(rawX / this.resolution) * this.resolution;
        const snappedY = Math.round(rawY / this.resolution) * this.resolution;
        
        cellCenters.push({
          x: snappedX,
          y: snappedY
        });
      } else {
        // Fallback to the original point if no samples, but still snap to grid
        const snappedX = Math.round(this.cells[i].position.x / this.resolution) * this.resolution;
        const snappedY = Math.round(this.cells[i].position.y / this.resolution) * this.resolution;
        
        cellCenters.push({
          x: snappedX,
          y: snappedY
        });
      }
    }

    // Update cell positions
    for (let i = 0; i < numPoints; i++) {
      this.cells[i].updatePosition(cellCenters[i].x, cellCenters[i].y);
    }
  }

  handleClick(x, y, event) {
    // Check if click target is canvas or voronoi-link
    const validTargets = ['canvas', 'voronoi-link'];
    if (!event.target.classList.contains('voronoi-link') && 
        !event.target.matches('canvas')) {
      return false;
    }

    const cell = this.voronoi.getCell(x, y);
    if (cell) {
      const voronoiCell = this.cells[cell.index - 1];
      if (voronoiCell.href) {
        voronoiCell.linkElement.click();
        return true;
      }
    }
    return false;
  }

  cleanup() {
    this.cells.forEach(cell => cell.cleanup());
  }
}

// Initialize the manager in your sketch
let voronoiManager;

function setup() {
  const container = document.getElementById('mainpage-container');
  if (container) {
    // Create canvas inside the container
    const canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent(container);
    
    // Set container style to handle canvas positioning
    container.style.position = 'relative';
    
    cursor(HAND);
    
    // Initialize Voronoi manager
    voronoiManager = new VoronoiManager(cellHrefs);
  }
}

// Update windowResized to use container dimensions
function windowResized() {
  const container = document.getElementById('mainpage-container');
  if (container) {
    resizeCanvas(container.offsetWidth, container.offsetHeight);
    voronoiManager.updateCellCenters();
  }
}

function draw() {
  voronoiManager.update();
  voronoiManager.draw();
}

function mousePressed(event) {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    return voronoiManager.handleClick(mouseX, mouseY, event);
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
    cell.color = color(
      random(100, 255),
      random(100, 255),
      random(100, 255),
      200
    );
  
}

// Touch events support
function touchStarted(event) {
  if (touches.length > 0) {
    const touch = touches[0];
    if (touch.x >= 0 && touch.x < width && touch.y >= 0 && touch.y < height) {
      // Check if touch target is canvas or voronoi-link
      const validTargets = ['canvas', 'voronoi-link'];
      if (!event.target.classList.contains('voronoi-link') && 
          !event.target.matches('canvas')) {
        return false;
      }

      const cell = voronoiManager.voronoi.getCell(touch.x, touch.y);
      voronoiManager.hoveredCell = cell.index - 1;
      
      // Handle the click/tap
      voronoiManager.handleClick(touch.x, touch.y, event);
    }
  }
  return false; // Prevent default behavior
}

function touchMoved() {
  // Update the hovered cell when touch is moved
  if (touches.length > 0) {
    const touch = touches[0];
    if (touch.x >= 0 && touch.x < width && touch.y >= 0 && touch.y < height) {
      const cell = voronoiManager.voronoi.getCell(touch.x, touch.y);
      voronoiManager.hoveredCell = cell.index - 1;
    }
  }
  return false; // Prevent default behavior
}

function touchEnded() {
  voronoiManager.hoveredCell = null;
  return false; // Prevent default behavior
}
