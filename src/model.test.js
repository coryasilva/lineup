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

// test("Player crud", (t) => {

// })

// test("Demo commit, load, and build lineup", (t) => {

// })
