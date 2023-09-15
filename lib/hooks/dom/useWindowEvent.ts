import { useCallback, useEffect } from "react";
import useLatestRef from "../useLatestRef";
type WindowEvents = keyof WindowEventMap;
type EventsType = WindowEvents | WindowEvents[];

const useWindowEvent = (
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
    let events: WindowEvents[] = [];
    if (!Array.isArray(eventName)) {
      events = [eventName];
    } else {
      events = eventName;
    }

    events.forEach((event) => {
      window.addEventListener(event, handleEvent, true);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent, true);
      });
    };
  }, [JSON.stringify(eventName)]);
};

export default useWindowEvent;
