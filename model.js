import { generateArray, minimumIndex, standardDeviation, wrapIndex } from "./helpers.js";
import { Player } from "./player.js";

// TODO: Figure out how to make discriminated union with @callback
/** @typedef {'load' | 'create' | 'update' | 'delete'} ListenEventType */
/**
 * @callback Listener
 * @param {ListenEventType} eventType
 * @param {Player[] | Player | string} newValue
 */

export class Model {
  #window;
  /** @type {Map<string, Player>} */
  #players = new Map();
  /** @type {Listener[]}*/
  #listeners = [];

  constructor(windowGlobal = window) {
    this.#window = windowGlobal;
    this.#load();
    this.#window.addEventListener("hashchange", this.#load);
  }

  /**
   * Parses players from URI component, does not consider params other than `p`.
   * @param {string} uriHash
   */
  #parse(uriHash) {
    const params = new URLSearchParams(uriHash);
    return params.getAll("p").map((p) => Player.fromString(p, "~"));
  }

  /** Builds URI safe model. */
  #serialize() {
    const players = Array.from(this.#players.values());
    return new URLSearchParams(players.map((p) => ["p", p.toString("~")]));
  }

  /** Commits model to url hash. */
  #commit(push = false) {
    const hash = `#${this.#serialize()}`;
    if (push) {
      this.#window.history.pushState(null, null, hash);
    } else {
      this.#window.history.replaceState(null, null, hash);
    }
  }

  /** Loads url players into players (Map) property. */
  #load = () => {
    try {
      const players = this.#parse(this.#window.location.hash.substring(1));
      this.#players = new Map(players.map((p) => [p.id, p]));
      this.#notifyListeners("load", this.players);
      this.#commit();
    } catch (e) {
      console.error("Failed to load model", e);
    }
  };

  /** @param {Listener} listener */
  addListener(listener) {
    this.#listeners.push(listener);
  }

  /**
   * @param {ListenEventType} eventType
   * @param {Player[] | Player | string} newValue
   */
  #notifyListeners(eventType, newValue) {
    this.#listeners.forEach((listener) => listener(eventType, newValue));
  }

  get players() {
    return Array.from(this.#players.values());
  }

  get playerCount() {
    return this.#players.size;
  }

  get activeGoalies() {
    return Array.from(this.#players.values()).filter((p) => p.isGoalie() === true && p.active);
  }

  get activeFielders() {
    return Array.from(this.#players.values()).filter((p) => p.isGoalie() === false && p.active);
  }

  get activePlayers() {
    return Array.from(this.#players.values()).filter((p) => p.active);
  }

  /** @param {string} id */
  getPlayer(id) {
    return this.#players.get(id);
  }

  /** @param {Player} player */
  createPlayer(player) {
    if (this.#players.size >= 32) {
      throw new Error("Too many players in roster, maximum of 32 allowed.");
    }
    this.#players.set(player.id, player);
    this.#notifyListeners("create", player);
    this.#commit();
  }

  /** @param {Player} player */
  updatePlayer(player) {
    this.#players.set(player.id, player);
    this.#notifyListeners("update", player);
    this.#commit();
  }

  /** @param {string} id */
  deletePlayer(id) {
    this.#players.delete(id);
    this.#notifyListeners("delete", id);
    this.#commit();
  }

  /**
   * Sums the score of a line.
   * @param {Player[]} line
   */
  scoreLine(line) {
    return line.reduce((acc, { skill = 0 }) => acc + skill, 0);
  }

  /**
   * Builds an array of lines (array) with player indexes based on number of fielders
   * This accomplishes the Special Olympic rules of giving players equal opportunities to play:
   *   By the completion of the game, the total number of lines played by any one player,
   *   excluding the goalkeeper who is designated to play the entire game, must not exceed the
   *   total number of lines player by any other teammate by more than one.
   * @param {number} fielderCount
   */
  stubLinesForEqualPlay(fielderCount) {
    const players = generateArray(fielderCount);
    const lines = []; // TODO: fix types
    let sequenceIndex = 0;
    // 3 lines per period; 3 period = 9 lines
    for (let i = 0; i < 9; i++) {
      const line = [];
      // 5 fielders (ignore goalie position for now)
      for (let j = 0; j < 5; j++) {
        line.push(players[wrapIndex(sequenceIndex++, players.length)]);
      }
      // Sort the lowest integer first so we maximize the use of
      // the more skilled players and do not overwhelm
      // the less able players.
      lines.push(line.sort((a, b) => a - b));
    }
    return lines;
  }

  validate() {
    const errors = [];
    const activePlayerCount = this.activePlayers.length;
    const activeGoalieCount = this.activeGoalies.length;
    if (activeGoalieCount === 1) errors.push("No Goalie! At least one Goalie is required.");
    if (activeGoalieCount > 3) errors.push("Too many active goalies, maximum of 3 allowed.");
    if (activePlayerCount < 11) errors.push("Too few active players, minimum of 11 players.");
    if (activePlayerCount < 11) errors.push("Too many active players, maximum of 16 players.");
    return errors;
  }

  /**
   * Greedy algorithm fills the lowest scoring lineups with the most
   * skilled players maximizing the use of the best players.
   */
  buildLineup() {
    // FIXME: remove lines from Player class
    // Clear player lines
    this.#players.forEach((p) => p.clearLines());

    // Get active fielders and sort by skill desc
    const fielders = this.activeFielders.sort((a, b) => b.skill - a.skill);

    // Get active goalies and sort by skill
    const goalies = this.activeGoalies.sort((a, b) => b.skill - a.skill);

    // Stub the line up template (only includes fielders)
    const lines = this.stubLinesForEqualPlay(fielders.length);

    // loop over periods and alternate goalies
    for (let i = 1; i <= 3; i++) {
      for (let g = 1; g <= 3; g++) {
        const goalie = goalies[wrapIndex(i - 1, goalies.length)];
        const lineIndex = i * 3 - g;
        goalie.lines[lineIndex] = true;
        lines[lineIndex].push(goalie);
      }
    }

    // loop over fielders and map fill the lineup
    let playerIndex = 0;
    while (playerIndex < fielders.length) {
      // (re)Score the lines
      const lineScores = lines.map(this.scoreLine);

      // get the lines with the lowest score
      const lineIndex = minimumIndex(lineScores);
      const line = lines[lineIndex];
      let replaceIndex;
      // Find the first open slot (array position with a number)
      for (let i = 0; i < line.length; i++) {
        if (typeof line[i] === "number") {
          replaceIndex = line[i];
          break;
        }
      }

      // Replace all occurrances of "replace" with current player index
      for (let i = 0; i < lines.length; i++) {
        for (let p = 0; p < lines[i].length; p++) {
          if (typeof lines[i][p] === "number" && lines[i][p] === replaceIndex) {
            fielders[playerIndex].lines[i] = true;
            lines[i][p] = fielders[playerIndex];
          }
        }
      }
      // Increment the player index
      playerIndex++;
    }

    const finalLineupScores = lines.map(this.scoreLine);

    // Sort the fielders by line; boolean asc
    const finalPlayers = [...fielders, ...goalies].sort((a, b) => (a.lines.toString() > b.lines.toString() ? -1 : 1));

    return {
      lines,
      players: finalPlayers,
      scores: finalLineupScores,
      sd: standardDeviation(finalLineupScores),
    };
  }

  loadDemo() {
    const demoPlayers = [
      { id: "18rspns", name: "Ryan Getzlaf", number: "15", skill: 86, active: true },
      { id: "18rsqfk", name: "Ryan Kesler", number: "17", skill: 66, active: true },
      { id: "18rsr7c", name: "Corey Perry", number: "10", skill: 94, active: true },
      { id: "18rsrz4", name: "John Gibson", number: "36", skill: 75, active: true, position: "G" },
      { id: "18rssqw", name: "Rickard Rakell", number: "67", skill: 83, active: true },
      { id: "18rstio", name: "Andrew Cogliano", number: "7", skill: 79, active: true },
      { id: "18rsuag", name: "Cam Fowler", number: "4", skill: 72, active: true },
      { id: "18rsv28", name: "Hampus Lindholm", number: "47", skill: 77, active: true },
      { id: "18rsvu0", name: "Kevin Bieksa", number: "3", skill: 91, active: true },
      { id: "18rswls", name: "Jakob Silfverberg", number: "33", skill: 88, active: true },
      { id: "18rsxdk", name: "Ryan Miller", number: "30", skill: 85, active: false, position: "G" },
      { id: "18rsy5c", name: "Nick Ritchie", number: "37", skill: 96, active: false },
      { id: "18rsyx4", name: "Antoine Vermette", number: "50", skill: 67, active: true },
      { id: "18rszow", name: "François Beauchemin", number: "23", skill: 87, active: true },
      { id: "18rt0go", name: "Ondřej Kaše", number: "25", skill: 74, active: true },
    ].map((p) => new Player(p));

    this.#players = new Map(demoPlayers.map((p) => [p.id, p]));
    this.#notifyListeners("load", this.players);
    this.#commit(true);
  }
}
