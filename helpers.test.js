import "global-jsdom/register";
import test from "ava";
import * as h from "./helpers.js";

test("Sum", (t) => {
  t.is(h.sum(1, 2, 3), 6);
});

test("Average", (t) => {
  t.is(h.average(1, 2, 3), 2);
});

test("Variance", (t) => {
  t.is(h.variance(1, 2, 3, 4, 5), 2);
});

test("Standard deviation", (t) => {
  t.is(h.standardDeviation(1, 2, 3, 4, 5), Math.SQRT2);
});

