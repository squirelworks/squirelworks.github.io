export function rectangle(ctx, x, y, w, h) { ctx.strokeRect(x, y, w, h); }
export function ellipse(ctx, x, y, w, h) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2); ctx.stroke(); }
export function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
export function paintObject(ctx, x, y, w, h) { ctx.fillRect(x, y, w, h); }
export function field(ctx, x, y, w, h, text) { ctx.strokeRect(x, y, w, h); ctx.fillText(text || "", x + 4, y + 14); }
export function button(ctx, x, y, w, h, text) { ctx.strokeRect(x, y, w, h); ctx.fillText(text || "", x + 6, y + h / 2); }
