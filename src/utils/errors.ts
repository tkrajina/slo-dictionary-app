export function initGlobalErrorHandler(sendErrFunc: (msg: string) => void) {
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler(async (e: any, isFatal?: boolean) => {
    const msg = `uncaught ${isFatal ? "fatal" : "nonfatal"} error: ${e}`;
    console.error(msg);
    sendErrFunc(msg);
    defaultErrorHandler(e, isFatal);
  });
}
