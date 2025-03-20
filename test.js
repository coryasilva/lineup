import test from 'ava';
import * as helpers from "./helpers.js";
import { Model } from "./model.js";
import { Player } from "./player.js";

test("helpers.js", (t) => {
  t.is(helpers.minimumIndex([3.332, 0.11, 1]), 1, "Finds minimum index");
  t.is(helpers.generateArray(3).join(), "0,1,2", "Generate array with index as value");
  t.is(helpers.sum([1, 2, 3]), 6, "Sums array");
  t.is(helpers.average([1, 2, 3]), 2, "Averages array");
  t.is(helpers.variance([1, 2, 3, 4, 5]), 2, "Calculates variance of an array");
  t.is(helpers.standardDeviation([1, 2, 3, 4, 5]), Math.SQRT2, "Calculates standard deviation of an array");
  t.is(helpers.wrapIndex(0, 4), 0, "Wraps out of bounds index of array, no cycles");
  t.is(helpers.wrapIndex(4, 4), 0, "Wraps out of bounds index of array, 1 cycle");
  t.is(helpers.wrapIndex(9, 4), 1, "Wraps out of bounds index of array, 2 cycles");
});

test("player.js", (t) => {
  const p1 = new Player({ id: "1", name: "Test 1", number: "01", skill: 25, active: true, position: "G" });
  t.is(p1.name, "Test 1", "Player constructs with name");
  t.is(p1.number, "01", "Player constructs with number");
  t.is(p1.skill, 25, "Player constructs with skill");
  t.is(p1.position, "G", "Player constructs with position");
  t.is(p1.active, true, "Player constructs with active");

  const p2 = new Player({ id: "2", name: "Test2", number: "02", skill: 15, active: false });
  t.true(p1.isGoalie(), "Check if goalie, true");
  t.false(p2.isGoalie(), "Check if goalie, false");

  const p3 = new Player({ id: "3", name: "Test3", number: "03", skill: 5 });
  t.is(p3.toString("~"), "Test3~03~5~~0", "Converts Player values to delimited string");

  const p4 = Player.fromString("4~Test 4~09~75~G~1", "~");
  t.true(p4 instanceof Player, "Builds Player from delimited string");
  t.is(p4.name, "Test 4", "Sets Player.name from delimited string");
  t.is(p4.number, "09", "Sets Player.number from delimited string");
  t.is(p4.skill, 75, "Sets Player.skill from delimited string");
  t.is(p4.position, "G", "Sets Player.position from delimited string");
  t.is(p4.active, true, "Sets Player.active from delimited string");
});

test("view-model.js", (t) => {
  const mockWindow = {
    history: { replaceState: () => {} },
    addEventListener: () => {},
    location: { hash: "" },
  };
  const mockHash = "p=C%20c~01~20~~1&p=B%20b~02~30~G~1&p=A%20a~03~10~~1&p=D%20d~04~5~~0";
  mockWindow.location.hash = mockHash;
  // @ts-ignore
  const model = new Model(mockWindow);
  console.log(model.players);
});

(function run() {
  // test('main.js', t => {
  //   t.true(main._isVue, 'Vue loads')
  //   t.true(main._isMounted, 'Vue mounts')
  // })
  // test('datastore.js', t => {
  //   const playersHash = 'p=C%20c~01~20~~1&p=B%20b~02~30~G~1&p=A%20a~03~10~~1&p=D%20d~04~5~~0'
  //   const players = [
  //     new player.Player({ name: 'C c', number: '01', skill: 20, active: true }),
  //     new player.Player({ name: 'B b', number: '02', skill: 30, active: true, position: 'G' }),
  //     new player.Player({ name: 'A a', number: '03', skill: 10, active: true }),
  //     new player.Player({ name: 'D d', number: '04', skill: 5, active: false }),
  //   ]
  //   t.is(datastore.buildHash(players), playersHash, 'Builds player url hash')
  //   t.is(datastore.parseHash(playersHash)[0].name, 'C c', 'Parses players url hash; name')
  //   t.is(datastore.parseHash(playersHash)[0].number, '01', 'Parses players url hash; number')
  //   t.is(datastore.parseHash(playersHash)[0].skill, 20, 'Parses players url hash; skill')
  //   t.is(datastore.parseHash(playersHash)[0].active, true, 'Parses players url hash; active')
  //   t.is(datastore.parseHash(playersHash)[0].position, undefined, 'Parse players url hash; position')
  // })
  // test('lineup.js', t => {
  //   const players = [
  //     new player.Player({ name: 'C', number: '01', skill: 20, active: false }),
  //     new player.Player({ name: 'B', number: '02', skill: 30, active: true, position: 'G' }),
  //     new player.Player({ name: 'A', number: '03', skill: 10, active: true }),
  //     new player.Player({ name: 'D', number: '04', skill: 5, active: false, position: 'G' }),
  //   ]
  //   const line = [{ skill: 1 }, { skill: 2 }, { skill: 3 }]
  //   const lines = [line, line, line]
  //   const demo = lineup.demo()
  //   const demoLineup = lineup.determineLineup(demo)
  //   const sortByLines = [
  //     new player.Player({ name: 'D', number: '04', skill: 1, active:true }),
  //     new player.Player({ name: 'C', number: '03', skill: 1, active:true }),
  //     new player.Player({ name: 'B', number: '02', skill: 1, active:true }),
  //     new player.Player({ name: 'A', number: '01', skill: 1, active:true }),
  //   ]
  //   sortByLines[0].lines = [false, true, true]
  //   sortByLines[1].lines = [true, false, true]
  //   sortByLines[2].lines = [true, true, false]
  //   sortByLines[3].lines = [true, true, true]
  //   t.is(lineup.sortPlayersByName(players)[0].name, 'A', 'Sorts players by name')
  //   t.is(lineup.sortPlayersBySkill(players)[0].skill, 30, 'Sorts players by skill')
  //   t.is(lineup.sortPlayersByLines(sortByLines)[0].name, 'A', 'Sorts players by lines')
  //   t.is(lineup.filterFielders(players).length, 2, 'Filters active fielders')
  //   t.is(lineup.filterGoalies(players).length, 2, 'Filters active goalies')
  //   t.is(lineup.scoreLine(line), 6, 'Scores a line')
  //   t.is(lineup.scoreLines(lines).join(), '6,6,6', 'Scores lines')
  //   t.is(lineup.stubLinesForEqualPlay(14)[2].toString(), '0,10,11,12,13', 'Builds lines with lowest index sorted first')
  //   t.true(Array.isArray(demo) && demo[0] instanceof player.Player, 'Has demo array')
  //   t.is(demoLineup.players.length, 13, 'Returns the right number of players')
  //   t.true(demoLineup.lines.length === 9 && demoLineup.lines[0].length === 6, 'Returns lines with goalies included')
  //   t.is(demoLineup.scores.join(), '472,503,471,481,470,469,484,473,490', 'Calculates the scores of a lineup')
  //   t.is(demoLineup.mean, 479.22222222222223, 'Calculates the mean of a lineup')
  //   t.is(demoLineup.sd, 10.829771494232183, 'Calculates the standard deviation of a lineup')
  //   t.is(demoLineup.var, 117.28395061728399, 'Calculates the variance of a lineup')
  // })
})();
