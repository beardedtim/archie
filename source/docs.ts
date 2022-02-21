import type { System } from "./system";

class Doc {
  #system: System;

  constructor(system: System) {
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
