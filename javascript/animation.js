// Set up canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Set up initial position of rocket
var x = 600;
var y = 600;

// Set up speed of rocket
var speed = 1;

// Draw rocket
function drawRocket() {
  ctx.Rect(0, 0, 20, 20);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+20, y-20);
  ctx.lineTo(x+40, y);
  ctx.lineTo(x+20, y+20);
  ctx.closePath();
  ctx.stroke();
}

// Animate rocket
function animateRocket() {
  y -= speed;
  drawRocket();
  requestAnimationFrame(animateRocket);
}

// Insert canvas into page
var container = document.getElementById("canvasContainer");
container.appendChild(canvas);

animateRocket();
