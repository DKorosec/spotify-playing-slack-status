module.exports = {
  convertToMMSS(seconds) {
    const padZero = input => input.toString().padStart(2, '0');
    const mins = padZero(Math.floor(seconds / 60));
    const secs = padZero(seconds % 60);
    return `${mins}:${secs}`;
  }
};