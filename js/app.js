// Helper navigasi lintas halaman.
// Dipakai oleh game.js untuk berpindah ke halaman berikutnya.
function navigateTo(url) {
  window.location.href = url;
}

// Ekspos untuk lingkungan Node (pengujian); diabaikan di browser.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { navigateTo };
}
