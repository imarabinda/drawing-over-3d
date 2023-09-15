import { ForwardedRef } from "react";

export const mergeRefs =
  <T>(...refs: (ForwardedRef<any> | undefined)[]) =>
  (instance: T) => {
    refs?.forEach((ref) => {
      if (ref) {
        if (typeof ref === "function") {
          ref?.(instance);
        } else {
          ref.current = instance;
        }
      }
    });
  };
