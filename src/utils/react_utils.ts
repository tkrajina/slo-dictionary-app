import { InteractionManager } from "react-native";

export function callAfterInteraction(f: Function, description?: string) {
  InteractionManager.runAfterInteractions(async () => {
    const started = Date.now();
    try {
      await f();
    } catch (e) {
      console.error(e);
    } finally {
      if (description) {
        console.debug('executed "', description, '" in', Date.now() - started);
      }
    }
  });
}
