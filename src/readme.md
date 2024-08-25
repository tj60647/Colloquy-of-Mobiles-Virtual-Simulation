# Source Code

This directory contains the source code for the Colloquy of Mobiles Virtual Simulation project.

## Structure

- **main/**: Core application code that drives the simulation.
- **test/**: Contains test code to ensure the correctness and reliability of the simulation.

### main/

- **app.js**: The main entry point for the application.
- **controllers/**: Handles the logic and interactions between different parts of the simulation.
- **models/**: Contains data models that represent the entities and their behaviors.
- **views/**: Responsible for rendering the output of the simulation.
- **utils/**: Utility functions and helpers used across the application.

### test/

- **unit/**: Unit tests for individual components.
- **integration/**: Integration tests that ensure different parts of the application work together.
- **mock_data/**: Contains mock data used in testing.

### How to Run

1. **Development**: To run the simulation in development mode, execute `node src/main/app.js`.
2. **Testing**: To run tests, use the command `npm test`.

Ensure all dependencies are installed (`npm install`) before running the application or tests.
