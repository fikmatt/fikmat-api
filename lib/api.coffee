johnny = require('johnny-five')
pixel = require('node-pixel')

class Api
  constructor: ->
    self = @
    @callbacks = {}
    @board = new (johnny.Board)(repl: false)

    @led_strip_length = 15

    @board.on 'ready', ->
      self.board.info('Board', 'Ready')

      self.led_strip = new (pixel.Strip)(
        data: 6
        length: self.led_strip_length
        color_order: pixel.COLOR_ORDER.GRB
        board: this
        controller: 'FIRMATA'
      )

      self.led_strip.on 'ready', ->
        self.board.info('LED strip', 'Ready')

        self.runCallback 'ready'

    @board.on 'exit', ->
        self.led_strip.off()

  post: (body) ->
    if body.led
      if body.led.length == 1
        @led_strip.color(body.led[0])
      else
        for i in [0...@led_strip_length]
          if body.led[i]
            color = body.led[i]
          else
            color = [0, 0, 0]

          @led_strip.pixel(i).color(color)

      @led_strip.show()

  on: (callback, func) ->
    @callbacks[callback] = func

  runCallback: (callback) ->
    @callbacks[callback].call()

module.exports = new Api
