export interface Context {
  set(key: string, value: any): void;
  get(key: string): any;
}

export interface Action {
  type: string;
  payload: any;
  id: string;
  meta: {
    received_at: string;
    [x: string]: any;
  };
}

export type ActionHandler = (ctx: Context, action: Action) => Promise<unknown>;
