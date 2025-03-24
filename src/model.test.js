import "global-jsdom/register";
import test from "ava";
import { Model } from "./model.js";
import { Player } from "./player.js";

test("Build lineup", (t) => {
  // Test for all valid team sizes
  for (let i = 6; i < 17; i++) {
    const model = new Model();
    const players = Array.from({ length: i }, (_, k) => {
      const n = k + 1;
      return new Player({
        id: `${n}`,
        name: `P${n}`,
        number: `0${n}`,
        skill: n * 4,
        active: true,
        position: n === 1 ? "G" : "F",
      });
    });

    for (const player of players) {
      model.createPlayer(player);
    }

    const lineup = model.buildLineup();

    let totalOcc = 0;
    let totalGoalieOcc = 0;
    let totalFielderOcc = 0;
    let minFielderOcc = 100;
    let maxFielderOcc = 0;

    for (const [player, lines] of lineup.playerRows) {
      const occ = lines.filter((l) => l).length;
      totalOcc += occ;
      if (player.isGoalie()) {
        totalGoalieOcc += occ;
      } else {
        totalFielderOcc += occ;
        minFielderOcc = Math.min(occ, minFielderOcc);
        maxFielderOcc = Math.max(occ, maxFielderOcc);
      }
    }

    t.true(maxFielderOcc <= lineup.maxFielderOcc, `equal play max; ${i}`);
    t.true(minFielderOcc >= lineup.minFielderOcc, `equal play min; ${i}`);
    t.is(totalFielderOcc, 45, `fielder occurances; ${i}`);
    t.is(totalGoalieOcc, 9, `goalie occurances; ${i}`);
    t.is(totalOcc, 54, `total occurances; ${i}`);
  }
});

test("Player CRUD + listener", (t) => {
  const calls = [];
  window.location.hash = "";
  const model = new Model();
  model.addListener((t, v) => calls.push([t, v]));
  t.is(model.playerCount, 0);

  // Create
  model.createPlayer(
    new Player({
      id: "1",
      name: "P1",
      number: "01",
      skill: 50,
      active: true,
      position: "F",
    }),
  );
  t.is(model.playerCount, 1);
  t.is(model.getPlayer("1").name, "P1");
  t.is(calls[0][0], "create");
  t.is(calls[0][1].id, "1");

  // Update
  model.updatePlayer(
    new Player({
      id: "1",
      name: "X1",
      number: "01",
      skill: 50,
      active: true,
      position: "F",
    }),
  );
  t.is(model.playerCount, 1);
  t.is(model.getPlayer("1").name, "X1");
  t.is(calls[1][0], "update");
  t.is(calls[1][1].name, "X1");

  // Delete
  model.deletePlayer("1");
  t.is(model.playerCount, 0);
  t.is(calls[2][0], "delete");
  t.is(calls[2][1], "1");
});

test("Demo commit, load, and build lineup", (t) => {
  window.location.hash = "";
  const model = new Model();
  t.is(window.location.hash, "");
  model.loadDemo();
  t.snapshot(window.location.hash);
  t.snapshot(model.buildLineup());
});
