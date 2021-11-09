johnny = require('johnny-five')
pixel = require('node-pixel')

Utils = require('./utils')

class Api
  LED_STRIP_LENGTH: 15
  LED_STRIP_PIN: 6
  MOTOR_PIN: 5

  constructor: ->
    self = @
    @callbacks = {}
    @board = new (johnny.Board)(repl: false)

    @board.on 'ready', ->
      self.board.info('Board', 'Ready')

      self.motor = new (johnny.Motor)(self.MOTOR_PIN)

      self.ledStrip = new (pixel.Strip)(
        data: self.LED_STRIP_PIN
        length: self.LED_STRIP_LENGTH
        color_order: pixel.COLOR_ORDER.GRB
        board: self.board
        controller: 'FIRMATA'
        gamma: 2.8
      )

      self.ledStrip.on 'ready', ->
        self.board.info('LED strip', 'Ready')

        self._runCallback 'ready'

    @board.on 'exit', ->
        self.ledStrip.off()
        self.motor.stop()

  post: (data) ->
    if data.led?
      @_updateLedStripColors(data.led)

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

  _updateLedStripColors: (colors) ->
    return if colors.length == 0

    if colors.length == 1
      # only one color
      c = Utils.safeColorFromString(colors[0])
      @ledStrip.color(c)
    else
      # more colors, remap color values to led strip size
      for color, i in colors
        newPos = Math.floor(Utils.mapRange(i, 0, colors.length, 0, @LED_STRIP_LENGTH))

        for j in [0...@LED_STRIP_LENGTH / colors.length]
          c = Utils.safeColorFromString(color)
          @ledStrip.pixel(newPos + j).color(c)

    @ledStrip.show()

module.exports = new Api
