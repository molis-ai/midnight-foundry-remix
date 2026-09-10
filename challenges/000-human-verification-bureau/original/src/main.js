import "./style.css";
import { eye, blob, scanner, ITEMS, itemArt } from "./art.js";
import {
  PROFILES,
  parseChallenge,
  makeChallenge,
  determineProfile,
  evidenceFor,
  challengeUrl,
  isLocalUrl,
} from "./logic.js";
import { downloadCertificate } from "./poster.js";

const app = document.querySelector("#app");
const inbound = parseChallenge(location.hash);
let seed = inbound.seed ?? crypto.getRandomValues(new Uint32Array(1))[0];
let packet = makeChallenge(seed);
let answers = {};
let step = 0;
let cleanup = () => {};
let soundEnabled = false;
let audioContext;
let toastTimer;
let profileKey;
const $ = (selector) => app.querySelector(selector);
const $$ = (selector) => [...app.querySelectorAll(selector)];
const stageNames = [
  "身份声明",
  "明日计划",
  "强迫校准",
  "好奇审查",
  "时间错觉",
  "人类条款",
];
const prefersReducedMotion = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function beep(pitch = 520, duration = 0.09) {
  if (!soundEnabled) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);
    gain.gain.setValueAtTime(0.07, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration,
    );
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    /* 声音不可用时仍可完整游玩。 */
  }
}

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 4200);
}

function shell(content, pageClass = "") {
  cleanup();
  cleanup = () => {};
  app.innerHTML = `<header class="site-header"><button class="brand" aria-label="人类验证局首页">${eye}<span>人类验证局<small>Human Verification Bureau</small></span></button><div class="header-actions"><span class="open-status"><i></i>今日照常接纳人类</span><button class="sound-toggle" aria-pressed="${soundEnabled}" aria-label="${soundEnabled ? "关闭" : "开启"}音效">${soundEnabled ? "♫ 音效开" : "♪ 音效关"}</button><button class="about-button">办理须知</button></div></header><main class="${pageClass}">${content}</main><footer class="site-footer"><span>不必完美，确认为人。</span><span>一个不严肃的互动实验 <span class="footer-star">✳</span> Made for imperfect humans.</span></footer><dialog class="about-dialog"><button class="dialog-close" aria-label="关闭办理须知">×</button><div class="small-eye">${eye}</div><h2>办理须知</h2><p>这是一场关于「不完美」的荒诞小游戏。六道题，没有标准答案。</p><ul><li>结果来自你这一局的选择和操作，仅供娱乐。</li><li>不做真实人机识别，也不是心理测评。</li><li>不需要登录，不上传你的作答。</li><li>链接只携带题目编号和趣味称号；不含详细作答。</li><li>声音默认关闭，手机和键盘都可以玩。</li></ul><p class="dialog-note">本局唯一的准则：允许你做个普通人。</p><button class="primary dialog-okay">知道了，做个人去</button></dialog>`;
  $(".brand").addEventListener("click", () => {
    if (step > 0 && step < 7) {
      toast("正在办理中；可用页面上的「重新开始」重开。");
      return;
    }
    step = 0;
    home();
  });
  $(".sound-toggle").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    const button = $(".sound-toggle");
    button.textContent = soundEnabled ? "♫ 音效开" : "♪ 音效关";
    button.setAttribute("aria-pressed", String(soundEnabled));
    button.setAttribute("aria-label", `${soundEnabled ? "关闭" : "开启"}音效`);
    beep();
  });
  const dialog = $(".about-dialog");
  $(".about-button").addEventListener("click", () => dialog.showModal());
  $(".dialog-close").addEventListener("click", () => dialog.close());
  $(".dialog-okay").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
}

