import test from "node:test";
import assert from "node:assert/strict";
import {
  parseChallenge,
  makeChallenge,
  determineProfile,
  evidenceFor,
  challengeUrl,
  isLocalUrl,
} from "../src/logic.js";

const base = () => ({
  checkbox: { dodges: 2, rebel: false },
  postpone: { items: [] },
  frame: { angle: 0, changes: 1, rebel: false },
  temptation: { presses: 0 },
  timing: { seconds: 3, rebel: false },
  terms: { rebel: false },
});

test("朋友从链接拿到同一套题目，不能注入任意称号", () => {
  const link = challengeUrl("https://example.com/game/?old=1", 381247, "rebel");
  const incoming = parseChallenge(new URL(link).hash);
  assert.equal(incoming.profile, "rebel");
  assert.deepEqual(makeChallenge(incoming.seed), makeChallenge(381247));
  assert.equal(new URL(link).search, "");
  assert.deepEqual(parseChallenge("#s=42&p=<script>alert(1)</script>"), {
    seed: 42,
    profile: null,
  });
  for (const hash of [
    "#s=-1&p=rebel",
    "#s=Infinity",
    "#s=4294967296",
    "#s=1.5",
    "#p=rebel",
  ])
    assert.equal(parseChallenge(hash).seed, null);
  assert.equal(parseChallenge("#s=0&p=chill").seed, 0);
});

test("每套题包含全部六件物品；初始画框必须歪", () => {
  for (let seed = 0; seed < 150; seed++) {
    const packet = makeChallenge(seed);
    assert.equal(new Set(packet.items).size, 6);
    assert.ok(Math.abs(packet.angle) >= 8 && Math.abs(packet.angle) <= 14);
    assert.match(packet.number, /^\d{6}$/);
  }
});

test("称号由本局操作决定，每条路径均可到达", () => {
  const cases = [
    ["precise", (x) => x],
    [
      "curious",
      (x) => {
        x.temptation.presses = 4;
      },
    ],
    [
      "offline",
      (x) => {
        x.postpone.items = ["book", "sport", "inbox", "laundry"];
      },
    ],
    [
      "rebel",
      (x) => {
        x.checkbox.rebel = true;
        x.terms.rebel = true;
      },
    ],
    [
      "chill",
      (x) => {
        x.timing.seconds = 5;
      },
    ],
  ];
  for (const [expected, edit] of cases) {
    const answers = base();
    edit(answers);
    assert.equal(determineProfile(answers), expected);
  }
  assert.throws(() => determineProfile({}), /完成全部验证/);
});

test("结果卡引用实际作答，没有虚构群体排名", () => {
  const answers = base();
  answers.temptation.presses = 7;
  answers.timing.seconds = 4.275;
  const evidence = evidenceFor(answers);
  assert.equal(evidence.length, 6);
  assert.match(evidence[3].text, /7 次/);
  assert.match(evidence[4].text, /4.28 秒/);
  assert.ok(evidence.every((item) => !/%|击败|全国/.test(item.text)));
  assert.equal(isLocalUrl("http://localhost:4178"), true);
  assert.equal(isLocalUrl("https://example.com"), false);
});
