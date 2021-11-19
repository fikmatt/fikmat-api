johnny = require('johnny-five')
pixel = require('node-pixel')

Utils = require('./utils')

class Api
  LED_STRIP_FRONT_LENGTH: 10
  LED_STRIP_BACK_LENGTH: 5
  LED_STRIP_OUTER_LENGTH: 10 + 5
  LED_STRIP_INNER_LENGTH: 6
  LED_STRIP_TOTAL_LENGTH: 10 + 5 + 6
  MOTOR_PIN: 5

  constructor: ->
    self = @
    @callbacks = {}
    @board = new (johnny.Board)(repl: false)

    @board.on 'ready', ->
      self.board.info('Board', 'Ready')

      self.motor = new (johnny.Motor)(self.MOTOR_PIN)

      self.ledStrips = new (pixel.Strip)(
        board: self.board
        controller: "I2CBACKPACK"
        color_order: pixel.COLOR_ORDER.GRB
        strips: [self.LED_STRIP_OUTER_LENGTH,
                 self.LED_STRIP_INNER_LENGTH,
                 self.LED_STRIP_OUTER_LENGTH,
                 self.LED_STRIP_INNER_LENGTH]
        gamma: 2.8
      )

      self.ledStrips.on 'ready', ->
        self.board.info('LED strips', 'Ready')

        self._runCallback 'ready'

    @board.on 'exit', ->
        self.ledStrips.off()
        self.motor.stop()

  post: (data) ->
    if data.led_right?
      @_updateLedStripColors("right", data.led_right)

    if data.led_left?
      @_updateLedStripColors("left", data.led_left)

    if data.led_right? || data.led_left?
      @ledStrips.show()

    if data.vibrate?
      @_startMotor(data.vibrate)

  on: (callback, func) ->
    @callbacks[callback] = func

  _runCallback: (callback) ->
    @callbacks[callback].call()

  _startMotor: (speed) ->
    clearTimeout(@motorStopTimer)

    speed = parseInt(speed) || 0

    if speed == 0
      @motor.stop()
      return

    # limit speed value, min 0, max 99
    speed = Math.min(Math.max(speed, 0), 99)
    # remap speed value to 0-255
    speed = Math.round(Utils.mapRange(speed, 0, 99, 0, 255))
    @motor.start(speed)

    self = @
    @motorStopTimer = setTimeout ->
      self.motor.stop()
    , 150

  _updateLedStripColors: (position, colors) ->
    colorsLength = colors.length

    return if colorsLength == 0

    offset = switch position
             when "left" then 0
             when "right" then @LED_STRIP_TOTAL_LENGTH

    if colorsLength == 1
      # only one color
      c = Utils.safeColorFromString(colors[0])
      for j in [0...@LED_STRIP_TOTAL_LENGTH]
        @ledStrips.pixel(offset + j).color(c)
    else
      # more colors, remap color values to led strip sizes
      for color, i in colors
        newPos = Math.floor(Utils.mapRange(i, 0, colorsLength, 0, @LED_STRIP_FRONT_LENGTH))

        for j in [0...@LED_STRIP_FRONT_LENGTH / colorsLength]
          c = Utils.safeColorFromString(color)
          @ledStrips.pixel(offset + newPos + j).color(c)

      colorsReversed = colors.reverse()

      offset += @LED_STRIP_FRONT_LENGTH
      for color, i in colorsReversed
        newPos = Math.floor(Utils.mapRange(i, 0, colorsLength, 0, @LED_STRIP_BACK_LENGTH))

        for j in [0...@LED_STRIP_BACK_LENGTH / colorsLength]
          c = Utils.safeColorFromString(color)
          @ledStrips.pixel(offset + newPos + j).color(c)

      offset += @LED_STRIP_BACK_LENGTH
      for color, i in colorsReversed
        newPos = Math.floor(Utils.mapRange(i, 0, colorsLength, 0, @LED_STRIP_INNER_LENGTH))

        for j in [0...@LED_STRIP_INNER_LENGTH / colorsLength]
          c = Utils.safeColorFromString(color)
          @ledStrips.pixel(offset + newPos + j).color(c)

module.exports = new Api
