import { useIsomorphicLayoutEffect } from "@lostdock/utils";

export default function Docs() {
  useIsomorphicLayoutEffect(() => {
    console.log("LostDock docs page");
  }, []);
  return (
    <div>
      <h1>LostDock Documentation</h1>
      <button>Click me</button>
    </div>
  );
}
