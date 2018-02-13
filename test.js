import * as array from './array.js'
import * as player from './player.js'
import * as lineup from './lineup.js'
import * as datastore from './datastore.js'
import main from './main.js'

(function run() {
  const assert = console.assert

  /* Dependencies */
  assert(window.Vue, 'Vue is loaded')
  assert(window.jQuery, 'jQuery is loaded')
  assert(window.bootstrap, 'bootstrap is loaded')

  /* array.js */
  assert(array.indexOfMinValue([3.332,0.11,1]) === 1, 'Can find indexOfMinValue')
  assert(array.generate(3).join() === '0,1,2', 'Can generate an array')
  assert(array.sum([1, 2, 3]) === 6, 'Can sum array')
  assert(array.average([1, 2, 3]) === 2, 'Can average array')
  assert(array.variance([1, 2, 3, 4, 5]) === 2, 'Can calculate variance of an array')
  assert(array.standardDeviation([1, 2, 3, 4, 5]) === 1.4142135623730951, 'Can calculate standard deviation of an array')
  assert(array.wrapIndex(0, 4) === 0, 'Can wrap index of array')
  assert(array.wrapIndex(4, 4) === 0, 'Can wrap index of array')
  assert(array.wrapIndex(9, 4) === 1, 'Can wrap index of array')

  /* player.js */
  let mockPlayer1 = new player.Player('Test1', '01', 25, true, 'Goalie')
  let mockPlayer2 = new player.Player('Test2', '02', 15, 'false')
  mockPlayer2.lines[0] = true
  mockPlayer2.lines[8] = true
  mockPlayer2.clearLines()
  let mockPlayer3 = new player.Player().populate({name:'Test3', number:'03', skill:5})
  let mockCollection1 = player.createCollection([{name:'A'}, {name:'B'}])
  let mockCollection2 = player.createCollection([['A'], ['B']])
  assert(mockPlayer1.isGoalie() === true && mockPlayer2.isGoalie() === false, 'Can check if goalie' )
  assert(mockPlayer2.lines[0] === false && mockPlayer2.lines[8] === false, 'Can clear lines')
  assert(mockPlayer3.name === 'Test3' && mockPlayer3.number === '03' && mockPlayer3.skill === 5, 'Can populate Player from object')
  assert(mockPlayer3.toUrlParam() === encodeURIComponent('Test3~03~5~true~'), 'Can export Player to url param')
  assert(player.create(['A']) instanceof player.Player, 'Can create a player from and array')
  assert(player.create({name:'A'}) instanceof player.Player, 'Can create a player from and array')
  assert(mockCollection1[0].name === 'A' && mockCollection1.length === 2, 'Can create collection from array of objects')
  assert(mockCollection2[0].name === 'A' && mockCollection2.length === 2, 'Can create collection from array of arrays')

  /* lineup.js */
  let mockPlayers = []
  mockPlayers.push(new player.Player('C', '01', 20, false))
  mockPlayers.push(new player.Player('B', '02', 30, true, 'Goalie'))
  mockPlayers.push(new player.Player('A', '03', 10, true))
  mockPlayers.push(new player.Player('D', '04', 5, false, 'Goalie'))
  let mockLine = [{skill:1},{skill:2},{skill:3}]
  let mockLines = [mockLine, mockLine, mockLine]
  let demo = lineup.demo()
  let demoLineup = lineup.determineLineup(demo)
  let mockSortByLines = []
  mockSortByLines.push(new player.Player('D', '04', 1, true))
  mockSortByLines.push(new player.Player('C', '03', 1, true))
  mockSortByLines.push(new player.Player('B', '02', 1, true))
  mockSortByLines.push(new player.Player('A', '01', 1, true))
  mockSortByLines[0].lines = [false, true, true]
  mockSortByLines[1].lines = [true, false, true]
  mockSortByLines[2].lines = [true, true, false]
  mockSortByLines[3].lines = [true, true, true]
  assert(lineup.sortPlayersByName(mockPlayers)[0].name === 'A', 'Can sort players by name')
  assert(lineup.sortPlayersBySkill(mockPlayers)[0].skill === 30, 'Can sort players by skill')
  assert(lineup.sortPlayersByLines(mockSortByLines)[0].name === 'A', 'Can sort players by lines')
  assert(lineup.filterFielders(mockPlayers).length === 2, 'Can filter active fielders')
  assert(lineup.filterGoalies(mockPlayers).length === 2, 'Can filter active goalies')
  assert(lineup.scoreLine(mockLine) === 6, 'Can score a line')
  assert(lineup.scoreLines(mockLines).join() === '6,6,6', 'Can score lines')
  assert(lineup.buildLines(14)[2].toString() === '0,10,11,12,13', 'Can build lines with lowest index sorted first')
  assert(Array.isArray(demo) && demo[0] instanceof player.Player, 'Has demo array')
  assert(demoLineup.players.length === 13, 'Can return the right number of players')
  assert(demoLineup.lines.length === 9 && demoLineup.lines[0].length === 6, 'Can return lines with goalies included')
  assert(demoLineup.scores.join() === '472,503,471,481,470,469,484,473,490', 'Calculates the scores of a lineup')
  assert(demoLineup.mean === 479.22222222222223, 'Calculates the mean of a lineup')
  assert(demoLineup.sd === 10.829771494232183, 'Calculates the standard deviation of a lineup')
  assert(demoLineup.var === 117.28395061728399, 'Calculates the variance of a lineup')

  /* datastore.js */
  mockPlayers = []
  mockPlayers.push(new player.Player('C', '01', 20, false))
  mockPlayers.push(new player.Player('B', '02', 30, true, 'Goalie'))
  mockPlayers.push(new player.Player('A', '03', 10, true))
  mockPlayers.push(new player.Player('D', '04', 5, false, 'Goalie'))
  let mockPlayersHash = 'player=C~01~20~false~&player=B~02~30~true~Goalie&player=A~03~10~true~&player=D~04~5~false~Goalie'
  let mockPlayersParsed = datastore.parsePlayersUrlHash(mockPlayersHash)
  let mockPlayersJson = JSON.stringify(mockPlayers)
  let mockPlayersParsedJson = datastore.parsePlayersJson(mockPlayersJson)
  assert(datastore.buildPlayersUrlHash(mockPlayers) === mockPlayersHash, 'Can build player url hash')
  assert(mockPlayersParsed[0].name === 'C', 'Can parse players url hash; name')
  assert(mockPlayersParsed[0].number === '01', 'Can parse players url hash; number')
  assert(mockPlayersParsed[0].skill === 20, 'Can parse players url hash; skill')
  assert(mockPlayersParsed[0].active === false, 'Can parse players url hash; active')
  assert(mockPlayersParsed[0].position === undefined, 'Can parse players url hash; position')
  assert(mockPlayersParsedJson[0].name === 'C', 'Can parse players json; name')
  assert(mockPlayersParsedJson[0].number === '01', 'Can parse players json; number')
  assert(mockPlayersParsedJson[0].skill === 20, 'Can parse players json; skill')
  assert(mockPlayersParsedJson[0].active === false, 'Can parse players json; active')
  assert(mockPlayersParsedJson[0].position === undefined, 'Can parse players json; position')

  /* main.js */
  assert(main._isVue == true && main._isMounted === true, 'Vue is loads and mounts')

})()
