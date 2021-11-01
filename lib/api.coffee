johnny = require('johnny-five')

class Api
  constructor: ->
    self = @
    @callbacks = {}
    @board = new (johnny.Board)(repl: false)

    @board.on 'ready', ->
      self.board.info("Board", "Ready")

      self.led = new (johnny.Led)(6)

      self.runCallback('ready')

  post: (body) ->
    console.log body

  on: (callback, func) ->
    @callbacks[callback] = func

  runCallback: (callback) ->
    @callbacks[callback].call()

module.exports = new Api
