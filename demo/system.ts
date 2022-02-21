import { System } from "../source/system";

export enum Actions {
  // The action of requesting the health of the system
  HEALTHCHECK = "HEALTHCHECK",
}

export default new System<Actions>();
