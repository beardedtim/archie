import type { System } from "./system";

class Doc<Actions> {
  #system: System<Actions>;

  constructor(system: System<Actions>) {
    this.#system = system;
  }

  async *generate() {
    // go through each ACTION and GENERATE
    // Interface Docs
    // Example Docs
    // Dependency Docs
    // yield pages
  }
}
