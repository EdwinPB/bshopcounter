import { strict as assert } from "node:assert";
import {
  AVERAGE_SERVICE_TIME_MINUTES,
  estimateWaitingMinutes,
  formatWaitTime,
} from "../lib/waiting-time.ts";

assert.equal(AVERAGE_SERVICE_TIME_MINUTES, 30);

const estimateCases: Array<[number, number]> = [
  [0, 0],
  [1, 30],
  [2, 60],
  [3, 90],
  [4, 120],
  [5, 150],
  [10, 300],
];

for (const [input, expected] of estimateCases) {
  assert.equal(
    estimateWaitingMinutes(input),
    expected,
    `estimateWaitingMinutes(${input})`,
  );
}

const formatCases: Array<[number, string]> = [
  [0, "Sin espera"],
  [30, "30 min"],
  [60, "1 hora"],
  [90, "1 hora y 30 min"],
  [120, "2 horas"],
  [150, "2 horas y 30 min"],
  [300, "5 horas"],
  [45, "45 min"],
  [179, "2 horas y 59 min"],
];

for (const [input, expected] of formatCases) {
  assert.equal(formatWaitTime(input), expected, `formatWaitTime(${input})`);
}

console.log("waiting-time: all assertions passed");