function focusHeading() {
  const heading = $("main h1");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function home() {
  shell(
    `<section class="hero"><div class="hero-copy">${inbound.profile ? `<div class="challenge-invite">一位「${PROFILES[inbound.profile].name}」向你发来同题挑战</div>` : '<div class="issue-label"><span class="tiny-cross">+</span> 人类资格受理处 <span class="issue-line"></span> 第 001 号实验</div>'}<h1>请证明，<br/>你不是 <span class="ai-word">AI<span class="hand-circle"></span></span>。</h1><p class="hero-description">犹豫、手欠、走神、嘴硬。<br/>每一个小毛病，都是你活着的证据。</p><div class="hero-cta"><button class="primary start-button">开始验证 <span class="button-icon">↗</span></button><span class="cta-note">6 道怪题 · 约 60 秒<br/>不用登录，带人来就行。</span></div><div class="hero-footnote"><span class="scribble-arrow">↳</span> 最后，你会领到一张有点问题的人类证明。</div></div>${scanner()}</section><section class="samples"><div class="samples-heading"><span>本局接纳的部分人类</span><span class="samples-subtitle">每种人，都有自己的出厂设置。</span></div><div class="sample-list"><article class="sample"><div class="sample-art purple">${blob("neutral", "#c9c2e9")}</div><div><h2>精神离线型</h2><p>已读世界，暂时不回。</p></div><span class="sample-index">样本 A</span></article><article class="sample"><div class="sample-art peach">${blob("happy", "#f3ba93")}</div><div><h2>反骨散装型</h2><p>规则很好，下次一定。</p></div><span class="sample-index">样本 B</span></article><article class="sample"><div class="sample-art green">${blob("happy", "#d9ec8a")}</div><div><h2>脑内开会型</h2><p>这件小事，我想了三天。</p></div><span class="sample-index">样本 C</span></article></div></section>`,
    "home-page",
  );
  $(".start-button").addEventListener("click", start);
  const handler = (event) => {
    const x = (event.clientX / innerWidth - 0.5) * 6;
    const y = (event.clientY / innerHeight - 0.5) * 5;
    $$(".pupils").forEach(
      (p) => (p.style.transform = `translate(${x}px, ${y}px)`),
    );
  };
  if (!prefersReducedMotion)
    window.addEventListener("pointermove", handler, { passive: true });
  cleanup = () => window.removeEventListener("pointermove", handler);
}

function start() {
  answers = {};
  step = 1;
  beep(600);
  renderStep();
}

function stage(content, title, description, extraClass = "") {
  shell(
    `<div class="game-topline"><button class="restart-link">↶ 重新开始</button><span>受理编号 HV-${packet.number}</span></div><div class="progress-rail" aria-label="第 ${step} 题，共 6 题">${stageNames.map((name, i) => `<div class="progress-step ${i + 1 === step ? "current" : i + 1 < step ? "done" : ""}"><span>${i + 1 < step ? "✓" : String(i + 1).padStart(2, "0")}</span><b>${name}</b></div>`).join("")}</div><section class="test-card ${extraClass}"><div class="test-topline"><span class="test-tag">${stageNames[step - 1]}</span><span class="test-count">${String(step).padStart(2, "0")} / 06</span></div><h1>${title}</h1><p class="test-description">${description}</p>${content}<div class="inspector"><span class="inspector-eye">${eye}</span><span id="inspector-message" aria-live="polite">本局观察员正在认真地不太认真。</span></div></section>`,
    "game-page",
  );
  $(".restart-link").addEventListener("click", start);
  focusHeading();
}

function remark(text) {
  $("#inspector-message").textContent = text;
}

function done(id, value, response) {
  answers[id] = value;
  beep(760, 0.12);
  if (step === 6) {
    step = 7;
    result();
    return;
  }
  const oldCleanup = cleanup;
  oldCleanup();
  cleanup = () => {};
  const node = $(".test-card");
  node
    .querySelectorAll("button, input")
    .forEach((input) => (input.disabled = true));
  const overlay = document.createElement("div");
  overlay.className = "step-response";
  overlay.innerHTML = `<span class="response-check">✓</span><strong></strong><p>人类证据已收好。</p><button class="primary next-step">下一项 <span>↗</span></button>`;
  overlay.querySelector("strong").textContent = response;
  node.append(overlay);
  overlay.querySelector("button").focus({ preventScroll: true });
  overlay.querySelector("button").addEventListener(
    "click",
    () => {
      step += 1;
      renderStep();
    },
    { once: true },
  );
}

function renderStep() {
  [
    checkboxStep,
    postponeStep,
    frameStep,
    temptationStep,
    timingStep,
    termsStep,
  ][step - 1]();
}

function checkboxStep() {
  stage(
    `<div class="checkbox-playground"><span class="corner-mark tl"></span><span class="corner-mark br"></span><button class="captcha-control"><span class="fake-checkbox"></span><span>我不是机器人</span><span class="captcha-emblem">${eye}<small>re:human</small></span></button><span class="playground-hint">点击勾选框</span></div><button class="text-choice rebel-choice">我是机器人又怎样？</button>`,
    "先走个流程。",
    "请勾选下方选框，证明你不是机器人。",
  );
  let dodges = 0;
  const checkbox = $(".captcha-control");
  checkbox.addEventListener("click", () => {
    if (dodges < 2) {
      dodges++;
      checkbox.style.transform = `translate(${dodges === 1 ? 22 : -18}px, ${dodges === 1 ? -35 : 30}px) rotate(${dodges === 1 ? -4 : 3}deg)`;
      remark(
        dodges === 1
          ? "不好意思，勾选框有点社恐。再追一下？"
          : "它跑不动了，这次一定能勾到。",
      );
      $(".playground-hint").textContent =
        dodges === 1 ? "它躲了一下。" : "好了，它认命了。";
      beep(280);
    } else
      done(
        "checkbox",
        { dodges, rebel: false },
        "会追一个框三次的，大概率是人。",
      );
  });
  $(".rebel-choice").addEventListener("click", () =>
    done("checkbox", { dodges, rebel: true }, "这理直气壮的劲儿，很人类。"),
  );
}

function postponeStep() {
  stage(
    `<div class="object-grid">${packet.items.map((id) => `<button class="object-tile" data-item="${id}" aria-pressed="false"><span class="object-art" style="background:${ITEMS[id].bg}">${itemArt(id)}<span class="selection-check" aria-hidden="true">✓</span></span><span class="object-name">${ITEMS[id].name}</span></button>`).join("")}</div><div class="step-actions"><span id="selected-count" aria-live="polite">可以多选，也可以一个都不选。</span><button class="primary submit-postpone">我今天就做</button></div>`,
    "哪些事，你想明天再说？",
    "请选择所有让你产生「下次一定」冲动的物品。",
  );
  const selected = new Set();
  $$(".object-tile").forEach((button) =>
    button.addEventListener("click", () => {
      const id = button.dataset.item;
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      button.setAttribute("aria-pressed", String(selected.has(id)));
      $("#selected-count").textContent = selected.size
        ? `已推迟 ${selected.size} 件人生大事。`
        : "可以多选，也可以一个都不选。";
      $(".submit-postpone").textContent = selected.size
        ? "明天一定"
        : "我今天就做";
      beep(430 + selected.size * 45);
    }),
  );
  $(".submit-postpone").addEventListener("click", () =>
    done(
      "postpone",
      { items: [...selected] },
      selected.size
        ? "你没有拖延，只是给明天一点盼头。"
        : "竟然今天就做。本局肃然起敬。",
    ),
  );
}

function frameStep() {
  stage(
    `<div class="frame-scene"><div class="wall-hook"></div><div class="crooked-frame" style="--angle:${packet.angle}deg"><div class="frame-picture">${blob("neutral", "#c9c2e9")}<span>普通人肖像 / 无名氏</span></div></div><span class="frame-caption">它好像……有点歪。</span></div><div class="angle-control"><span>−20°</span><label for="angle" class="sr-only">调整画框角度</label><input id="angle" type="range" min="-20" max="20" value="${packet.angle}" step="1"/><span>+20°</span><output for="angle" id="angle-output">${packet.angle}°</output></div><div class="frame-actions"><button class="text-choice accept-crooked">歪着也挺好</button><button class="primary submit-frame">就这样，舒服了</button></div>`,
    "把这张画摆正。",
    "拖动滑块。调到你觉得舒服就好。",
  );
  let changes = 0;
  $("#angle").addEventListener("input", (event) => {
    const angle = Number(event.target.value);
    changes++;
    $(".crooked-frame").style.setProperty("--angle", `${angle}deg`);
    $("#angle-output").textContent = `${angle}°`;
    remark(
      Math.abs(angle) <= 1
        ? "画是正了。你的世界也清净了吗？"
        : "只是歪了一点点。真的只是一点点。",
    );
  });
  $(".submit-frame").addEventListener("click", () => {
    const angle = Number($("#angle").value);
    done(
      "frame",
      { angle, changes, rebel: false },
      Math.abs(angle) <= 1
        ? "世界终于对齐了。至少这幅画是。"
        : "你的舒服，不需要量角器批准。",
    );
  });
  $(".accept-crooked").addEventListener("click", () =>
    done(
      "frame",
      { angle: Number($("#angle").value), changes, rebel: true },
      "你允许它歪着，它也允许你躺着。",
    ),
  );
}

function temptationStep() {
  stage(
    `<div class="temptation-arena"><div class="temptation-timer"><span id="temptation-clock">5.0</span><small>秒</small></div><button class="forbidden-button" disabled>千万<br/>别按</button><span class="button-shadow"></span><span class="temptation-comment" aria-live="polite">很简单。你什么都不用做。</span></div><div class="temptation-bottom"><button class="primary start-temptation">我准备好了</button><span class="temptation-instruction">开始后计时 5 秒，时间到自动收卷。</span></div>`,
    "接下来，请不要按这个按钮。",
    "只需要忍住 5 秒。真的，只有 5 秒。",
    "temptation-card",
  );
  let presses = 0;
  let interval;
  let remaining = 5000;
  let previous;
  const visibility = () => {
    previous = performance.now();
  };
  const comments = [
    "就知道你会按。",
    "都按了，再按一次怎么了。",
    "按钮没有 KPI，你也没有。",
    "你是真的一点没忍住啊。",
    "好了好了，知道你有手了。",
    "本局决定，把按钮送你。",
  ];
  $(".forbidden-button").addEventListener("click", () => {
    presses++;
    beep(180 + (presses % 6) * 70);
    $(".temptation-comment").textContent =
      comments[Math.min(presses - 1, comments.length - 1)];
    remark(`已按 ${presses} 次。本局全都看见了。`);
    $(".forbidden-button").classList.remove("pressed");
    void $(".forbidden-button").offsetWidth;
    $(".forbidden-button").classList.add("pressed");
  });
  $(".start-temptation").addEventListener(
    "click",
    () => {
      $(".start-temptation").hidden = true;
      $(".forbidden-button").disabled = false;
      $(".forbidden-button").focus({ preventScroll: true });
      $(".temptation-instruction").textContent = "正在计时。忍不住也没关系。";
      previous = performance.now();
      document.addEventListener("visibilitychange", visibility);
      interval = setInterval(() => {
        const now = performance.now();
        if (!document.hidden) remaining -= now - previous;
        previous = now;
        $("#temptation-clock").textContent = (
          Math.max(0, remaining) / 1000
        ).toFixed(1);
        if (remaining <= 0) {
          clearInterval(interval);
          done(
            "temptation",
            { presses },
            presses
              ? `「不要按」的意思是：你按了 ${presses} 次。`
              : "真就一下没按。这份定力，请保留。",
          );
        }
      }, 50);
    },
    { once: true },
  );
  cleanup = () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", visibility);
  };
}

