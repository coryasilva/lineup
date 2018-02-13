/**
 * Creates a collection of players from an array of POJOs
 * @param {Array} arr
 * @return {Player[]}
 */
export function createCollection(arr) {
  return arr.map(player => create(player))
}

/**
 * Creates a new Player from an object or and Array
 * @param {object|Array} obj
 * @return {Player}
 */
export function create(obj) {
  if (Array.isArray(obj)) {
    obj.length = 5;
    return new Player(obj[0], obj[1], obj[2], obj[3], obj[4])
  }
  return new Player().populate(obj)
}

/**
 * Class representing a Player
 */
export class Player {
  /**
   * Creates a player
   * @param {string} name
   * @param {string} number
   * @param {number} skill
   * @param {boolean} [active]
   * @param {string} [position]
   */
  constructor(name, number, skill, active, position) {
    this.name = name
    this.number = number
    this.skill = parseInt(skill)
    this.active = active == false || active == 'false' ? false : true
    this.position = position || undefined
    this.clearLines()
    return this
  }

  /**
   * Determines whether or not the player is a goalie
   * @return boolean
   */
  isGoalie() {
    return this.position === "Goalie"
  }

  /**
   * Clears the lines
   * @return Array
   */
  clearLines() {
    this.lines = Array(9).fill(false)
    return this.lines;
  }

  /**
   * Populate the class form a POJO
   * @param {object} obj
   */
  populate(obj) {
    this.name = obj.name
    this.number = obj.number
    this.skill = parseInt(obj.skill)
    this.active = obj.active == false || obj.active == 'false' ? false : true
    this.position = obj.position || undefined
    this.clearLines()
    return this
  }

  /**
   * Builds a URL safe, pipe delimited list of class values
   * @return string
   */
  toUrlParam() {
    return encodeURIComponent(`${this.name || ''}~${this.number || ''}~${this.skill || 0}~${this.active || false}~${this.position || ''}`
    )
  }
}
