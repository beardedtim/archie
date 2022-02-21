import Pino from "pino";

export default Pino({
  level: process.env.LOG_LEVEL || "trace",
  serializers: Pino.stdSerializers,
});
