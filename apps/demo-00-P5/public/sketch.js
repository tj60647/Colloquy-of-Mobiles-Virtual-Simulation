function setup() {
  createCanvas(800, 800, WEBGL);
  createEasyCam();
  document.oncontextmenu = () => false;
}

function draw() {
  background(0);
  lights();
  box(100);
}
