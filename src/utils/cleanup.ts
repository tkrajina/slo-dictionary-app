import { Observable } from "./observable";
import * as Utils from "./utils";

interface Cancellable {
  cancel(): void;
}

interface Stoppable {
  stop(): void;
}

interface Removeable {
  remove(): void;
}

/**
 * Container of functions to be executed when the component unmount. Cleanup should be called explisictly with:
 *   componentDidMount() {
 *       this.cleanup.cleanup();
 *   }
 */
export class CleanupContainer {
  cleanups: (() => void)[] = [];

  private stateChangeCounter = 0;

  triggerObservableStateChanges(descr: string, component: React.Component) {
    for (const key in component.state) {
      const el = (component.state as any)[key];
      if (el && (el as Observable<any>).addListener) {
        this.addObservableListener(descr, el, () => {
          component.setState({
            [key]: el,
            // This solves a problem with pure component, since the observable reference don't change -- PureComponent won't reload
            // when an value change event happens. Thos forces them to update:
            __state_change_counter__: this.stateChangeCounter++,
          } as any);
        });
      }
    }
  }

  /**
   * Example:
   * ```
   * this.addRemoveable(Keyboard.addListener("keyboardDidHide", () => {}))
   * ```
   */
  addCancellable(cancellable: Cancellable | Removeable | Stoppable | (() => void)) {
    if ((cancellable as any).cancel) {
      this.addCleanup(() => (cancellable as Cancellable).cancel());
    } else if ((cancellable as any).remove) {
      this.addCleanup(() => (cancellable as Removeable).remove());
    } else if ((cancellable as any).stop) {
      this.addCleanup(() => (cancellable as Stoppable).stop());
    } else if (cancellable instanceof Function) {
      this.addCleanup(() => (cancellable as Function)());
    } else {
      console.error("Invalid cancellable", cancellable, typeof cancellable);
    }
  }

  addObservableListener(descr: string, observable: Observable<any>, listener: () => void) {
    this.addCancellable(observable.addListener(descr, listener));
  }

  setRandomTimeout(f: () => void, min: number, max: number) {
    return this.setTimeout(f, Utils.randomInt(min, max));
  }

  setTimeout(f: () => void, time: number) {
    const timeout = setTimeout(f, time);
    this.addCleanup(() => clearTimeout(timeout));
    return timeout;
  }

  setImmediate(f: () => void) {
    const im = setImmediate(f);
    this.addCleanup(() => clearImmediate(im));
    return im;
  }

  setIntervalAndStartImmediately(f: () => void, time: number) {
    this.setTimeout(f, 10);
    return this.setInterval(f, time);
  }

  setInterval(f: () => void, time: number) {
    const interval = setInterval(f, time);
    this.addCleanup(() => clearInterval(interval));
    return interval;
  }

  addCleanup(f: () => void) {
    this.cleanups.push(f);
  }

  cleanup = () => {
    this.cleanups.forEach((f) => {
      try {
        f();
      } catch (e) {
        console.error(e);
      }
    });
    this.cleanups = [];
  };
}