function timingStep() {
  stage(
    `<div class="timing-arena"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="timing-face">${eye}<span id="time-thought">你心里的 3 秒，有多长？</span></div><button class="hold-button">按住开始，松手结束</button></div><p class="keyboard-hint">鼠标 / 手指按住，或聚焦后按住空格键。时间不显示，凭感觉。</p><button class="text-choice skip-timing">我的时间，不接受考核</button>`,
    "在你觉得过了 3 秒时松手。",
    "这一题，只听你自己的时间。",
  );
  let heldAt = null;
  let guard;
  let hintTimer;
  let holdPointer = null;
  const button = $(".hold-button");
  const cancel = () => {
    if (heldAt === null) return;
    heldAt = null;
    clearTimeout(guard);
    clearTimeout(hintTimer);
    $(".timing-arena")?.classList.remove("holding");
    if ($(".hold-button")) $(".hold-button").textContent = "按住开始，松手结束";
    if ($("#time-thought"))
      $("#time-thought").textContent = "刚才中断了，再试一次就好。";
  };
  const finish = () => {
    if (heldAt === null) return;
    const seconds = (performance.now() - heldAt) / 1000;
    heldAt = null;
    clearTimeout(guard);
    clearTimeout(hintTimer);
    done(
      "timing",
      { seconds, rebel: false },
      `你的 3 秒，实际是 ${seconds.toFixed(2)} 秒。时间果然很私人。`,
    );
  };
  const begin = () => {
    if (heldAt !== null) return;
    heldAt = performance.now();
    beep(380);
    $(".timing-arena").classList.add("holding");
    button.textContent = "凭感觉，松手就好";
    $("#time-thought").textContent = "本局不催你。";
    hintTimer = setTimeout(() => {
      if ($("#time-thought"))
        $("#time-thought").textContent = "还在吗，地球人？";
    }, 6500);
    guard = setTimeout(() => {
      cancel();
      remark("按住已超过 20 秒，已暂停。可以重试或跳过考核。");
    }, 20000);
  };
  button.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    holdPointer = event.pointerId;
    button.setPointerCapture(event.pointerId);
    begin();
  });
  button.addEventListener("pointerup", (event) => {
    if (event.pointerId !== holdPointer) return;
    event.preventDefault();
    holdPointer = null;
    finish();
  });
  button.addEventListener("pointercancel", () => {
    holdPointer = null;
    cancel();
  });
  button.addEventListener("lostpointercapture", () => {
    if (holdPointer !== null) {
      holdPointer = null;
      cancel();
    }
  });
  button.addEventListener("keydown", (event) => {
    if ([" ", "Enter"].includes(event.key)) {
      event.preventDefault();
      if (!event.repeat) begin();
    }
  });
  button.addEventListener("keyup", (event) => {
    if ([" ", "Enter"].includes(event.key)) {
      event.preventDefault();
      finish();
    }
  });
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("blur", cancel);
  const visibility = () => {
    if (document.hidden) cancel();
  };
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("blur", cancel);
  $(".skip-timing").addEventListener("click", () => {
    cancel();
    done("timing", { seconds: 0, rebel: true }, "收到。你的时间，归你自己。");
  });
  cleanup = () => {
    clearTimeout(guard);
    clearTimeout(hintTimer);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("blur", cancel);
  };
}

