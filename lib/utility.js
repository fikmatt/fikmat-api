module.exports = {
  convertColor: (color) => {
    if(typeof color == "string" && color.startsWith('#')) {
      return [
        parseInt(color.slice(1, 3), 16) || 0,
        parseInt(color.slice(3, 5), 16) || 0,
        parseInt(color.slice(5, 7), 16) || 0
      ];
    }

    if (!Array.isArray(color) || color.length == 0) {
      return [0, 0, 0];
    }

    const rgbArray = color.map((value) => {
      let result = parseInt(value, 10) || 0;
      if (result > 255) {
        result = 255;
      } else if (result < 0) {
        result = 0;
      }
      return result;
    });

    if (rgbArray.length == 1) {
      rgbArray.push(colors[0], colors[0]);
    } else if (rgbArray.length == 2) {
      rgbArray.push(0);
    }

    return rgbArray.slice(0, 3)

  },

  mapRange: (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }
}
