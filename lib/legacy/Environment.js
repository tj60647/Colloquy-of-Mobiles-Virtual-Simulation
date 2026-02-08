export class Environment {
  constructor() {
    this.agents = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  update() {
    this.agents.forEach((agent) => agent.update());
  }
}
