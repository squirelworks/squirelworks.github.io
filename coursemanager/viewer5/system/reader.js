export const cores = ["shapes", "reader", "anm"];

export function paint(ctx, page, shapes) {
  ctx.fillStyle = "#1d4e89";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = "#f4f1e8";
  ctx.fillStyle = "#f4f1e8";
  ctx.font = "14px sans-serif";
  const items = (page.fields || []).filter((f) => f.w > 0 && f.h > 0);
  if (!items.length) {
    ctx.fillText(page.name, 24, 40);
    (page.strings || []).slice(0, 8).forEach((s, i) => ctx.fillText(s.slice(0, 80), 24, 70 + i * 22));
    return;
  }
  const minX = Math.min(...items.map((f) => f.x));
  const minY = Math.min(...items.map((f) => f.y));
  const maxX = Math.max(...items.map((f) => f.x + f.w));
  const maxY = Math.max(...items.map((f) => f.y + f.h));
  const scale = Math.min(840 / Math.max(1, maxX - minX), 420 / Math.max(1, maxY - minY));
  const px = (x) => 30 + (x - minX) * scale;
  const py = (y) => 30 + (y - minY) * scale;
  for (const item of items) {
    if (/74LS|27\d\d|MM54|JL/.test(item.text)) {
      ctx.save();
      ctx.fillStyle = "#111";
      shapes.paintObject(ctx, px(item.x) - 8, py(item.y) - 10, 96 * scale, 36 * scale);
      ctx.restore();
    }
    shapes.field(ctx, px(item.x), py(item.y), Math.max(item.w, 40) * scale, Math.max(item.h, 16) * scale, item.text);
  }
}
