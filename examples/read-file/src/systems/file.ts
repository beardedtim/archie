import { System as BaseSystem } from "@beardedtim/archie";
import fs from "fs";

export const System = new BaseSystem({
  name: "File",
  usePattern: false,
  useManualActionValidation: false,
});

export enum Actions {
  READ = "READ",
}

System.when(Actions.READ)
  .validate(async (ctx, action) => typeof action.payload.path === "string")
  .do(async (ctx, action) => {
    ctx.set("body", fs.createReadStream(action.payload.path));
  });
