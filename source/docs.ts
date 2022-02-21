import type { System } from "./system";

interface ActionData {
  name: string;
}

interface SystemDocData {
  name: string;
  usesPatterns: boolean;
  actions: ActionData[];
}

const SystemDoc = (config: SystemDocData) => `
# System: ${config.name}

- Uses Patterns:  ${config.usesPatterns ? "Yes" : "No"}


## Actions
${config.actions
  .map(
    (action) => `
- Action ${action.name}
`
  )
  .join("\n")}
`;

export class Doc {
  #system: System;

  constructor(system: System) {
    this.#system = system;
  }

  generate() {
    return SystemDoc(this.#system.info());
  }
}
