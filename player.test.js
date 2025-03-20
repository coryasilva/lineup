import test from "ava";
import { Player, PlayerPosition } from "./player.js";

test("Player constructor", (t) => {
  const player = new Player({ id: "1", name: "Test 1", number: "01", skill: 25, active: true, position: "G" });
  t.is(player.id, "1", "id")
  t.is(player.name, "Test 1", "name");
  t.is(player.number, "01", "number");
  t.is(player.skill, 25, "skill");
  t.is(player.position, "G", "position");
  t.is(player.active, true, "active");
});

test("Player isGoalie", (t) => {
  const player = new Player({ id: "2", name: "Test2", number: "02", skill: 15, active: false });
  t.false(player.isGoalie());
  player.position = PlayerPosition.GOALIE;
  t.true(player.isGoalie());
});

test("Player to string", (t) => {
  const player = new Player({ id: "3", name: "Test3", number: "03", skill: 5 });
  t.is(player.toString("~"), "3~Test3~03~5~F~0");
});

test("Player from string", (t) => {
  const player = Player.fromString("4~Test 4~09~75~G~1", "~");
  t.true(player instanceof Player);
  t.is(player.id, "4", "id");
  t.is(player.name, "Test 4", "name");
  t.is(player.number, "09", "number");
  t.is(player.skill, 75, "skill");
  t.is(player.position, "G", "position");
  t.is(player.active, true, "active");
});
  