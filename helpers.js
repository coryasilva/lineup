/** Generates a timestamp id (radix 36) */
export const xid = () => new Date().getTime().toString(36);

/**
 * Gets the index of lowest value in an array of numbers
 * @param {number[]} arr
 */
export const minimumIndex = (arr) => arr.reduce((iMin, val, i, arr) => (val < arr[iMin] ? i : iMin), 0);

/**
 * Creates an array with values equal to their index
 * @param {number} length
 */
export const generateArray = (length) => Array.from(Array(length).keys());

/**
 * Sums an array of numbers
 * @param {number[]} args
 */
export const sum = (...args) => args.reduce((sum, value) => sum + value, 0);

/**
 * Averages an array of numbers
 * @param {number[]} args
 */
export const average = (...args) => (args.length === 0 ? 0 : sum(...args) / args.length);

/**
 * Calculates variance for an array of numbers
 * @param {...number} args
 */
export const variance = (...args) => {
  const avg = average(...args)
  return average(...args.map((value) => (value - avg) ** 2));
}

/**
 * Calculated standard deviation for an array of numbers
 * @param {...number} args
 */
export const standardDeviation = (...args) => Math.sqrt(variance(...args));

/**
 * Wraps a positive out of range index
 * @param {number} index
 * @param {number} length
 */
export const wrapIndex = (index, length) => ((index % length) + length) % length;

/**
 * Easier HTML tag creation
 * @example
 * t("div", {class: "a b c", "data-blah": true, role: "listitem"}, [
 *   t("span", "favorite", question1 && "color"),
 *   t("span", { class: [
 *     "base classes go here",
 *     answer1 && "blue",
 *     answer2 && "pink",
 *   ]}),
 * ])
 * @param {string} tag
 * @param  {...(string | number | Array<string | HTMLElement> | Record<string, string | boolean | number | Array<string | boolean | undefined | null>>)} args
 * @returns {HTMLElement}
 */
export function t(tag, ...args) {
  const el = document.createElement(tag);
  for (const arg of args) {
    if (typeof arg === "string") {
      el.append(arg);
    }
    if (typeof arg === "number") {
      el.append(arg.toString());
    }
    if (Array.isArray(arg)) {
      const frag = document.createDocumentFragment();
      frag.append(...arg);
      el.append(frag);
    }
    if (typeof arg === "object" && arg !== null && !Array.isArray(arg)) {
      const keys = Object.keys(arg);
      for (const key of keys) {
        if (key === "class") {
          const spaceRegex = /\s+/;
          const list = Array.isArray(arg.class) ? arg.class : arg.class?.toString().split(spaceRegex);
          for (const c of list) {
            if (c === false || c === undefined || c === null) continue;
            const cArr = c?.toString()?.trim().split(spaceRegex) ?? [];
            if (c !== "") el.classList.add(...cArr);
          }
        } else {
          el.setAttribute(key, arg[key]?.toString() ?? "");
        }
      }
    }
  }
  return el;
}

export const $ = document.querySelector.bind(document);

export const $$ = document.querySelectorAll.bind(document);
