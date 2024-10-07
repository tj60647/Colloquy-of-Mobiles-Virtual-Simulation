import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js";

// Default camera positions
const perspectiveCameraDefaultPosition = new THREE.Vector3(-5, 11, -21);
const orthographicCameraDefaultPosition = new THREE.Vector3(0, 100, 0);

// Function to set up a perspective camera
function createPerspectiveCamera() {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  perspectiveCamera.position.copy(perspectiveCameraDefaultPosition);
  return perspectiveCamera;
}

// Function to set up an orthographic camera
function createOrthographicCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const orthoSize = 50;
  const orthographicCamera = new THREE.OrthographicCamera(
    -orthoSize * aspect,
    orthoSize * aspect,
    orthoSize,
    -orthoSize,
    0.1,
    1000
  );
  orthographicCamera.position.copy(orthographicCameraDefaultPosition);
  orthographicCamera.lookAt(0, 0, 0);
  orthographicCamera.up.set(0, 0, -1);
  return orthographicCamera;
}

// Function to create orbit controls
function createOrbitControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  return controls;
}

// camera ui utilities
// UI Controls

// Function to create camera control buttons

export function createCameraControl(
  renderer,
  perspectiveCamera,
  orthographicCamera,
  camera_orbitControl
) {
  //if perspectiveCamera is not passed, create a new one
  if (!perspectiveCamera) {
    perspectiveCamera = createPerspectiveCamera();
  }

  //if orthographicCamera is not passed, create a new one
  if (!orthographicCamera) {
    orthographicCamera = createOrthographicCamera();
  }

  //if orbitControl is not passed, create a new one
  if (!camera_orbitControl) {
    camera_orbitControl = createOrbitControls(perspectiveCamera, renderer);
  }

  // Create a container for the camera control buttons
  const cameraControlContainer = document.createElement("div");
  cameraControlContainer.style.position = "absolute";
  cameraControlContainer.style.bottom = "10px";
  cameraControlContainer.style.left = "10px";
  cameraControlContainer.style.display = "flex";
  cameraControlContainer.style.flexDirection = "column";
  cameraControlContainer.style.gap = "10px";
  cameraControlContainer.style.zIndex = "101"; // Ensure it's on top of other elements
  document.body.appendChild(cameraControlContainer);

  // Attach `isPerspective` and `camera` directly to the container to manage camera state
  cameraControlContainer.isPerspective = true;
  cameraControlContainer.perspectiveCamera = perspectiveCamera;
  cameraControlContainer.orthographicCamera = orthographicCamera;
  cameraControlContainer.camera = perspectiveCamera; // Start with perspective camera
  cameraControlContainer.camera_orbitControl = camera_orbitControl;

  console.log("perspectiveCamera: ", cameraControlContainer.perspectiveCamera);
  console.log(
    "orthographicCamera: ",
    cameraControlContainer.orthographicCamera
  );
  console.log("camera: ", cameraControlContainer.camera);
  console.log(
    "camera_orbitControl: ",
    cameraControlContainer.camera_orbitControl
  );

  // Create a button to toggle the camera view
  const toggleCameraButton = document.createElement("button");
  toggleCameraButton.textContent = "Toggle Camera";
  toggleCameraButton.style.padding = "10px 20px";
  toggleCameraButton.style.backgroundColor = "#888888";
  toggleCameraButton.style.color = "white";
  toggleCameraButton.style.border = "none";
  toggleCameraButton.style.borderRadius = "5px";
  toggleCameraButton.style.cursor = "pointer";
  toggleCameraButton.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)";

  // Append the toggle button to the container
  cameraControlContainer.appendChild(toggleCameraButton);

  toggleCameraButton.addEventListener("click", () => {
    // Toggle the camera state attached to the container
    cameraControlContainer.isPerspective =
      !cameraControlContainer.isPerspective;

    // Switch the camera based on the updated state
    if (cameraControlContainer.isPerspective) {
      cameraControlContainer.camera = cameraControlContainer.perspectiveCamera;
      // Update the OrbitControls to use the new camera
      cameraControlContainer.camera_orbitControl.object =
        cameraControlContainer.camera;
      cameraControlContainer.camera_orbitControl.update();
      cameraControlContainer.camera_orbitControl.enabled = true;
    } else {
      cameraControlContainer.camera = cameraControlContainer.orthographicCamera;
      // Update the OrbitControls to use the new camera
      cameraControlContainer.camera_orbitControl.object =
        cameraControlContainer.camera;
      cameraControlContainer.camera_orbitControl.update();
      cameraControlContainer.camera_orbitControl.enabled = false;
    }
    // Update the camera projection matrix
    updateActiveCamera();

    console.log("isPerspective: ", cameraControlContainer.isPerspective);
    console.log("camera: ", cameraControlContainer.camera);
    console.log(
      "camera_orbitControl: ",
      cameraControlContainer.camera_orbitControl
    );
  });

  // Create a button to reset the camera view
  const resetCameraButton = document.createElement("button");
  resetCameraButton.textContent = "Reset Camera";
  resetCameraButton.style.padding = "10px 20px";
  resetCameraButton.style.backgroundColor = "#4CAF50";
  resetCameraButton.style.color = "white";
  resetCameraButton.style.border = "none";
  resetCameraButton.style.borderRadius = "5px";
  resetCameraButton.style.cursor = "pointer";
  resetCameraButton.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)";

  // Append the reset button to the container
  cameraControlContainer.appendChild(resetCameraButton);

  resetCameraButton.addEventListener("click", () => {
    // Reset to default positions based on the camera type
    if (cameraControlContainer.isPerspective) {
      cameraControlContainer.perspectiveCamera.position.copy(
        perspectiveCameraDefaultPosition
      );
    } else {
      cameraControlContainer.orthographicCamera.position.copy(
        orthographicCameraDefaultPosition
      );
      cameraControlContainer.orthographicCamera.lookAt(0, 0, 0);
    }

    // Update the camera projection matrix
    updateActiveCamera();

    // Reset the orbit control target to the origin
    cameraControlContainer.camera_orbitControl.target.set(0, 0, 0);
    cameraControlContainer.camera_orbitControl.update();
  });

  // Handling window resizing
  window.addEventListener("resize", () => {
    const aspect = window.innerWidth / window.innerHeight;

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateActiveCamera();
  });

  function updateActiveCamera() {
    // Update the active camera
    if (cameraControlContainer.isPerspective) {
      const aspect = window.innerWidth / window.innerHeight;
      cameraControlContainer.perspectiveCamera.aspect = aspect;
      cameraControlContainer.perspectiveCamera.updateProjectionMatrix();
    } else {
      const aspect = window.innerWidth / window.innerHeight;
      cameraControlContainer.orthographicCamera.left = -50 * aspect;
      cameraControlContainer.orthographicCamera.right = 50 * aspect;
      cameraControlContainer.orthographicCamera.top = 50;
      cameraControlContainer.orthographicCamera.bottom = -50;
      cameraControlContainer.orthographicCamera.updateProjectionMatrix();
    }
  }

  return cameraControlContainer;
}
