import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js";

/**
 * Creates and sets up a perspective camera.
 * @returns {THREE.PerspectiveCamera} The created perspective camera.
 */
function createPerspectiveCamera(position) {
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  perspectiveCamera.position.copy(position);
  return perspectiveCamera;
}

/**
 * Creates and sets up an orthographic camera.
 * @returns {THREE.OrthographicCamera} The created orthographic camera.
 */
function createOrthographicCamera(position) {
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
  orthographicCamera.position.copy(position);
  orthographicCamera.lookAt(0, 0, 0);
  orthographicCamera.up.set(0, 0, -1);
  return orthographicCamera;
}

/**
 * Creates and sets up orbit controls with custom configuration options.
 * @param {THREE.Camera} camera - The camera to control.
 * @param {THREE.WebGLRenderer} renderer - The renderer to attach the controls to.
 * @param {Object} [options={}] - Custom options for the orbit controls.
 * @param {boolean} [options.enableDamping=true] - Whether to enable damping.
 * @param {number} [options.dampingFactor=0.25] - The damping factor for smoothness.
 * @param {boolean} [options.screenSpacePanning=false] - Whether to allow panning in screen space.
 * @returns {OrbitControls} The created orbit controls.
 */
function createOrbitControls(camera, renderer, options = {}) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = options.enableDamping ?? true;
  controls.dampingFactor = options.dampingFactor ?? 0.25;
  controls.screenSpacePanning = options.screenSpacePanning ?? false;
  return controls;
}

/**
 * Creates camera controls with toggle, reset, and orbit functionality.
 * This handles both perspective and orthographic cameras with independent controls for each.
 *
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer used for rendering the scene.
 * @param {THREE.PerspectiveCamera} [perspectiveCamera] - The perspective camera, if already created.
 * @param {THREE.OrthographicCamera} [orthographicCamera] - The orthographic camera, if already created.
 * @param {OrbitControls} [perspectiveOrbitControl] - The orbit control for the perspective camera.
 * @param {OrbitControls} [orthographicOrbitControl] - The orbit control for the orthographic camera.
 * @returns {HTMLElement} The camera control container with buttons.
 */
