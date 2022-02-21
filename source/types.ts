export interface Context {
  set(key: string, value: any): void;
  get(key: string): any;
}

export interface Action<T = any> {
  type: string;
  payload: T;
  id: string;
  meta: {
    received_at: string;
    [x: string]: any;
  };
}

export type ActionHandler = <T = any>(
  ctx: Context,
  action: Action<T>
) => Promise<unknown>;
