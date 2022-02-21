import { System } from "@beardedtim/archie";

export enum Actions {
  // The action of requesting the health of the system
  HEALTHCHECK = "HEALTHCHECK",
}

export default new System({
  /**
   * If we want to use Express-like Path Patterns for our
   * Action Handler Trigger
   */
  usePattern: true,
});
