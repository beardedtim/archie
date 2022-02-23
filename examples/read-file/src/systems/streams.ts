import { System as BaseSystem } from "@beardedtim/archie";
import { ReadStream } from "fs";

export const System = new BaseSystem({
  name: "Streams",
  usePattern: false,
  useManualActionValidation: false,
});

export enum Actions {
  READ_AS_STRING = "READ_AS_STRING",
}

System.when(Actions.READ_AS_STRING)
  .validate(async (ctx, action) => action.payload.stream)
  .do(async (ctx, action) => {
    const result = await new Promise((res) => {
      const stream: ReadStream = action.payload.stream;

      let data = "";

      stream.on("data", (chunk) => {
        data += chunk.toString();
      });
      stream.on("end", () => {
        res(data);
      });
    });

    ctx.set("body", result);
  });
