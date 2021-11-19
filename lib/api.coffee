johnny = require('johnny-five')
pixel = require('node-pixel')

Utils = require('./utils')

class Api
  LED_STRIP_LENGTH: 15
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
        strips: [self.LED_STRIP_LENGTH, self.LED_STRIP_LENGTH]
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
    return if colors.length == 0

    offset = switch position
             when "left" then 0
             when "right" then @LED_STRIP_LENGTH

    if colors.length == 1
      # only one color
      c = Utils.safeColorFromString(colors[0])
      for j in [0...@LED_STRIP_LENGTH]
        @ledStrips.pixel(offset + j).color(c)
    else
      # more colors, remap color values to led strip size
      for color, i in colors
        newPos = Math.floor(Utils.mapRange(i, 0, colors.length, 0, @LED_STRIP_LENGTH))

        for j in [0...@LED_STRIP_LENGTH / colors.length]
          c = Utils.safeColorFromString(color)
          @ledStrips.pixel(offset + newPos + j).color(c)

    @ledStrips.show()

module.exports = new Api
