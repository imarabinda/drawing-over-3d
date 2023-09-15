//Do not include any import or export
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type EnumToPipes<T, K> = `${Extract<T, K>}` extends `${infer N extends K}`
  ? N
  : never;

type ValueOf<T> = T[keyof T];

type AllValuesOf<T> = T extends unknown ? T[keyof T] : never;

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

type SetTimeoutReturnType = ReturnType<typeof setTimeout>;

type Undefinable<T> = undefined | T;
type Nullable<T> = null | T;
