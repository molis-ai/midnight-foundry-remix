import { PROFILES } from "./logic.js";

function rounded(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function text(
  ctx,
  value,
  x,
  y,
  size,
  color = "#17365a",
  weight = "400",
  align = "left",
) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}
function drawBlob(ctx, color, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = "#17365a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-109, 53);
  ctx.bezierCurveTo(-166, 2, -114, -96, -75, -88);
  ctx.bezierCurveTo(-41, -160, 35, -135, 52, -87);
  ctx.bezierCurveTo(150, -104, 153, -10, 115, 16);
  ctx.bezierCurveTo(157, 94, 64, 103, 48, 90);
  ctx.bezierCurveTo(-7, 147, -55, 116, -64, 88);
  ctx.bezierCurveTo(-102, 111, -130, 90, -109, 53);
  ctx.fill();
  ctx.stroke();
  [-35, 38].forEach((ex) => {
    ctx.fillStyle = "#fffefa";
    ctx.beginPath();
    ctx.ellipse(ex, -22, 21, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#17365a";
    ctx.beginPath();
    ctx.ellipse(ex + 5, -14, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.beginPath();
  ctx.moveTo(-24, 31);
  ctx.quadraticCurveTo(3, 64, 31, 25);
  ctx.stroke();
  ctx.restore();
}

export async function createCertificateCanvas({
  profileKey,
  evidence,
  number,
}) {
  await document.fonts.ready;
  const p = PROFILES[profileKey];
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e8f0f5";
  ctx.fillRect(0, 0, 1080, 1440);
  rounded(ctx, 60, 55, 960, 1322, 18, "#fffefa");
  text(ctx, "人类验证局", 108, 123, 32, "#17365a", "700");
  text(ctx, `HV-${number}`, 972, 122, 25, "#627387", "400", "right");
  ctx.strokeStyle = "#cbd3d7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(108, 153);
  ctx.lineTo(972, 153);
  ctx.stroke();
  text(ctx, "人 类 证 明", 540, 254, 61, "#17365a", "800", "center");
  text(ctx, "兹证明，此处有一名", 540, 315, 25, "#6c7882", "400", "center");
  text(ctx, p.name, 540, 385, 62, p.color, "800", "center");
  drawBlob(
    ctx,
    {
      rebel: "#f3ba93",
      curious: "#f0d581",
      offline: "#c9c2e9",
      precise: "#bad6bb",
      chill: "#aed5e6",
    }[profileKey],
    540,
    570,
  );
  ctx.save();
  ctx.translate(795, 610);
  ctx.rotate(-0.16);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, "活人", 0, -3, 37, p.color, "700", "center");
  text(ctx, "认证", 0, 38, 27, p.color, "700", "center");
  ctx.restore();
  text(ctx, p.line, 540, 753, 35, "#17365a", "600", "center");
  text(ctx, p.note, 540, 806, 23, "#627387", "400", "center");
  rounded(ctx, 108, 854, 864, 337, 14, "#f0f4f4");
  text(ctx, "本局亲眼所见的人类证据", 140, 901, 25, "#17365a", "600");
  evidence.forEach((item, i) => {
    text(
      ctx,
      String(i + 1).padStart(2, "0"),
      140,
      950 + i * 40,
      21,
      p.color,
      "600",
    );
    text(ctx, item.text, 190, 950 + i * 40, 24, "#405369");
  });
  text(
    ctx,
    "听说真正的人类，都忍不住第 4 题。",
    540,
    1251,
    31,
    "#17365a",
    "700",
    "center",
  );
  text(
    ctx,
    "你是哪种人类？来「人类验证局」领证。",
    540,
    1300,
    24,
    "#627387",
    "400",
    "center",
  );
  text(
    ctx,
    "趣味互动实验 · 不是心理测评 · 不必完美，确认为人",
    540,
    1344,
    19,
    "#7c8995",
    "400",
    "center",
  );
  return canvas;
}

export async function downloadCertificate(data) {
  const canvas = await createCertificateCanvas(data);
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("导出失败"))),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `人类证明-${PROFILES[data.profileKey].name}-${data.number}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
