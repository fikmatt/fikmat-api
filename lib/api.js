const pixel = require('node-pixel');
const five = require('johnny-five');
const utility = require('./utility.js');

const LED_STRIP_FRONT_LENGTH = 15
const LED_STRIP_BACK_LENGTH = 10
const LED_STRIP_TOTAL_LENGTH = LED_STRIP_FRONT_LENGTH + LED_STRIP_BACK_LENGTH

class Api {
  constructor() {
    this.board = new five.Board({ repl: false });
    this.callbacks = {};

    this.board.on('ready', () => {
      this.ledStrip = new pixel.Strip({
        board: this.board,
        controller: 'FIRMATA',
        strips: [ { pin: 6, length: LED_STRIP_TOTAL_LENGTH }, ],
        gamma: 2.8,
      });

      this.board.on('exit', () => {
        this.ledStrip.off();
      });

      this.ledStrip.on('ready', () => {
        this.board.info('Board', 'Ready')

        this.#runCallback('ready')

        // test LED strip
        this.#updateLedStrip('left', [[255, 0, 255], [255, 0, 0], [0, 255, 0]])
      });
    });
  }

  on(callback, func) {
    this.callbacks[callback] = func
  }

  #runCallback(callback) {
    this.callbacks[callback].call()
  }

  #updateLedStrip(side, colors) {
    const colorsCount = colors.length;

    if (colorsCount == 0) { return }

    let offset = 0;

    if (colorsCount == 1) {
      const safeColor = utility.safeColorFromString(colors[0]);
      console.log(safeColor);
      for (let i = 0; i < LED_STRIP_TOTAL_LENGTH; i++) {
        this.ledStrip.pixel(offset + i).color(safeColor);
      }
    } else {
      this.#updateLedStripPixels(offset, LED_STRIP_FRONT_LENGTH, colors, colorsCount);

      colors = colors.reverse();
      this.#updateLedStripPixels(offset + LED_STRIP_FRONT_LENGTH, LED_STRIP_BACK_LENGTH, colors, colorsCount);
    }

    this.ledStrip.show();
  }

  #updateLedStripPixels(offset, count, colors, colorsCount) {
    for (let i = 0; i < colorsCount; i++) {
      const color = colors[i];
      const safeColor = utility.safeColorFromString(color);
      const newPos = Math.floor(utility.mapRange(i, 0, colorsCount, 0, count))

      for (let j = 0; j < count / colorsCount; j++) {
        this.ledStrip.pixel(offset + newPos + j).color(safeColor);
      }
    }
  }
}

module.exports = new Api();
