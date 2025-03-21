import "jsdom-global/register.js";
import test from "ava";
import * as helpers from "./helpers.js";

test("Minimum index", (t) => {
  t.is(helpers.minimumIndex([3.332, 0.11, 1]), 1, "Finds minimum index");
});

test("Generate array", (t) => {
  t.is(helpers.generateArray(3).join(), "0,1,2", "Generate array with index as value");
});

test("Sum", (t) => {
  t.is(helpers.sum(1, 2, 3), 6);
});

test("Average", (t) => {
  t.is(helpers.average(1, 2, 3), 2);
});

test("Variance", (t) => {
  t.is(helpers.variance(1, 2, 3, 4, 5), 2);
});

test("Standard deviation", (t) => {
  t.is(helpers.standardDeviation(1, 2, 3, 4, 5), Math.SQRT2);
});

test("Wrap index", (t) => {
  t.is(helpers.wrapIndex(0, 4), 0, "no cycles");
  t.is(helpers.wrapIndex(4, 4), 0, "1 cycle");
  t.is(helpers.wrapIndex(9, 4), 1, "2 cycles");
});
