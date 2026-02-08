export class DebugUtility {
  // All other methods remain the same
  static addToggleDebugListener() {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'd') {
        event.preventDefault(); // Prevent default action
        event.stopPropagation(); // Stop event propagation
        DebugUtility.toggleDebug();
      }
    });
  }

  static debugLog(data) {
    if (DebugUtility.DEBUG) {
      try {
        const log = {
          debugLog: DebugUtility.DEBUG,
          timestamp: new Date().toISOString(),
          ...data,
        };
        console.log(JSON.stringify(log, null, 2));
      } catch (error) {
        console.error('debugLog: Failed to log debug data:', error, 'Data:', data);
      }
    }
  }

  static toggleDebug() {
    DebugUtility.DEBUG = !DebugUtility.DEBUG;
    DebugUtility.debugLog({ debug_mode: DebugUtility.DEBUG });
    DebugUtility.showDebugModeStatus(DebugUtility.DEBUG);
  }

  static showDebugModeStatus(status) {
    let statusElement = document.getElementById('debug-status-indicator');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'debug-status-indicator';
      statusElement.style.position = 'fixed';
      statusElement.style.top = '10px';
      statusElement.style.right = '10px';
      statusElement.style.padding = '5px 10px';
      statusElement.style.fontFamily = 'Arial, sans-serif';
      statusElement.style.zIndex = 1000;
      statusElement.style.transition = 'opacity 1s'; // Set transition for fade effect
      statusElement.style.opacity = '0'; // Start with invisible
      statusElement.style.borderRadius = '5px'; // Rounded corners
      document.body.appendChild(statusElement);
    }
    statusElement.style.backgroundColor = status ? 'green' : 'red';
    statusElement.style.color = 'white';
    statusElement.innerHTML = `Debug Mode: <i><b>${status ? 'ON' : 'OFF'}</b></i>`; // Use innerHTML for bold text
    statusElement.style.display = 'block'; // Ensure the element is visible
    statusElement.style.opacity = '1'; // Fade in by setting opacity to 1
    // Use a timeout to fade out the element after 4 seconds (give 1 second to display)
    setTimeout(() => {
      statusElement.style.opacity = '0'; // Start fade-out transition
      setTimeout(() => {
        if (statusElement) {
          statusElement.style.display = 'none'; // Hide the element after fade-out
        }
      }, 1000); // Wait for 1 second (matching the transition duration) before hiding
    }, 2000); // Display for 4 seconds before starting fade-out
  }
}

DebugUtility.DEBUG = false;
