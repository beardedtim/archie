export interface Context {
  set(key: string, value: any): void;
  get(key: string): any;
}

export enum Actions {
  // The action of requesting the health of the system
  HEALTHCHECK = "HEALTHCHECK",
}

export interface Action<T = any> {
  type: Actions;
  payload: T;
}

export type ActionHandler = <T = any>(
  ctx: Context,
  action: Action<T>
) => Promise<unknown>;
