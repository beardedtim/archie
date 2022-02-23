import { System as BaseSystem } from "@beardedtim/archie";
import * as Files from "./src/systems/file";
import * as Streams from "./src/systems/streams";

const RootSystem = new BaseSystem({
  useManualActionValidation: false,
  usePattern: false,
  name: "Read File Demo",
});

enum Actions {
  READ_FILE = "READ_FILE",
}

RootSystem.when(Actions.READ_FILE)
  .validate(async (ctx, action) => {
    return typeof action.payload.filePath === "string";
  })
  .do(async (ctx, action) => {
    const stream = await Files.System.handle(Files.Actions.READ, {
      path: action.payload.filePath,
    });

    const file = await Streams.System.handle(Streams.Actions.READ_AS_STRING, {
      stream: stream.get("body"),
    });

    ctx.set("body", file.get("body"));
  });

const main = async () => {
  const readSuccessful = await RootSystem.handle(Actions.READ_FILE, {
    filePath: `${__dirname}/test.txt`,
  });

  console.log(readSuccessful.get("body"));
};

main();
