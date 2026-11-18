/**
 * Helper LocalStorage untuk skor Entrasol.
 * Berkas ini satu-satunya yang boleh menyentuh localStorage.
 */
(function (root) {
  'use strict';

  const SCORE_KEY = 'entrasol_game_score';
  const GAME1_STATE_KEY = 'entrasol_game1_state';
  const GAME2_STATE_KEY = 'entrasol_game2_state';
  const GAME3_STATE_KEY = 'entrasol_game3_state';
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

  // --- Game_Session_State game-2 ---

  function isNonEmptyString(v) {
    return typeof v === 'string' && v.length > 0;
  }

  // Validasi ketat, murni (tanpa localStorage).
  function isValidGame2State(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
    if (obj.phase !== 'playing' && obj.phase !== 'finished') return false;
    if (!isNonEmptyString(obj.targetId)) return false;

    const opts = obj.optionIds;
    if (!Array.isArray(opts) || opts.length !== 3) return false;
    for (let i = 0; i < 3; i++) {
      if (!isNonEmptyString(opts[i])) return false;
    }
    if (new Set(opts).size !== 3) return false;
    if (opts.indexOf(obj.targetId) === -1) return false;

    if (!isFiniteNumber(obj.memorizeEnd) || !isFiniteNumber(obj.answerEnd)) return false;
    if (!(obj.answerEnd > obj.memorizeEnd)) return false;

    if (obj.phase === 'finished') {
      if (obj.result !== 'correct' && obj.result !== 'wrong' && obj.result !== 'timeout') return false;
      if (obj.score !== (obj.result === 'correct' ? 30 : 0)) return false;
    }
    return true;
  }

  // Simpan state; tidak melempar.
  function saveGame2State(stateObj) {
    try {
      root.localStorage.setItem(GAME2_STATE_KEY, JSON.stringify(stateObj));
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  // Baca state; objek valid atau null.
  function loadGame2State() {
    try {
      const raw = root.localStorage.getItem(GAME2_STATE_KEY);
      if (raw === null || raw === undefined) return null;
      const parsed = JSON.parse(raw);
      return isValidGame2State(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  // Hapus state; tidak melempar.
  function clearGame2State() {
    try {
      root.localStorage.removeItem(GAME2_STATE_KEY);
    } catch (e) {
      /* diabaikan */
    }
  }

  // --- Game_Session_State game-3 ---

  function isUniqueStringArray(arr, len) {
    if (!Array.isArray(arr) || arr.length !== len) return false;
    for (let i = 0; i < arr.length; i++) {
      if (!isNonEmptyString(arr[i])) return false;
    }
    return new Set(arr).size === arr.length;
  }

  // Validasi ketat, murni (tanpa localStorage).
  function isValidGame3State(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
    if (obj.phase !== 'playing' && obj.phase !== 'finished') return false;

    const orig = obj.originalOrder;
    if (!isUniqueStringArray(orig, 3)) return false;

    const opts = obj.optionOrder;
    if (!isUniqueStringArray(opts, 3)) return false;
    for (let i = 0; i < 3; i++) {
      if (orig.indexOf(opts[i]) === -1) return false;
    }
    if (opts.every(function (id, i) { return id === orig[i]; })) return false;

    if (!isFiniteNumber(obj.memorizeEnd) || !isFiniteNumber(obj.answerEnd)) return false;
    if (!(obj.answerEnd > obj.memorizeEnd)) return false;

    const picks = obj.picks;
    if (!Array.isArray(picks) || picks.length > 3) return false;
    for (let i = 0; i < picks.length; i++) {
      if (!isNonEmptyString(picks[i]) || orig.indexOf(picks[i]) === -1) return false;
    }
    if (new Set(picks).size !== picks.length) return false;

    if (obj.phase === 'finished') {
      let correct = 0;
      for (let i = 0; i < picks.length; i++) {
        if (picks[i] === orig[i]) correct++;
      }
      if (!isInt(obj.score) || obj.score !== 10 * correct) return false;
    }
    return true;
  }

  // Simpan state; tidak melempar.
  function saveGame3State(stateObj) {
    try {
      root.localStorage.setItem(GAME3_STATE_KEY, JSON.stringify(stateObj));
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  // Baca state; objek valid atau null.
  function loadGame3State() {
    try {
      const raw = root.localStorage.getItem(GAME3_STATE_KEY);
      if (raw === null || raw === undefined) return null;
      const parsed = JSON.parse(raw);
      return isValidGame3State(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  // Hapus state; tidak melempar.
  function clearGame3State() {
    try {
      root.localStorage.removeItem(GAME3_STATE_KEY);
    } catch (e) {
      /* diabaikan */
    }
  }

  // Inisialisasi skor untuk sesi baru dan hapus state game-1, game-2, dan game-3.
  function resetScore() {
  const score = defaultCopy();

  clearGame1State();
  clearGame2State();
  clearGame3State();

  // Hapus hasil dan penanda sesi sebelumnya
  clearResultSnapshot();
  clearSessionDone();

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

  // --- Sesi & snapshot halaman Result ---

  
const SESSION_DONE_KEY = 'entrasol_session_done';
const RESULT_SNAPSHOT_KEY = 'entrasol_result_snapshot';
const SESSION_DONE_TAB_KEY = 'entrasol_session_done_tab';

// Sesi dianggap selesai bila state game-3 berstatus 'finished'.
function isSessionFinished() {
  const s = loadGame3State();
  return s !== null && s.phase === 'finished';
}

// Penanda selesai hanya berlaku untuk tab saat ini.
function markSessionDone() {
  try {
    root.localStorage.setItem(SESSION_DONE_KEY, '1');
  } catch (e) {
    return { ok: false };
  }

  try {
    root.sessionStorage.setItem(SESSION_DONE_TAB_KEY, '1');
  } catch (e) {
    // Diabaikan jika sessionStorage tidak tersedia.
  }

  return { ok: true };
}

function isSessionDoneInCurrentTab() {
  try {
    return root.sessionStorage.getItem(SESSION_DONE_TAB_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function isSessionDone() {
  try {
    return root.localStorage.getItem(SESSION_DONE_KEY) === '1';
  } catch (e) {
    return false;
  }
}


function clearSessionDone() {
  try {
    root.localStorage.removeItem(SESSION_DONE_KEY);
  } catch (e) {
    // Diabaikan.
  }

  try {
    root.sessionStorage.removeItem(SESSION_DONE_TAB_KEY);
  } catch (e) {
    // Diabaikan.
  }
}


  // Snapshot per tab (sessionStorage) agar refresh tetap menampilkan hasil yang sama.
  function saveResultSnapshot(score) {
    try {
      root.sessionStorage.setItem(RESULT_SNAPSHOT_KEY, JSON.stringify(score));
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  function getResultSnapshot() {
    try {
      const raw = root.sessionStorage.getItem(RESULT_SNAPSHOT_KEY);
      if (raw === null || raw === undefined) return null;
      const parsed = JSON.parse(raw);
      return isValidScore(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function clearResultSnapshot() {
    try {
      root.sessionStorage.removeItem(RESULT_SNAPSHOT_KEY);
    } catch (e) {
      /* diabaikan */
    }
  }

  const api = {
    SCORE_KEY: SCORE_KEY,
    GAME1_STATE_KEY: GAME1_STATE_KEY,
    DEFAULT_SCORE: DEFAULT_SCORE,
    isValidGame1State: isValidGame1State,
    saveGame1State: saveGame1State,
    loadGame1State: loadGame1State,
    clearGame1State: clearGame1State,
    GAME2_STATE_KEY: GAME2_STATE_KEY,
    isValidGame2State: isValidGame2State,
    saveGame2State: saveGame2State,
    loadGame2State: loadGame2State,
    clearGame2State: clearGame2State,
    GAME3_STATE_KEY: GAME3_STATE_KEY,
    isValidGame3State: isValidGame3State,
    saveGame3State: saveGame3State,
    loadGame3State: loadGame3State,
    clearGame3State: clearGame3State,
    isValidScore: isValidScore,
    computeTotal: computeTotal,
    getScore: getScore,
    saveGameScore: saveGameScore,
    resetScore: resetScore,
    getTotal: getTotal,
    SESSION_DONE_KEY: SESSION_DONE_KEY,
    RESULT_SNAPSHOT_KEY: RESULT_SNAPSHOT_KEY,
    isSessionFinished: isSessionFinished,
    markSessionDone: markSessionDone,
    isSessionDone: isSessionDone,
    isSessionDoneInCurrentTab: isSessionDoneInCurrentTab,
    clearSessionDone: clearSessionDone,
    saveResultSnapshot: saveResultSnapshot,
    getResultSnapshot: getResultSnapshot,
    clearResultSnapshot: clearResultSnapshot
  };

  // Objek global untuk browser (dan fungsi langsung agar bisa dipanggil game.js).
  root.ScoreStore = api;
  root.saveGameScore = saveGameScore;
  root.getScore = getScore;
  root.resetScore = resetScore;
  root.getTotal = getTotal;
  root.isSessionFinished = isSessionFinished;
  root.markSessionDone = markSessionDone;
  root.isSessionDone = isSessionDone;
  root.isSessionDoneInCurrentTab = isSessionDoneInCurrentTab;
  root.clearSessionDone = clearSessionDone;
  root.saveResultSnapshot = saveResultSnapshot;
  root.getResultSnapshot = getResultSnapshot;
  root.clearResultSnapshot = clearResultSnapshot;
  root.isValidGame1State = isValidGame1State;
  root.saveGame1State = saveGame1State;
  root.loadGame1State = loadGame1State;
  root.clearGame1State = clearGame1State;
  root.isValidGame2State = isValidGame2State;
  root.saveGame2State = saveGame2State;
  root.loadGame2State = loadGame2State;
  root.clearGame2State = clearGame2State;
  root.isValidGame3State = isValidGame3State;
  root.saveGame3State = saveGame3State;
  root.loadGame3State = loadGame3State;
  root.clearGame3State = clearGame3State;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
