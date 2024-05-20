export const Nothing = Symbol('Nothing');

declare global {
  type Result<T> = T | Error;
  type Maybe<T> = T | typeof Nothing;
}
