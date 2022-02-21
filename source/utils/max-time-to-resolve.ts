import { setTimeout } from "timers/promises";

const TIMED_OUT = Symbol("Signed out");

export default <T>(value: Promise<T>, timeoutInMS = 1000 * 60) =>
  Promise.race([value, setTimeout(timeoutInMS).then(() => TIMED_OUT)]).then(
    (result) => {
      if (result === TIMED_OUT) {
        throw new Error(`Timed out waiting ${timeoutInMS}ms`);
      } else {
        return result as T;
      }
    }
  );
