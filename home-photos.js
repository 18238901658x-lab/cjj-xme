// A shared three-hour window, aligned to midnight in Beijing (UTC+8).
const HomePhotos = (() => {
  const period = 3 * 60 * 60 * 1000;
  const offset = 8 * 60 * 60 * 1000;
  function slot(now = Date.now()) { return Math.floor((now + offset) / period); }
  function choose(list, now = Date.now()) {
    const shuffled = [...list];
    let seed = (slot(now) ^ 0x6d2b79f5) >>> 0;
    const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
  }
  function untilNext(now = Date.now()) { return period - ((now + offset) % period); }
  return { choose, slot, untilNext };
})();
