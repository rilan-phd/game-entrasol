/**
 * Helper LocalStorage untuk skor Entrasol.
 * Berkas ini satu-satunya yang boleh menyentuh localStorage.
 */
(function (root) {
  'use strict';

  const SCORE_KEY = 'entrasol_game_score';
  const GAME1_STATE_KEY = 'entrasol_game1_state';
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

  // --- Game_Session_State game-1 ---

  function isInt(v) {
    return typeof v === 'number' && Number.isInteger(v);
  }

  // Validasi ketat, murni (tanpa localStorage).
  function isValidGame1State(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
    if (obj.phase !== 'playing' && obj.phase !== 'finished') return false;

    const deck = obj.deck;
    if (!Array.isArray(deck) || deck.length !== 16) return false;
    const deckCount = {};
    for (let i = 0; i < 16; i++) {
      const v = deck[i];
      if (!isInt(v) || v < 1 || v > 8) return false;
      deckCount[v] = (deckCount[v] || 0) + 1;
    }
    for (let n = 1; n <= 8; n++) {
      if (deckCount[n] !== 2) return false;
    }

    const status = obj.cardStatus;
    if (!Array.isArray(status) || status.length !== 16) return false;
    const matchedCount = {};
    let matchedTotal = 0;
    for (let i = 0; i < 16; i++) {
      const s = status[i];
      if (s !== 'closed' && s !== 'matched') return false;
      if (s === 'matched') {
        matchedCount[deck[i]] = (matchedCount[deck[i]] || 0) + 1;
        matchedTotal++;
      }
    }
    for (let n = 1; n <= 8; n++) {
      const c = matchedCount[n] || 0;
      if (c !== 0 && c !== 2) return false;
    }

    if (!isInt(obj.pairsFound) || obj.pairsFound < 0 || obj.pairsFound > 8) return false;
    if (obj.pairsFound !== matchedTotal / 2) return false;

    if (!isFiniteNumber(obj.deadline)) return false;

    if (obj.phase === 'finished') {
      const sc = obj.score;
      if (!isInt(sc) || sc < 0 || sc > 40 || sc % 5 !== 0) return false;
      if (sc !== 5 * obj.pairsFound) return false;
    }
    return true;
  }

  // Simpan state; tidak melempar.
  function saveGame1State(stateObj) {
    try {
      root.localStorage.setItem(GAME1_STATE_KEY, JSON.stringify(stateObj));
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  // Baca state; objek valid atau null.
  function loadGame1State() {
    try {
      const raw = root.localStorage.getItem(GAME1_STATE_KEY);
      if (raw === null || raw === undefined) return null;
      const parsed = JSON.parse(raw);
      return isValidGame1State(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  // Hapus state; tidak melempar.
  function clearGame1State() {
    try {
      root.localStorage.removeItem(GAME1_STATE_KEY);
    } catch (e) {
      /* diabaikan */
    }
  }

  // Inisialisasi skor untuk sesi baru dan hapus state game-1.
  function resetScore() {
    const score = defaultCopy();
    clearGame1State();
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
    GAME1_STATE_KEY: GAME1_STATE_KEY,
    DEFAULT_SCORE: DEFAULT_SCORE,
    isValidGame1State: isValidGame1State,
    saveGame1State: saveGame1State,
    loadGame1State: loadGame1State,
    clearGame1State: clearGame1State,
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
  root.isValidGame1State = isValidGame1State;
  root.saveGame1State = saveGame1State;
  root.loadGame1State = loadGame1State;
  root.clearGame1State = clearGame1State;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
