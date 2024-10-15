// List of demo paths and names
const demos = [
  {
    name: "Demo 01: Sensor + Actuator THREE",
    path: "/demo-01-sensor-actuator",
  },
  { name: "Demo 01: Actuator THREE", path: "/demo-01-actuator-THREE" },
  { name: "Demo 02: Oscillator", path: "/demo-02-oscillator" },
  { name: "Demo 02.1: Oscillator THREE", path: "/demo-02-oscillator-THREE" },
  { name: "Demo 03: Transform THREE", path: "/demo-03-transform-THREE" },
  { name: "Demo 04: Drives", path: "/demo-04-drives" },
  { name: "Demo 05: Transceivers", path: "/demo-05-transceiversV2" },
  { name: "Demo 06: Assets", path: "/demo-06-assets-test" },
  { name: "Demo 08: Sensor THREE", path: "/demo-08-sensor-THREE" },
  // Add additional anticipated demos here
];

/**
 * Initializes the UI by creating the sidebar and content area.
 */
function initializeUI() {
  // Create the main container
  const container = document.createElement("div");
  container.classList.add("container");

  // Create the sidebar
  const sidebar = document.createElement("div");
  sidebar.id = "sidebar";

  // Create the sidebar header
  const header = document.createElement("h2");
  header.textContent = "Demonstration Apps";
  sidebar.appendChild(header);

  // Create the demo list
  const demoList = document.createElement("ul");
  demoList.id = "demo-list";
  sidebar.appendChild(demoList);

  // Add the sidebar to the container
  container.appendChild(sidebar);

  // Create the main content area
  const mainContent = document.createElement("div");
  mainContent.id = "main-content";

  // Create the iframe to display demos
  const iframe = document.createElement("iframe");
  iframe.id = "demo-frame";
  iframe.title = "Demo Frame";
  mainContent.appendChild(iframe);

  // Add the main content area to the container
  container.appendChild(mainContent);

  // Append the container to the body
  document.body.appendChild(container);

  // Create the sidebar menu dynamically
  createSidebarMenu();

  // Optionally, load a default demo on page load
  loadDemo("/demo-01-sensor-actuator");
}

/**
 * Dynamically creates the sidebar menu with demo links.
 */
function createSidebarMenu() {
  // build buttons for each demo
  const demoList = document.getElementById("demo-list");
  demos.forEach((demo) => {
    const listItem = document.createElement("li");
    listItem.classList.add("demo-item"); // Add a class for easier styling

    const link = document.createElement("a");
    link.href = "#"; //
    link.textContent = demo.name;

    // Event listener for click to load demo and set it as active
    link.onclick = () => {
      setActiveDemo(listItem); // Pass the list item for styling
      loadDemo(demo.path);
    };

    listItem.appendChild(link);
    demoList.appendChild(listItem);
  });
}

/**
 * Sets the clicked demo as the active one by changing its background color.
 * @param {HTMLElement} activeItem - The clicked list item element to be set as active.
 */
function setActiveDemo(activeItem) {
  // Get all list items and remove the active class
  const listItems = document.querySelectorAll("#demo-list li");
  listItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Set the active list item
  activeItem.classList.add("active");
}

/**
 * Loads the selected demo in the iframe.
 * @param {string} demoPath - The path of the demo to load.
 */
function loadDemo(demoPath) {
  document.getElementById("demo-frame").src = demoPath;
}

// Initialize the UI when the page loads
document.addEventListener("DOMContentLoaded", initializeUI);
