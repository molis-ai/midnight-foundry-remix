export const eye = `<svg viewBox="0 0 52 34" fill="none" aria-hidden="true"><path d="M2 17C13-3 39-3 50 17 39 37 13 37 2 17Z" fill="currentColor"/><circle cx="26" cy="17" r="9" fill="var(--eye-ink, #e8f0f5)"/><circle cx="29" cy="14" r="2.5" fill="currentColor"/></svg>`;

export function blob(mood = "happy", color = "#d9ec8a") {
  return `<svg viewBox="0 0 250 220" fill="none" aria-hidden="true"><ellipse cx="125" cy="201" rx="84" ry="9" fill="#17365a" opacity=".09"/><path d="M56 158C21 130 34 78 66 66 75 20 131 12 154 47 205 27 230 80 208 113 239 152 207 184 170 182 144 214 104 206 87 181 73 186 51 182 56 158Z" fill="${color}" stroke="#17365a" stroke-width="3"/><path d="m60 147-29 16m157-19 28 17M98 184l-6 22m69-22 7 22" stroke="#17365a" stroke-width="4" stroke-linecap="round"/><ellipse cx="102" cy="101" rx="14" ry="20" fill="#fffef8"/><ellipse cx="149" cy="101" rx="14" ry="20" fill="#fffef8"/><g class="pupils"><ellipse cx="105" cy="106" rx="6" ry="9" fill="#17365a"/><ellipse cx="152" cy="106" rx="6" ry="9" fill="#17365a"/></g>${mood === "happy" ? '<path d="M112 133q16 18 31-3" stroke="#17365a" stroke-width="4" stroke-linecap="round"/>' : '<path d="m111 141 29-3" stroke="#17365a" stroke-width="4" stroke-linecap="round"/>'}<ellipse cx="78" cy="126" rx="10" ry="5" fill="#f0a994"/><ellipse cx="174" cy="124" rx="10" ry="5" fill="#f0a994"/></svg>`;
}

export function scanner() {
  return `<div class="scanner-scene" aria-label="一台正在给绿色小人办理人类证明的蓝色扫描机" role="img">
    <span class="floating-note">有点小毛病。<br/>确认，是人类。</span>
    <div class="machine"><div class="machine-top"><span class="machine-label">人类识别终端</span><span class="machine-led"></span><span class="machine-serial">H-01</span></div>
      <div class="machine-screen"><div class="screen-grid"></div><span class="screen-cross a">+</span><span class="screen-cross b">+</span><span class="screen-cross c">+</span><span class="screen-cross d">+</span><div class="screen-creature">${blob()}</div><div class="scan-line"></div><span class="screen-caption">发现一只不太标准的人类</span></div>
      <div class="machine-controls"><div class="speaker"><i></i><i></i><i></i><i></i></div><span>正在接纳你的不完美</span><div class="machine-knob"></div></div>
      <div class="printer-slot"></div><div class="mini-receipt"><div class="receipt-eye">${eye}</div><b>人 类 证 明</b><span>瑕疵存在，准予通行。</span><div class="barcode"></div></div>
    </div><div class="approval-stamp">是人类<br/><span>本局认了</span></div><span class="scene-spark spark-one">✳</span><span class="scene-spark spark-two">✧</span></div>`;
}

export const ITEMS = {
  book: {
    name: "买来就算读过的书",
    bg: "#e7e4f3",
    art: '<path d="m36 28 57 11v68L36 96Z" fill="#7775ae"/><path d="m36 28 10-6 57 12-10 5m0 0 10-5v68l-10 5" fill="#fffdf2"/><path d="m48 48 31 6m-31 5 22 5m-22 13 31 6" stroke="#ded9f1" stroke-width="3"/><path d="M65 32v29l8-6 6 9V35" fill="#e77c57"/>',
  },
  sport: {
    name: "只练过开机的健身课",
    bg: "#e2edde",
    art: '<path d="M30 89V45q0-17 17-17h50v63H44" fill="#8fad78"/><ellipse cx="47" cy="88" rx="20" ry="15" fill="#bed4a3"/><ellipse cx="47" cy="88" rx="10" ry="7" fill="none" stroke="#63845d" stroke-width="3"/><path d="m72 42 18 6m-18 3 18 6" stroke="#b6cf9e" stroke-width="3"/>',
  },
  alarm: {
    name: "第 8 个起床闹钟",
    bg: "#f8e3d1",
    art: '<circle cx="65" cy="66" r="32" fill="#fff9e9" stroke="#d78858" stroke-width="6"/><path d="m43 98-7 9m50-9 7 9M38 27l-9 10m55-11 13 10M65 44v23l14 9" stroke="#17365a" stroke-width="4" stroke-linecap="round"/><path d="M26 31q8-20 25-11m30 1q17-6 25 13" stroke="#d78858" stroke-width="8" stroke-linecap="round"/>',
  },
  inbox: {
    name: "攒成传家宝的未读",
    bg: "#dcebf0",
    art: '<rect x="37" y="19" width="55" height="90" rx="9" fill="#8aafbf"/><rect x="42" y="26" width="45" height="73" rx="4" fill="#f7fcff"/><path d="M49 61h29m-29 9h22m-22 9h25" stroke="#adcad4" stroke-width="4"/><rect x="63" y="15" width="42" height="27" rx="13" fill="#e76844"/><text x="84" y="34" text-anchor="middle" font-size="15" font-family="Arial" fill="white">99+</text>',
  },
  plant: {
    name: "等你浇水的绿植",
    bg: "#e9eed5",
    art: '<path d="m44 76 7 32h34l8-32" fill="#d39572"/><path d="M68 79V40m0 25Q37 64 34 37q28-3 34 28m0-12q-2-31 28-31 4 24-28 31" fill="#7caa77" stroke="#628763" stroke-width="2"/><path d="M37 76h61" stroke="#c28261" stroke-width="7" stroke-linecap="round"/>',
  },
  laundry: {
    name: "椅子上长出来的衣服",
    bg: "#f2e2e4",
    art: '<path d="M40 35h47v55H40Zm0 53v23m47-23v23" stroke="#9a8e93" stroke-width="6" stroke-linecap="round"/><path d="m42 27 17-8 15 7 26 26-17 9-7-8 7 37H37l10-38-13 7-14-13Z" fill="#c5acc9" stroke="#ac91b4" stroke-width="2"/><path d="m54 24 10 18 13-14" stroke="#9c82aa" stroke-width="3"/>',
  },
};

export function itemArt(id) {
  return `<svg viewBox="0 0 130 125" fill="none" aria-hidden="true">${ITEMS[id].art}</svg>`;
}
