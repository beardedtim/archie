import jsonschema from "jsonschema";
import { ActionHandler } from "./types";

export const validateByJSONScema =
  (schema: jsonschema.Schema): ActionHandler =>
  async (ctx, action) => {
    await jsonschema.validate(action.payload, schema, {
      allowUnknownAttributes: true,
      throwAll: true,
    });

    return true;
  };
