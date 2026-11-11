/**
 * Helper LocalStorage untuk skor Entrasol.
 * Berkas ini satu-satunya yang boleh menyentuh localStorage.
 */
(function (root) {
  'use strict';

  const SCORE_KEY = 'entrasol_game_score';
  const DEFAULT_SCORE = Object.freeze({
    memoryFlip: 0,
    memoryRecall: 0,
    memorize: 0,
    total: 0
  });
  const GAME_KEYS = ['memoryFlip', 'memoryRecall', 'memorize'];

  function isFiniteNumber(v) {
    return typeof v === 'number' && Number.isFinite(v);
  }

  // Objek dengan keempat field berupa angka finite.
  function isValidScore(obj) {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      !Array.isArray(obj) &&
      isFiniteNumber(obj.memoryFlip) &&
      isFiniteNumber(obj.memoryRecall) &&
      isFiniteNumber(obj.memorize) &&
      isFiniteNumber(obj.total)
    );
  }

  // total = memoryFlip + memoryRecall + memorize
  function computeTotal(score) {
    return score.memoryFlip + score.memoryRecall + score.memorize;
  }

  function defaultCopy() {
    return {
      memoryFlip: DEFAULT_SCORE.memoryFlip,
      memoryRecall: DEFAULT_SCORE.memoryRecall,
      memorize: DEFAULT_SCORE.memorize,
      total: DEFAULT_SCORE.total
    };
  }

  // Baca skor; jika storage tidak tersedia / JSON rusak / field tidak lengkap -> salinan DEFAULT_SCORE.
  function getScore() {
    try {
      const raw = root.localStorage.getItem(SCORE_KEY);
      if (raw === null || raw === undefined) return defaultCopy();
      const parsed = JSON.parse(raw);
      if (!isValidScore(parsed)) return defaultCopy();
      return {
        memoryFlip: parsed.memoryFlip,
        memoryRecall: parsed.memoryRecall,
        memorize: parsed.memorize,
        total: parsed.total
      };
    } catch (e) {
      return defaultCopy();
    }
  }

  // Simpan skor satu game, pertahankan field lain, hitung ulang total.
  // Tidak melempar error: kegagalan -> { ok: false, score }.
  function saveGameScore(gameKey, value) {
    const score = getScore();
    if (GAME_KEYS.indexOf(gameKey) === -1 || !isFiniteNumber(value)) {
      return { ok: false, score: score };
    }
    score[gameKey] = value;
    score.total = computeTotal(score);
    try {
      root.localStorage.setItem(SCORE_KEY, JSON.stringify(score));
      return { ok: true, score: score };
    } catch (e) {
      return { ok: false, score: score };
    }
  }

  // Inisialisasi skor untuk sesi baru.
  function resetScore() {
    const score = defaultCopy();
    try {
      root.localStorage.setItem(SCORE_KEY, JSON.stringify(score));
      return { ok: true, score: score };
    } catch (e) {
      return { ok: false, score: score };
    }
  }

  function getTotal() {
    return getScore().total;
  }

  const api = {
    SCORE_KEY: SCORE_KEY,
    DEFAULT_SCORE: DEFAULT_SCORE,
    isValidScore: isValidScore,
    computeTotal: computeTotal,
    getScore: getScore,
    saveGameScore: saveGameScore,
    resetScore: resetScore,
    getTotal: getTotal
  };

  // Objek global untuk browser (dan fungsi langsung agar bisa dipanggil game.js).
  root.ScoreStore = api;
  root.saveGameScore = saveGameScore;
  root.getScore = getScore;
  root.resetScore = resetScore;
  root.getTotal = getTotal;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
