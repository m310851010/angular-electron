import { NzSafeAny } from 'ng-zorro-antd/core/types';
const hasOwn = Object.prototype.hasOwnProperty;
const defineProperty = Object.defineProperty;
const gOPD = Object.getOwnPropertyDescriptor;

/**
 * 深度clone
 * @param target
 */
export function clone<T = NzSafeAny>(target: T): T {
  const _target = Array.isArray(target) ? [] : {};
  return extend(_target as T, target);
}

function getProperty<T = NzSafeAny>(obj: T, name: string) {
  if (name === '__proto__') {
    if (!hasOwn.call(obj, name)) {
      return void 0;
    } else if (gOPD) {
      // @ts-ignore
      return gOPD(obj, name).value;
    }
  }
  // @ts-ignore
  return obj[name];
}

function setProperty<T = NzSafeAny>(target: T, options: { name: string; newValue: NzSafeAny }) {
  if (defineProperty && options.name === '__proto__') {
    defineProperty(target, options.name, {
      enumerable: true,
      configurable: true,
      value: options.newValue,
      writable: true
    });
  } else {
    // @ts-ignore
    target[options.name] = options.newValue;
  }
}

/**
 * 继承
 * @param target
 * @param args
 */
export function extend<T = NzSafeAny>(target: T, ...args: NzSafeAny[]): T {
  let copyIsArray, clone;

  for (const options of args) {
    if (options == null) {
      continue;
    }

    for (const name in options) {
      const src = getProperty(target, name);
      const copy = getProperty(options, name);
      if (target === copy || copy === undefined) {
        continue;
      }

      // tslint:disable-next-line:no-conditional-assignment
      if (isPlainObject(copy) || (copyIsArray = Array.isArray(copy))) {
        if (copyIsArray) {
          copyIsArray = false;
          clone = src && Array.isArray(src) ? src : [];
        } else {
          clone = src && isPlainObject(src) ? src : {};
        }

        setProperty(target, { name, newValue: extend(clone, copy) });
      } else {
        setProperty(target, { name, newValue: copy });
      }
    }
  }

  return target;
}

export const assign = extend;

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
 * formatDate(new Date(), 'yyyy-MM-dd 星期E HH:mm:ss') ==> 2009-03-10 星期二 20:09:04
 * formatDate(new Date(), 'yyyy-MM-dd 星期e hh:mm:ss') ==> 2009-03-10 星期2 08:09:04
 * formatDate(new Date(), 'yyyy-MM-dd 第w周 hh:mm:ss') ==> 2009-03-10 第2周 08:09:04
 * formatDate(new Date(), 'yyyy-M-d h:m:s.S') ==> 2006-7-2 8:9:4.18
 */
function formatDate(srcDate: Date, fmt: string) {
  if (!srcDate) {
    return '';
  }
  const week = {
    0: '\u65e5',
    1: '\u4e00',
    2: '\u4e8c',
    3: '\u4e09',
    4: '\u56db',
    5: '\u4e94',
    6: '\u516d'
  };

  const o = {
    'M+': srcDate.getMonth() + 1,
    'd+': srcDate.getDate(),
    'h+': srcDate.getHours() % 12 === 0 ? 12 : srcDate.getHours() % 12,
    'H+': srcDate.getHours(),
    'm+': srcDate.getMinutes(),
    's+': srcDate.getSeconds(),
    'q+': Math.floor((srcDate.getMonth() + 3) / 3),
    'S+': srcDate.getMilliseconds(),
    'e+': srcDate.getDay(),
    // @ts-ignore
    E: week[srcDate.getDay()],
    'w+': (date => {
      const date2 = new Date(date.getFullYear(), 0, 1);
      const day = (date2.getDay() ? date2.getDay() : 7) - (date.getDay() ? date.getDay() : 7);
      return Math.ceil(Math.round((date.getTime() - date2.getTime() + day * (24 * 3600000)) / 86400000) / 7) + 1;
    })(srcDate)
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (srcDate.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      // @ts-ignore
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return fmt;
}

const class2type = {};
'Boolean Number String Function Array Date RegExp Object Error'
  .split(' ')
  .forEach((name, i) => (class2type['[object ' + name + ']'] = name.toLowerCase()));

export function type(obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
}

export function isFunction(value) {
  return type(value) == 'function';
}
export function isWindow(obj) {
  return obj != null && obj == obj.window;
}
export function isDocument(obj) {
  return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
}
export function isObject(obj) {
  return type(obj) == 'object';
}
export function isPlainObject(obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

