let poses = [];
let keypoints = [];
let video;

var keypoint, leftWrist, rightWrist, topMost;

function setup() {
  createCanvas(640, 480, WEBGL);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Create a new poseNet method
  const poseNet = ml5.poseNet(video, modelLoaded);

  // Listen to new 'pose' events
  poseNet.on("pose", (results) => gotPose(results));
}

function draw() {
  background(255);
  translate(-width / 2, -height / 2);

  if (poses.length === 0) {
    console.log("waiting for poses");
    return;
  }

  initThreeJs();
  initSkeleton();

  // Listen for window resize
  window.addEventListener("resize", onWindowResize, false);

  var topMost = getTopMostPoint();

  drawKeypoints();
  drawSkeleton();
  drawWrists();

  fill("black");
  ellipse(topMost.x, topMost.y, 20);

  if (rightWrist.y < height / 3 || leftWrist.y < height / 3) {
    drawSphere();
  }

  push();
  scale(0.2, 0.2);
  image(video, 0, 0, width, height);
  pop();
}

function gotPose(results) {
  poses = results;
}

// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}

function initThreeJs() {
  // Three.js renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
  camera.position.set(0, 300, 3000);
  scene.add(camera);
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Three.js light
  let light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 10, 100).normalize();
  scene.add(light);
}

function initSkeleton() {
  // Create cubes for joints
  for (let i = 0; i < 32; i++) {
    // Create a material
    // This gives the cube its color and look
    let material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      specular: 0x666666,
      emissive: 0xee82ee,
      shininess: 10,
      opacity: 0.8,
      transparent: true,
    });

    // This gives the cube its shape
    let geometry = new THREE.BoxBufferGeometry(30, 30, 30);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));

    // The mesh is made from the shape and the material
    // https://en.wikipedia.org/wiki/Polygon_mesh
    let mesh = new THREE.Mesh(geometry, material);

    // Create an array of keypoint meshes for easy manipulation
    keypoints.push(mesh);

    // Put the mesh in the scene
    scene.add(mesh);
  }
}

function drawKeypoints() {
  // get all of my keypoints
  const keypoints = poses[0].pose.keypoints;

  for (let i = 0; i < keypoints.length; i++) {
    var keypoint = keypoints[i];

    noStroke();
    fill("red");
    ellipse(keypoint.position.x, keypoint.position.y, 15);

  }
}

function drawSkeleton() {
  const bones = poses[0].skeleton;
  for (let i = 0; i < bones.length; i++) {
    const jointA = bones[i][0].position;
    const jointB = bones[i][1].position;

    strokeWeight(5);
    stroke("red");
    line(jointA.x, jointA.y, jointB.x, jointB.y);
  }
}

function getTopMostPoint() {
  // find topmost keypoint
  let topMost = {};
  topMost.y = height;

  var keypoints = poses[0].pose.keypoints;
  for (let i = 0; i < keypoints.length; i++) {
    var keypoint = keypoints[i].position;

    if (keypoint.y < topMost.y) {
      topMost.x = keypoint.x;
      topMost.y = keypoint.y;
    }
  }

  return topMost;
}