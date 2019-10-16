import { useEffect } from "react";

// Hook
export default function useOnClickOutside(
  ref: React.MutableRefObject<any>,
  handler: (event: Event) => void
) {
  useEffect(() => {
    const listener: EventListener = (evt: Event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref || !ref.current || ref.current.contains(evt.target)) {
        return;
      }

      handler(evt);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // ... passing it into this hook. // ... but to optimize you can wrap handler in useCallback before ... // ... callback/cleanup to run every render. It's not a big deal ... // ... function on every render that will cause this effect ... // It's worth noting that because passed in handler is a new ... // Add ref and handler to effect dependencies
}
