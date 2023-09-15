import { useCallback, useEffect } from "react";
import useLatestRef from "../useLatestRef";
type DocEvents =
  | "mozfullscreenchange"
  | "MSFullscreenChange"
  | "webkitfullscreenchange"
  | keyof DocumentEventMap;
type EventsType = DocEvents | DocEvents[];
const useDocumentEvent = (
  eventName: EventsType,
  callback: (...args: any[]) => unknown
) => {
  const callbackRef = useLatestRef(callback);

  const handleEvent = useCallback(
    (event: unknown) => {
      callbackRef.current(event);
    },
    [callbackRef]
  );

  useEffect(() => {
    let events: DocEvents[] = [];
    if (!Array.isArray(eventName)) {
      events = [eventName];
    } else {
      events = eventName;
    }

    events.forEach((event) => {
      document.addEventListener(event, handleEvent, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleEvent, true);
      });
    };
  }, [JSON.stringify(eventName)]);
};

export default useDocumentEvent;
