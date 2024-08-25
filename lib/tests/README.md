# Tests Directory

This directory contains all the unit tests, integration tests, and other test-related files for the Colloquy of Mobiles Virtual Simulation project. The goal of these tests is to ensure the reliability, accuracy, and stability of the codebase.

## Directory Structure

- **`unit/`**: Contains unit tests that target individual functions or classes. Each test should focus on a small piece of functionality and verify that it works as expected in isolation.
- **`integration/`**: Contains integration tests that verify the interactions between different parts of the system. These tests ensure that various modules or components work together correctly.
- **`mock_data/`**: Contains any mock data or fixtures used during testing. Mock data helps simulate different scenarios and edge cases without needing to rely on external resources.

## Running Tests

To run the tests, navigate to the root directory of the project and use the following command:

```bash
npm test
```
