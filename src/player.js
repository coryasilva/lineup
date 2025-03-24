/**
 * @typedef {typeof PlayerPosition[keyof typeof PlayerPosition]} PlayerPosition
 * @readonly
 */
export const PlayerPosition = Object.freeze({
  GOALIE: "G",
  FIELDER: "F",
});

/**
 * @typedef {Object} TPlayer
 * @property {string} id
 * @property {string} name
 * @property {string} number
 * @property {number} [skill]
 * @property {boolean} [active]
 * @property {PlayerPosition | string} [position]
 */

export class Player {
  /**
   * @param {TPlayer} [player]
   */
  constructor(player) {
    this.id = player.id;
    this.name = player?.name ?? "";
    this.number = player?.number ?? "";
    this.skill = Number.isInteger(player?.skill) ? player.skill : 50;
    if (this.skill < 0) this.skill = 0;
    if (this.skill > 100) this.skill = 100;
    this.active = !!player?.active;
    this.position = Object.values(PlayerPosition)
      .map((p) => p.toString())
      .includes(player?.position?.toUpperCase())
      ? player.position.toUpperCase()
      : PlayerPosition.FIELDER;
  }

  /**
   * Determines whether or not the player is a goalie
   * @return boolean
   */
  isGoalie() {
    return this.position === "G";
  }

  toString(delim = ",") {
    return [
      this.id ?? "",
      this.name ?? "",
      this.number ?? "",
      this.skill ?? "",
      this.position ?? "",
      this.active ? "1" : "0",
    ].join(delim);
  }

  static fromString(str, delim = ",") {
    const [id, name, number, skill, position, active] = str.split(delim);
    return new Player({
      id,
      name,
      number,
      skill: Number.parseInt(skill, 10),
      position,
      active: active === "1",
    });
  }
}
