# TODOs for Colloquy of Mobiles Virtual Simulation

This TODO list outlines tasks that need to be completed across the various parts of the Colloquy of Mobiles Virtual Simulation project. Please update this list as tasks are completed or as new tasks are identified.

## General

- [ ] Review and update the `README.md` files in all major directories.
- [ ] Standardize naming conventions across all demo and application directories.
- [ ] Ensure that all `package.json` files have up-to-date dependencies.

## `lib/` Directory

- [ ] Add documentation for all classes in `lib/`.
- [ ] Write unit tests for all classes in `lib/`.
- [ ] Refactor all classes in `lib/` to improve modularity and reusability.
- [ ] Migrate any hard-coded values to configuration files where applicable.

## `apps/demo-config-editor/`

- [ ] Transfer OpenProcessing sketch

## `apps/main/`

- [ ] Transfer OpenProcessing sketch

## `docs/` Directory

- [ ] Add a new section on configuration file management to the documentation.
- [ ] Update diagrams to reflect recent changes in the project’s architecture.
- [ ] Review and expand the user manual to cover new features.
- [ ] Create a troubleshooting guide for common issues during setup.
- [ ] Document the process for contributing to the project, including coding standards and best practices.

## Configuration and Deployment

- [ ] Verify that all configuration files are correctly set up for different environments (development, production).
- [ ] Update the `Procfile` in each app to reflect the current start commands.
- [ ] Ensure that all environment variables are properly documented and set in `.env` files or via the Heroku dashboard.
- [ ] Add deployment instructions for Heroku, including any required environment variables.

## Testing and Quality Assurance

- [ ] Set up continuous integration (CI) to automatically run tests on all pull requests.
- [ ] Review and improve test coverage across all modules.
- [ ] Create a test plan for manual testing of the main application.
- [ ] Implement code linting and formatting checks as part of the CI pipeline.

---

**Contributing to the TODO List**

- Feel free to add new tasks to this TODO list as you identify them.
- When completing a task, please mark it as done by replacing `[ ]` with `[x]`.
- For larger tasks, consider breaking them down into smaller sub-tasks.
- Keep this list up-to-date to help maintain project clarity and direction.
