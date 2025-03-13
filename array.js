/**
 * Gets the lowest value from a an array of numbers
 * @param {Array} arr
 */
export function indexOfMinValue(arr) {
  return arr.reduce((iMin, val, i, arr) => val < arr[iMin] ? i : iMin, 0)
}

/**
 * Creates an array with values equal to there index
 * @param {Array} length
 */
export function generate(length) {
  return Array.from(Array(length).keys())
}

/**
 * Sums an array of numbers
 * @param {Array} arr
 */
export function sum(arr) {
  return arr.reduce((sum, value) => sum + value, 0)
}

/**
 * Averages an array of numbers
 * @param {Array} arr
 */
export function average(arr) {
  return sum(arr) / arr.length
}

/**
 * Calculates variance for an array of numbers
 * @param {Array} arr
 */
export function variance(arr) {
  const avg = average(arr)
  const num = arr.map(value => (value - avg) ** 2)
  return average(num)
}

/**
 * Calculated standard deviation for an array of numbers
 * @param {Array} values
 */
export function standardDeviation(arr) {
  return Math.sqrt(variance(arr))
}

/**
 * Wraps a positive out of range index
 * @param {number} index
 * @param {number} length
 */
export function wrapIndex(index, length) {
  return ((index % length) + length) % length
}
