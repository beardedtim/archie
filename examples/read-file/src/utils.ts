export const always = (v: any) => () => v;
export const alwaysValidate = () => always(Promise.resolve(true));