export function createCameraControl(
  renderer,
  perspectiveCamera,
  orthographicCamera,
  perspectiveOrbitControl,
  orthographicOrbitControl,
  isPerspective = false,
  isOrbiting = false
) {
  let orbitSpeed = 0.002; // Speed of the orbiting camera
  let orbitAngle = 0; // Angle for orbit rotation
  let orbitRadius = 25; // Radius of the orbit

  // Default camera positions
  let orbitCameraDefaultPosition = new THREE.Vector3(-5, 11, -21);
  let perspectiveCameraDefaultPosition = new THREE.Vector3(-5, 11, -21);
  const orthographicCameraDefaultPosition = new THREE.Vector3(0, 100, 0);

  // If perspectiveCamera is not passed, create a new one
  if (!perspectiveCamera) {
    perspectiveCamera = createPerspectiveCamera(
      perspectiveCameraDefaultPosition
    );
  }

  // If orthographicCamera is not passed, create a new one
  if (!orthographicCamera) {
    orthographicCamera = createOrthographicCamera(
      orthographicCameraDefaultPosition
    );
  }

  // Create separate controls for each camera
  if (!perspectiveOrbitControl) {
    perspectiveOrbitControl = createOrbitControls(perspectiveCamera, renderer, {
      enableDamping: true,
      dampingFactor: 0.1,
    });
  }

  //if orthographicOrbitControl is not passed, create a new one
  if (!orthographicOrbitControl) {
    // the orthographic contral is constrained to the xz plane
    orthographicOrbitControl = createOrbitControls(
      orthographicCamera,
      renderer,
      {
        enableDamping: false,
        screenSpacePanning: false,
      }
    );
    orthographicOrbitControl.enableRotate = false;
  }

  // Create a container for the camera control buttons
  const cameraControlContainer = document.createElement("div");
  cameraControlContainer.style.position = "absolute";
  cameraControlContainer.style.bottom = "10px";
  cameraControlContainer.style.left = "10px";
  cameraControlContainer.style.display = "flex";
  cameraControlContainer.style.width = "200px";
  cameraControlContainer.style.flexDirection = "column";
  cameraControlContainer.style.padding = "10px";
  cameraControlContainer.style.borderRadius = "5px";
  cameraControlContainer.style.gap = "10px";
  cameraControlContainer.style.zIndex = "101"; // Ensure it's on top of other elements
  cameraControlContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  document.body.appendChild(cameraControlContainer);

  // Attach camera-related states to the container to manage the camera state
  cameraControlContainer.isPerspective = true;
  cameraControlContainer.perspectiveCamera = perspectiveCamera;
  cameraControlContainer.orthographicCamera = orthographicCamera;
  cameraControlContainer.camera = perspectiveCamera; // Start with perspective camera
  cameraControlContainer.perspectiveOrbitControl = perspectiveOrbitControl;
  cameraControlContainer.orthographicOrbitControl = orthographicOrbitControl;
  cameraControlContainer.currentOrbitControl = perspectiveOrbitControl; // Start with perspective controls

  // Internal orbit state management
  cameraControlContainer.isOrbiting = isOrbiting;
  cameraControlContainer.isPerspective = isPerspective;

  cameraControlContainer.updateOrbit = function () {
    if (this.isOrbiting) {
      orbitAngle += orbitSpeed; // Update the orbit angle

      const camera = this.camera;
      camera.position.x = orbitRadius * Math.cos(orbitAngle);
      camera.position.z = orbitRadius * Math.sin(orbitAngle);
      camera.lookAt(0, 0, 0); // Ensure the camera looks at the center
    }
  };

  // Create a button to toggle the camera view
  const toggleCameraButton = document.createElement("button");
  toggleCameraButton.textContent = "Toggle Camera";
  toggleCameraButton.style.padding = "4px 8px";
  toggleCameraButton.style.backgroundColor = "#0075ff";
  toggleCameraButton.style.color = "white";
  toggleCameraButton.style.border = "none";
  toggleCameraButton.style.borderRadius = "5px";
  toggleCameraButton.style.cursor = "pointer";
  toggleCameraButton.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)";

  cameraControlContainer.appendChild(toggleCameraButton);

  // Mouseover effect for Toggle Camera button
  toggleCameraButton.addEventListener("mouseenter", () => {
    toggleCameraButton.style.backgroundColor = "#005bb5"; // Darker blue on hover
  });
  toggleCameraButton.addEventListener("mouseleave", () => {
    toggleCameraButton.style.backgroundColor = "#0075ff"; // Revert to original color
  });

  // Toggle between perspective and orthographic cameras
  toggleCameraButton.addEventListener("click", () => {
    cameraControlContainer.isPerspective =
      !cameraControlContainer.isPerspective;
    updateCameraType();
  });

  // Create a button to reset the camera view
  const resetCameraButton = document.createElement("button");
  resetCameraButton.textContent = "Reset Camera";
  resetCameraButton.style.padding = "4px 8px";
  resetCameraButton.style.backgroundColor = "#e90101";
  resetCameraButton.style.color = "white";
  resetCameraButton.style.border = "none";
  resetCameraButton.style.borderRadius = "5px";
  resetCameraButton.style.cursor = "pointer";
  resetCameraButton.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)";

  cameraControlContainer.appendChild(resetCameraButton);

  // Mouseover effect for Reset Camera button
  resetCameraButton.addEventListener("mouseenter", () => {
    resetCameraButton.style.backgroundColor = "#b50000"; // Darker red on hover
  });
  resetCameraButton.addEventListener("mouseleave", () => {
    resetCameraButton.style.backgroundColor = "#e90101"; // Revert to original color
  });

  resetCameraButton.addEventListener("click", () => {
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

    cameraControlContainer.currentOrbitControl.target.set(0, 0, 0);
    cameraControlContainer.currentOrbitControl.update();
  });

  // Create a button for Orbit Mode (orbit around the center)
  const orbitModeButton = document.createElement("button");
  orbitModeButton.textContent = "Orbit Mode: Off";
  orbitModeButton.style.padding = "4px 8px";
  orbitModeButton.style.backgroundColor = "#01c700";
  orbitModeButton.style.color = "white";
  orbitModeButton.style.border = "none";
  orbitModeButton.style.borderRadius = "5px";
  orbitModeButton.style.cursor = "pointer";
  orbitModeButton.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)";

  // Add the orbit mode button to the container
  cameraControlContainer.appendChild(orbitModeButton);

  // Attach the orbit mode button to the container for managing the orbit state
  cameraControlContainer.orbitModeButton = orbitModeButton;

  // Mouseover effect for Orbit Mode button
  orbitModeButton.addEventListener("mouseenter", () => {
    if (orbitModeButton.disabled) return; // Disable hover effect when button is disabled
    orbitModeButton.style.backgroundColor = "#00a700"; // Darker green on hover
  });
  orbitModeButton.addEventListener("mouseleave", () => {
    if (orbitModeButton.disabled) return; // Disable hover effect when button is disabled
    orbitModeButton.style.backgroundColor = "#01c700"; // Revert to original color
  });

  // Toggle Orbit Mode
  orbitModeButton.addEventListener("click", () => {
    cameraControlContainer.isOrbiting = !cameraControlContainer.isOrbiting;
    if (cameraControlContainer.isOrbiting) {
      orbitModeButton.textContent = "Orbit Mode: On";
      //calculate initial orbit angle from current camera position and target
      const initialOrbitAngle = Math.atan2(
        cameraControlContainer.camera.position.z,
        cameraControlContainer.camera.position.x
      );
      orbitAngle = initialOrbitAngle;

      //get the radius from the camera position z and x to the target, assuming target is 0,0,0
      orbitRadius = Math.sqrt(
        cameraControlContainer.camera.position.z *
          cameraControlContainer.camera.position.z +
          cameraControlContainer.camera.position.x *
            cameraControlContainer.camera.position.x
      );

      cameraControlContainer.currentOrbitControl.enabled = false; // Disable OrbitControls when orbiting
    } else {
      orbitModeButton.textContent = "Orbit Mode: Off";
      cameraControlContainer.currentOrbitControl.enabled = true; // Re-enable OrbitControls
    }
  });

  // Handle window resizing
  window.addEventListener("resize", () => {
    const aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateActiveCamera();
  });

  /**
   * Updates the active camera's projection matrix based on the window aspect ratio.
   */
  function updateActiveCamera() {
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

  /**
   * Updates the camera type and controls based on the current state.
   * This function is called when the camera type is toggled.
   * It switches between perspective and orthographic cameras and their controls.
   * It also enables or disables orbit mode based on the camera type.
   * It updates the active camera and controls accordingly.
   * @returns {void}
   */
  function updateCameraType() {
    if (cameraControlContainer.isPerspective) {
      // Switch to perspective camera
      cameraControlContainer.camera = cameraControlContainer.perspectiveCamera;
      // Enable perspective orbit control when switching to perspective camera
      cameraControlContainer.currentOrbitControl =
        cameraControlContainer.perspectiveOrbitControl;
      cameraControlContainer.currentOrbitControl.enabled =
        !cameraControlContainer.isOrbiting;
      // Disable orthographic orbit control when switching to perspective camera
      cameraControlContainer.orthographicOrbitControl.enabled = false;
      // Enable orbit mode button only for perspective camera
      cameraControlContainer.orbitModeButton.disabled = false;
      orbitModeButton.style.backgroundColor = "#01c700";
    } else {
      // Switch to orthographic camera
      cameraControlContainer.camera = cameraControlContainer.orthographicCamera;
      // Enable orthographic orbit control when switching to orthographic camera
      cameraControlContainer.currentOrbitControl =
        cameraControlContainer.orthographicOrbitControl;
      // Disable orbit mode when switching to orthographic camera
      cameraControlContainer.currentOrbitControl.enabled =
        !cameraControlContainer.isOrbiting;
      // Disable perspective orbit control when switching to orthographic camera
      cameraControlContainer.perspectiveOrbitControl.enabled = false;
      // Disable orbit mode button for orthographic camera
      cameraControlContainer.orbitModeButton.disabled = true;
      orbitModeButton.style.backgroundColor = "#DDDDDD";
    }
    updateActiveCamera();
  }

  // update the camera type and controls
  updateCameraType();

  // Return the camera control container which contains the orbit mode logic
  return cameraControlContainer;
}

// example of how to use the camera control
// const cameraControl = createCameraControl(renderer);

// function renderMainCamera() {
//   // Render the main scene from the main camera's perspective
//   //renderer.setViewport(0, 0, window.innerWidth, window.innerHeight); --- is this optional?
//   renderer.clear(); // Clear the previous frame

//   // Update orbit mode if active

//   cameraControl.updateOrbit();

//   // Update the controls and render the scene
//   if (!cameraControl.isOrbiting) {
//     cameraControl.currentOrbitControl.update(); // Only update controls if not in orbit mode
//   }

//   renderer.render(scene, cameraControl.camera);
// }
