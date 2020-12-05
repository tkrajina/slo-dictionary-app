export function bindAllPrefixedMethods(that: any, prefix: string = "callback") {
  if (__DEV__) {
    const key = "__bound__" + prefix;
    if (that[key]) {
      console.error("bindAllPrefixedMethods called twice!");
      return;
    }
    that[key] = true;
  }
  for (const name of Object.getOwnPropertyNames(Reflect.getPrototypeOf(that))) {
    if (name.indexOf(prefix) === 0) {
      that[name] = that[name].bind(that);
    }
  }
}

export function size(a: any) {
  if (!a) {
    return 0;
  }
  if ("string" == typeof a) {
    return a.length;
  } else if ("object" == typeof a) {
    if ("length" in a) {
      return a.length;
    } else {
      return Object.keys(a).length;
    }
  }
  return 0;
}

export function isNotEmpty(a: any) {
  return !isEmpty(a);
}

export function isEmpty(a: any) {
  if (!a) {
    return true;
  }
  if ("object" == typeof a) {
    for (const _ in a) {
      return false;
    }
    return true;
  }
  return !a;
}

export function randomInt(from: number, to: number) {
  from = Math.min(from, to);
  to = Math.max(from, to);
  return Math.floor(Math.random() * (to - from)) + from;
}
