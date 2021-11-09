Utils =
  safeColorFromString: (rgb_array) ->
    return [0, 0, 0] unless Array.isArray(rgb_array) && rgb_array.length > 0

    length = rgb_array.length
    colors = rgb_array.map (color) ->
      c = parseInt(color, 10) || 0
      if color > 255
        c = 255
      else if color < 0
        c = 0
      return c

    if colors.length == 1
      colors.push(colors[0], colors[0])
    else if colors.length == 2
      colors.push(0)

    return colors.slice(0, 3)

  mapRange: (value, low1, high1, low2, high2) ->
    low2 + (high2 - low2) * (value - low1) / (high1 - low1)

module.exports = Utils
