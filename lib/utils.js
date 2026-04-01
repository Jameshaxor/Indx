export function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
export function fmtLakh(n) {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return fmt(n);
}
export function cn(...c) { return c.filter(Boolean).join(' '); }
export function greeting() { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'; }
export function spark(len = 30) {
  const arr = []; let v = 50;
  for (let i = 0; i < len; i++) { v += (Math.random() - 0.47) * 6; v = Math.max(10, Math.min(90, v)); arr.push(v); }
  return arr;
}
export function initials(name) { return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'; }
export function today() { return new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }); }
