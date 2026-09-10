export const PROFILES = {
  rebel: {
    name: "反骨散装型人类",
    short: "反骨",
    color: "#e7653e",
    line: "规则读完了，但没说要听。",
    note: "有自己的主意，是一种很珍贵的出厂设置。",
    trait: "不服从默认设置",
  },
  curious: {
    name: "手欠好奇型人类",
    short: "好奇",
    color: "#d88526",
    line: "写着「别按」？那必须按。",
    note: "世界上很多有趣的事，都从「我试试」开始。",
    trait: "对世界保持手欠",
  },
  offline: {
    name: "精神离线型人类",
    short: "离线",
    color: "#7274b5",
    line: "人在这里，灵魂正在缓冲。",
    note: "偶尔离线也没关系，世界可以等你一会儿。",
    trait: "擅长明天再说",
  },
  precise: {
    name: "脑内开会型人类",
    short: "较真",
    color: "#317967",
    line: "表面没事，脑内已开三轮会。",
    note: "认真也许有点累，但你眼里的世界很细腻。",
    trait: "拥有自己的刻度",
  },
  chill: {
    name: "松弛特供型人类",
    short: "松弛",
    color: "#397db0",
    line: "人生不是考试，这题先放着。",
    note: "不必每次都全力以赴，你本来就值得被允许。",
    trait: "允许自己不完美",
  },
};

export function parseChallenge(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const value = params.get("s");
  const seed =
    value && /^\d{1,10}$/.test(value) && Number(value) <= 4294967295
      ? Number(value)
      : null;
  const profile = Object.hasOwn(PROFILES, params.get("p"))
    ? params.get("p")
    : null;
  return { seed, profile: seed === null ? null : profile };
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeChallenge(seed) {
  const random = seededRandom(seed);
  const items = ["book", "sport", "alarm", "inbox", "plant", "laundry"];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    items,
    angle: (random() > 0.5 ? 1 : -1) * (8 + Math.floor(random() * 7)),
    number: String(seed % 1000000).padStart(6, "0"),
  };
}

export function determineProfile(answers) {
  const { checkbox, postpone, frame, temptation, timing, terms } = answers;
  if (!checkbox || !postpone || !frame || !temptation || !timing || !terms)
    throw new Error("请完成全部验证");
  const rebellion =
    Number(checkbox.rebel) +
    Number(frame.rebel) +
    Number(timing.rebel) +
    Number(terms.rebel);
  if (rebellion >= 2) return "rebel";
  if (temptation.presses >= 3) return "curious";
  if (postpone.items.length >= 4) return "offline";
  if (
    Math.abs(frame.angle) <= 1 &&
    !frame.rebel &&
    !timing.rebel &&
    Math.abs(timing.seconds - 3) <= 0.65
  )
    return "precise";
  if (temptation.presses > 0) return "curious";
  return "chill";
}

export function evidenceFor(answers) {
  return [
    {
      label: "入局方式",
      text: answers.checkbox.rebel
        ? "理直气壮地拒绝自证"
        : `追到了逃跑 ${answers.checkbox.dodges} 次的勾选框`,
    },
    {
      label: "明日计划",
      text: answers.postpone.items.length
        ? `${answers.postpone.items.length} 件事，决定明天再说`
        : "今天的事，今天就想办",
    },
    {
      label: "较真程度",
      text: answers.frame.rebel
        ? "允许画框歪着，挺好的"
        : `把画框调到了 ${Math.abs(answers.frame.angle)}°`,
    },
    {
      label: "好奇证据",
      text: answers.temptation.presses
        ? `「千万别按」？按了 ${answers.temptation.presses} 次`
        : "整整 5 秒，一次都没按",
    },
    {
      label: "时间感",
      text: answers.timing.rebel
        ? "拒绝让时间被考核"
        : `你心里的 3 秒 = ${answers.timing.seconds.toFixed(2)} 秒`,
    },
    {
      label: "最终决定",
      text: answers.terms.rebel
        ? "先活着，细则以后再说"
        : "已同意：做个不完美的人",
    },
  ];
}

export function challengeUrl(base, seed, profile) {
  const url = new URL(base);
  url.search = "";
  url.hash = new URLSearchParams({
    s: String(seed >>> 0),
    p: Object.hasOwn(PROFILES, profile) ? profile : "chill",
  }).toString();
  return url.href;
}

export function isLocalUrl(value) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname);
}
