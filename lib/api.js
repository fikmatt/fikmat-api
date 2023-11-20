const five = require("johnny-five");

class Api {
  constructor() {
    this.board = new five.Board({ repl: false });
    this.callbacks = {};

    this.board.on('ready', () => {
      this.board.info('Board', 'Ready')

      // TODO: initialize LEDs

      this.#runCallback('ready')
    });
  }

  on(callback, func) {
    this.callbacks[callback] = func
  }

  #runCallback(callback) {
    this.callbacks[callback].call()
  }
}

module.exports = new Api();
