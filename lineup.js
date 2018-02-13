import { Player } from './player.js'
import { wrapIndex, generate, indexOfMinValue, average, variance, standardDeviation } from './array.js'

/**
 * Niave sorting of player names; ascending
 * @param {Player[]} players
 */
export function sortPlayersByName(players) {
  return players.sort((a,b) => typeof a.name === 'string' ? a.name.localeCompare(b.name) : 0)
}

/**
 * Sorts players by skill; descending
 * @param {Player[]} players
 * @return {Player[]}
 */
export function sortPlayersBySkill(players) {
  return players.sort((a,b) => b.skill - a.skill)
}

/**
 * Sorts players by lines; ascending (leverages text sorting of booleans)
 * @param {Player[]} players
 * @return {Player[]}
 */
export function sortPlayersByLines(players) {
  return players.sort((a,b) => a.lines.toString() > b.lines.toString() ? -1: 1)
}

/**
 * Retrieves players who are marked active
 * @param {Player[]} players
 * @return {Player[]}
 */
export function filterActivePlayers(players) {
  return players.filter(player => player.active)
}


/**
 * Retrieves players with any position but Goalie
 * @param {Player[]} players
 * @return {Player[]}
 */
export function filterFielders(players) {
  return players.filter(player => player.isGoalie() === false)
}

/**
 * Retrieves players with the position of Goalie
 * @param {Player[]} players
 * @return {Player[]}
 */
export function filterGoalies(players) {
  return players.filter(player => player.isGoalie() === true)
}

/**
 * Sums the scores of an array of lines
 * @param {Array.Player[]} lines
 * @return {Array}
 */
export function scoreLines(lines) {
  return lines.map(line => scoreLine(line))
}

/**
 * Sums the score of a line
 * @param {Player[]} line
 * @return {number}
 */
export function scoreLine(line) {
  return line.reduce((acc, cur) => typeof cur === 'object' ? acc + cur.skill : acc, 0)
}

/**
 * Builds an array of lines (array) with player indexes based on number of fielders
 * This accomplishes the Special Olympic rules of giving players equal opportunities to play:
 *   By the completion of the game, the total number of lines played by any one player,
 *   excluding the goalkeeper who is designated to play the entire game, must not exceed the
 *   total number of lines player by any other teammate by more than one.
 * @param {number} fielderCount
 * @return {Array[]}
 */
export function buildLines(fielderCount) {
  var sequenceIndex = 0;
  var players = generate(fielderCount)
  let lines = [];
  // 3 lines per period; 3 period = 9 lines
  for (var i = 0; i < 9; i++) {
    var line = [];
    // 5 fielders (ignore goalie position for now)
    for (var j = 0; j < 5; j++) {
      line.push(players[wrapIndex(sequenceIndex++, players.length)])
    }
    // Sort the lowest integer first so we maximize the use of
    // the more skilled/able players and do not overwhelm
    // the less able players.
    lines.push(line.sort((a,b)=>a>b));
  }
  return lines;
}

/**
 * Greedy slave-driver algorithm fills the lowest scoring linups with the most
 * skilled players maximizing the use of the best players.
 * @param {[Player[]} _players
 */
export function determineLineup(players) {
  // Get active players
  players = filterActivePlayers(players)

  // Clear player lines
  players.forEach(player => player.clearLines())

  // get active fielders and sort by skill
  var fielders = sortPlayersBySkill( filterFielders(players) )

  // get active goalies and sort by skill
  var goalies = sortPlayersBySkill( filterGoalies(players) )

  // build the line up template (only includes fielders)
  let lines = buildLines( fielders.length )

  // loop over periods and alternate goalies
  for (var i = 1; i <= 3; i++) {
    for (var g = 1; g <= 3; g++) {
      let goalie = goalies[wrapIndex(i - 1, goalies.length)]
      let lineIndex = i * 3 - g
      goalie.lines[lineIndex] = true
      lines[lineIndex].push(goalie)
    }
  }

  // loop over fielders and map fill the lineup
  let playerIndex = 0;
  while (playerIndex < fielders.length) {
    // (re)Score the lines
    let lineScores = scoreLines(lines)

    // get the lines with the lowest score
    let lineIndex = indexOfMinValue(lineScores);
    let line = lines[lineIndex]

    // Find the first open slot (array position with a number)
    for ( let i = 0; i < line.length; i++) {
      if (typeof line[i] === 'number') {
        var replaceIndex = line[i]
        break;
      }
    }

    // Replace all occurrances of "replace" with current player index
    for (let i = 0; i < lines.length; i++) {
      for (let p = 0; p < lines[i].length; p++) {
        if (typeof lines[i][p] === 'number' && lines[i][p] === replaceIndex) {
          fielders[playerIndex].lines[i] = true
          lines[i][p] = fielders[playerIndex]
        }
      }
    }
    // Increment the player index
    playerIndex++
  }

  let finalLineupScores = scoreLines(lines)

  // Sort the fielders by line
  let finalPlayers = sortPlayersByLines(fielders).concat(goalies)

  return {
    lines: lines,
    players: finalPlayers,
    scores: finalLineupScores,
    mean: average(finalLineupScores),
    var: variance(finalLineupScores),
    sd: standardDeviation(finalLineupScores)
  }
}

export function demo() {
  var demo = [];
  demo.push(new Player('Ryan Getzlaf', '15', 86, true))
  demo.push(new Player('Ryan Kesler', '17', 66, true))
  demo.push(new Player('Corey Perry', '10', 94, true))
  demo.push(new Player('John Gibson', '36', 75, true, 'Goalie'))
  demo.push(new Player('Rickard Rakell', '67', 83, true))
  demo.push(new Player('Andrew Cogliano', '7', 79, true))
  demo.push(new Player('Cam Fowler', '4', 72, true))
  demo.push(new Player('Hampus Lindholm', '47', 77, true))
  demo.push(new Player('Kevin Bieksa', '3', 91, true))
  demo.push(new Player('Jakob Silfverberg', '33', 88, true))
  demo.push(new Player('Ryan Miller', '30', 85, false, 'Goalie'))
  demo.push(new Player('Nick Ritchie', '37', 96, false))
  demo.push(new Player('Antoine Vermette', '50', 67, true))
  demo.push(new Player('François Beauchemin', '23', 87, true))
  demo.push(new Player('Ondřej Kaše', '25', 74, true))
  return demo;
}
