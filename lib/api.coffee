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

    speed = Number(speed) || 0
    @motor.start(speed)

    if speed > 0
      self = @
      @motorStopTimer = setTimeout ->
        self.motor.stop()
      , 150

  _updateLedStripColors: (colors) ->
    if colors.length == 1
      c = Utils.safeColorFromString(colors[0])
      @ledStrip.color(c)
    else
      segmentLength = @LED_STRIP_LENGTH / colors.length
      isFloat = segmentLength % 1 != 0
      segmentLength = Math.floor(segmentLength)
      last = colors.length - 1

      for color, i in colors
        segmentLength += 1 if isFloat && i == last

        for j in [0...segmentLength]
          c = Utils.safeColorFromString(color)
          @ledStrip.pixel(i * segmentLength + j).color(c)

    @ledStrip.show()

module.exports = new Api
