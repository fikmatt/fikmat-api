module.exports = {
  safeColorFromString: (rgbArray) => {
    if (!Array.isArray(rgbArray) || rgbArray.length == 0) {
      return [0, 0, 0];
    }

    const colors = rgbArray.map((color) => {
      let c = parseInt(color, 10) || 0;
      if (c > 255) {
        c = 255;
      } else if (c < 0) {
        c = 0;
      }
      return c;
    });

    if (colors.length == 1) {
      colors.push(colors[0], colors[0]);
    } else if (colors.length == 2) {
      colors.push(0);
    }

    return colors.slice(0, 3)

  },

  mapRange: (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }
}
