import { standardDeviation } from "./helpers.js";
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
    for (const listener of this.#listeners) {
      listener(eventType, newValue);
    }
  }

  get players() {
    return Array.from(this.#players.values());
  }

  get playerCount() {
    return this.#players.size;
  }

  get activeGoalies() {
    return Array.from(this.#players.values()).filter((p) => p.isGoalie() && p.active);
  }

  get activeFielders() {
    return Array.from(this.#players.values()).filter((p) => !p.isGoalie() && p.active);
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

  validate() {
    const errors = [];
    const activePlayerCount = this.activePlayers.length;
    const activeGoalieCount = this.activeGoalies.length;
    if (activeGoalieCount === 0) errors.push("No Goalie! At least one Goalie is required.");
    if (activeGoalieCount > 3) errors.push("Too many active goalies, maximum of 3 allowed.");
    if (activePlayerCount < 6) errors.push("Too few active players, minimum of 6 players.");
    if (activePlayerCount > 16) errors.push("Too many active players, maximum of 16 players.");
    return errors;
  }

  /**
   * Greedy one-per-category balanced number partitioning
   * that maintains equal play and equal sum skill lineups.
   */
  buildLineup() {
    // Data
    const valid = this.validate().length === 0;
    const fielders = this.activeFielders;
    const goalies = this.activeGoalies;
    const players = fielders.concat(goalies);

    // Constants
    const periodCount = 3;
    const linePerPeriod = 3;
    const lineCount = periodCount * linePerPeriod;
    const fieldersPerLine = 5; // Players on court (minus goalie)

    // Determine min/max occurances for equal play
    const totalFielderOcc = lineCount * fieldersPerLine;
    const avgFielderOcc = totalFielderOcc / fielders.length;
    const minFielderOcc = Math.ceil(avgFielderOcc) - 1;
    const maxFielderOcc = Math.floor(avgFielderOcc) + 1;
    const maxGoalieOcc = Math.ceil(periodCount / goalies.length);

    // Resulting data structure
    /** @type {Map<string | [Player, number[], number | number]>} */
    const playerLines = new Map(
      players.map((p) => [p.id, [p, Array.from({ length: lineCount }, () => false), lineCount]]),
    );

    // Track lines sums and players
    const lines = Array.from({ length: lineCount }, (_, i) => ({ line: i + 1, sum: 0, players: new Map() }));

    // Track player occurances
    const playerOcc = players.reduce((o, f) => {
      o[f.id] = 0;
      return o;
    }, {});

    // Greedy sort; skill desc
    fielders.sort((a, b) => b.skill - a.skill);
    goalies.sort((a, b) => b.skill - a.skill);

    // Repeat sorted players array
    const fieldersMax = [].concat(...Array(maxFielderOcc).fill(fielders));
    const goaliesMax = [].concat(...Array(maxGoalieOcc).fill(goalies));

    // Fill the lines with fielders
    let counter = 0;
    while (valid && counter < totalFielderOcc) {
      for (const fielder of fieldersMax) {
        if (playerOcc[fielder.id] >= maxFielderOcc) continue;

        const openLines = lines.filter((l) => l.players.size < fieldersPerLine);
        if (openLines.length === 0) continue;

        const openLinesWithoutPlayer = openLines.filter((l) => !l.players.has(fielder.id));
        if (openLinesWithoutPlayer.length === 0) continue;

        // Choose line with open slots, without current player, and with lowest sum
        const minSumIdx = openLinesWithoutPlayer.reduce(
          (minIdx, l, i, arr) => (l.sum < arr[minIdx].sum ? i : minIdx),
          0,
        );
        const lineIdx = openLinesWithoutPlayer[minSumIdx].line - 1;

        openLinesWithoutPlayer[minSumIdx].players.set(fielder.id, fielder);
        openLinesWithoutPlayer[minSumIdx].sum += fielder.skill;
        playerOcc[fielder.id]++;
        playerLines.get(fielder.id)[1][lineIdx] = true;
        playerLines.get(fielder.id)[2] = Math.min(playerLines.get(fielder.id)[2], lineIdx);
        counter++;
      }
    }

    // Calc period sums to determine where to place goalies
    const periodSums = lines.reduce(
      (ps, ls, i) => {
        const period = Math.ceil((i + 1) / linePerPeriod);
        ps[period - 1].sum += ls.sum;
        return ps;
      },
      Array.from({ length: periodCount }, (_, i) => ({ period: i + 1, sum: 0, hasGoalie: false })),
    );

    // Fill the lines with goalies
    for (const goalie of goaliesMax) {
      const openPeriods = periodSums.filter((p) => p.hasGoalie === false);
      if (openPeriods.length === 0) continue;

      const { period } = openPeriods.sort((a, b) => a.sum - b.sum)[0];

      for (let l = 0; l > -1 * linePerPeriod; l--) {
        const lineIdx = period * linePerPeriod - 1 + l;
        lines[lineIdx].players.set(goalie.id, goalie);
        lines[lineIdx].sum += goalie.skill;
        playerOcc[goalie.id]++;
        playerLines.get(goalie.id)[1][lineIdx] = true;
        playerLines.get(goalie.id)[2] = Math.min(playerLines.get(goalie.id)[2], lineIdx);
        periodSums[period - 1].hasGoalie = true;
      }
    }

    // Transform data for return
    const lineSums = lines.map((l) => l.sum);
    const playerRows = Array.from(playerLines.values()).sort((a, b) => a[2] - b[2]);

    return {
      minFielderOcc,
      maxFielderOcc,
      playerOcc,
      playerRows,
      lineSums,
      standardDeviation: standardDeviation(...lineSums),
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
      { id: "18rt0go", name: "Ondřej Kaše", number: "25", skill: 74, active: false },
    ].map((p) => new Player(p));

    this.#players = new Map(demoPlayers.map((p) => [p.id, p]));
    this.#notifyListeners("load", this.players);
    this.#commit(true);
  }
}
