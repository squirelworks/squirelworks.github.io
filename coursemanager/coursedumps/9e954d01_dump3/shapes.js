// Object kinds named by TB80UTL.DLL at file 0xDED6.
// A lesson stores the record. This draws it.

export const kinds = [
  "rectangle",
  "ellipse",
  "roundedRectangle",
  "line",
  "polygon",
  "irregularPolygon",
  "arc",
  "pie",
  "angledLine",
  "curve",
  "paintObject",
  "picture",
  "field",
  "button",
  "group",
];

export function rectangle(ctx, x, y, w, h) {
  ctx.strokeRect(x, y, w, h);
}

export function ellipse(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
}

export function roundedRectangle(ctx, x, y, w, h, r) {
  const radius = r || Math.min(8, Math.abs(w) / 4, Math.abs(h) / 4);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.stroke();
}

export function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function polygon(ctx, points) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
}

export function angledLine(ctx, points) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  ctx.stroke();
}

export function curve(ctx, points) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last[0], last[1]);
  ctx.stroke();
}

export function arc(ctx, x, y, w, h, start, end) {
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, start || 0, end || Math.PI);
  ctx.stroke();
}

export function pie(ctx, x, y, w, h, start, end) {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h / 2);
  ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, start || 0, end || Math.PI);
  ctx.closePath();
  ctx.stroke();
}

export function paintObject(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

export function picture(ctx, image, x, y, w, h) {
  if (image) ctx.drawImage(image, x, y, w, h);
  else paintObject(ctx, x, y, w, h);
}

export function field(ctx, x, y, w, h, text) {
  ctx.strokeRect(x, y, w, h);
  ctx.fillText(text || "", x + 4, y + 14);
}

export function button(ctx, x, y, w, h, text) {
  ctx.strokeRect(x, y, w, h);
  ctx.fillText(text || "", x + 6, y + h / 2);
}

export function group(ctx, children, draw) {
  children.forEach(draw);
}