function termsStep() {
  stage(
    `<div class="human-terms"><div class="terms-document-title">《 人类使用条款 》<span>终身有效版</span></div><p><span>01</span> 允许偶尔没用。</p><p><span>02</span> 允许改变主意。</p><p><span>03</span> 允许今天什么都没成为。</p><div class="terms-handwriting">你不需要通过考试，<br/>才有资格做一个人。</div><span class="terms-flower">✳</span></div><div class="terms-actions"><button class="primary agree-terms">我同意，做个不完美的人</button><button class="text-choice rebel-terms">先活着，细则以后再说</button></div>`,
    "最后，确认一件小事。",
    "请读完这份对你有利的条款。",
  );
  remark("其实，从你进来的时候，本局就知道了。");
  $(".agree-terms").addEventListener("click", () =>
    done("terms", { rebel: false }, ""),
  );
  $(".rebel-terms").addEventListener("click", () =>
    done("terms", { rebel: true }, ""),
  );
}

function result() {
  profileKey = determineProfile(answers);
  const profile = PROFILES[profileKey];
  const evidence = evidenceFor(answers);
  shell(
    `<section class="result-intro"><div class="result-status"><i></i>办理完毕。是人类，本局认了。</div><h1>有点小毛病。<br/>但，是个活人。</h1><p>你的不标准，本身就是答案。</p></section><div class="result-layout"><article class="certificate" style="--profile-color:${profile.color}" aria-label="你的人类证明"><div class="certificate-top"><span>${eye} 人类验证局</span><span>HV-${packet.number}</span></div><div class="certificate-title">人 类 证 明</div><p class="certificate-subtitle">兹证明，此处有一名</p><h2>${profile.name}</h2><div class="certificate-portrait">${blob(profileKey === "offline" ? "neutral" : "happy", { rebel: "#f3ba93", curious: "#f0d581", offline: "#c9c2e9", precise: "#bad6bb", chill: "#aed5e6" }[profileKey])}<span class="portrait-seal">活人<br/>认证</span></div><p class="profile-line">${profile.line}</p><div class="certificate-note">${profile.note}</div><div class="certificate-bottom"><span>有效期：直到你不想证明为止。</span><span>纯属娱乐</span></div><div class="certificate-teeth"></div></article><aside class="result-details"><div class="evidence-heading"><h2>你的 6 条人类证据</h2><span>本局亲眼所见</span></div><ol class="evidence-list">${evidence.map((item, i) => `<li><span class="evidence-number">${String(i + 1).padStart(2, "0")}</span><div><span>${item.label}</span><p>${item.text}</p></div><span class="evidence-check">✓</span></li>`).join("")}</ol><div class="share-actions"><button class="primary download-result">↓ 保存我的人类证明</button><button class="secondary copy-challenge">复制同题挑战链接 ↗</button><div class="manual-copy" hidden><label for="share-link">自动复制不可用，请手动复制：</label><input id="share-link" readonly/><button class="text-choice close-copy">收起</button></div><p class="share-note">${isLocalUrl(location.href) ? "当前为本机预览，链接仅在本机可用。<br/>结果图可以直接保存分享。" : "把同一套怪题交给朋友。看看谁更忍不住。"}</p></div><button class="text-choice replay-button">不服，重新验证一次 ↶</button></aside></div><p class="result-disclaimer">趣味称号来自本局玩法规则，不是心理测评或真实人机识别。</p>`,
    "result-page",
  );
  focusHeading();
  $(".download-result").addEventListener("click", async () => {
    const button = $(".download-result");
    button.disabled = true;
    button.textContent = "正在印制你的人类证明…";
    try {
      await downloadCertificate({
        profileKey,
        evidence,
        number: packet.number,
      });
      toast("人类证明已生成，请查看浏览器下载。");
    } catch {
      toast("图片未能保存，请重试，或直接截图这张证明。");
    } finally {
      button.disabled = false;
      button.textContent = "↓ 保存我的人类证明";
    }
  });
  $(".copy-challenge").addEventListener("click", async () => {
    const link = challengeUrl(location.href, seed, profileKey);
    const text = `我在人类验证局被鉴定为「${profile.name}」。听说真正的人类，都忍不住第 4 题。你来试试？\n${link}`;
    try {
      await navigator.clipboard.writeText(text);
      toast(
        isLocalUrl(location.href)
          ? "本机挑战链接已复制；公开上线后才能跨设备邀请。"
          : "同题挑战已复制，交给朋友试试。",
      );
    } catch {
      $(".manual-copy").hidden = false;
      $("#share-link").value = link;
      $("#share-link").focus();
      $("#share-link").select();
    }
  });
  $(".close-copy").addEventListener("click", () => {
    $(".manual-copy").hidden = true;
    $(".copy-challenge").focus();
  });
  $(".replay-button").addEventListener("click", start);
}

home();
