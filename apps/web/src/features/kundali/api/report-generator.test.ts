import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { generateDynamicAstrologyReport } from "./report-generator";

/**
 * This generator is duplicated as `apps/api/src/app/modules/report/generator.py`,
 * because the UI renders a report instantly while the API call completes.
 *
 * Both copies are pinned to the same fixtures. Editing either one without the
 * other fails here or in `test_report_generator.py` — which is the only thing
 * standing between two copies of 440 lines of trilingual prose and silent drift.
 */
const FIXTURES = "../api/tests/modules/report_fixtures";

describe("report generator parity", () => {
  const cases = JSON.parse(readFileSync(`${FIXTURES}/charts.json`, "utf8"));
  const expected = JSON.parse(readFileSync(`${FIXTURES}/expected_reports.json`, "utf8"));

  for (let i = 0; i < cases.length; i++) {
    for (const lang of ["en", "ne", "hi"] as const) {
      it(`chart ${i} in ${lang} matches the pinned fixture`, () => {
        expect(
          generateDynamicAstrologyReport(cases[i].chart, cases[i].birth, lang),
        ).toEqual(expected[`${i}-${lang}`]);
      });
    }
  }
});
