const pixel = require('node-pixel');
const five = require('johnny-five');
const utility = require('./utility.js');

const PIXELS_LEFT_FRONT_COUNT = 105
const PIXELS_LEFT_BACK_COUNT = 0
const PIXELS_LEFT_TOTAL_COUNT = PIXELS_LEFT_FRONT_COUNT + PIXELS_LEFT_BACK_COUNT
const PIXELS_RIGHT_FRONT_COUNT = 103
const PIXELS_RIGHT_BACK_COUNT = 0
const PIXELS_RIGHT_TOTAL_COUNT = PIXELS_RIGHT_FRONT_COUNT + PIXELS_RIGHT_BACK_COUNT

class Api {
  constructor() {
    this.board = new five.Board({ repl: false });
    this.callbacks = {};

    this.board.on('ready', () => {
      this.ledStrip = new pixel.Strip({
        board: this.board,
        controller: 'FIRMATA',
        strips: [
          { pin: 6, length: PIXELS_LEFT_TOTAL_COUNT },
          { pin: 7, length: PIXELS_RIGHT_TOTAL_COUNT },
        ],
        gamma: 2.8,
      });

      this.ledStrip.pixelCounts = {
        left: {
          front: PIXELS_LEFT_FRONT_COUNT,
          back: PIXELS_LEFT_BACK_COUNT,
          total: PIXELS_LEFT_TOTAL_COUNT,
        },
        right: {
          offset: PIXELS_LEFT_TOTAL_COUNT,
          front: PIXELS_RIGHT_FRONT_COUNT,
          back: PIXELS_RIGHT_BACK_COUNT,
          total: PIXELS_RIGHT_TOTAL_COUNT,
        }
      };

      this.board.on('exit', () => {
        this.ledStrip.off();
      });

      this.ledStrip.on('ready', () => {
        this.board.info('Board', 'Ready');

        this.#runCallback('ready');
      });
    });
  }

  on(callback, func) {
    this.callbacks[callback] = func;
  }

  #runCallback(callback) {
    this.callbacks[callback].call();
  }

  #updateLedStrip(side, colors) {
    const colorsCount = colors.length;

    if (colorsCount == 0) { return }

    const pixelCounts = this.ledStrip.pixelCounts[side];
    const offset = pixelCounts['offset'] || 0;

    if (colorsCount == 1) {
      const rgbColor = utility.convertColor(colors[0]);

      for (let i = 0; i < pixelCounts['total']; i++) {
        this.ledStrip.pixel(offset + i).color(rgbColor);
      }
    } else {
      this.#updateLedStripPixels(offset, pixelCounts['front'], colors, colorsCount);

      colors = colors.reverse();
      this.#updateLedStripPixels(offset + pixelCounts['front'], pixelCounts['back'], colors, colorsCount);
    }
  }

  #updateLedStripPixels(offset, count, colors, colorsCount) {
    if (count == 0) { return }

    for (let i = 0; i < colorsCount; i++) {
      const color = colors[i];
      const rgbColor = utility.convertColor(color);
      const newPos = Math.floor(utility.mapRange(i, 0, colorsCount, 0, count))
      // console.log(rgbColor);
      for (let j = 0; j < count / colorsCount; j++) {
        this.ledStrip.pixel(offset + newPos + j).color(rgbColor);
      }
    }
  }

  update(data) {
    if(data['led_left']) {
      this.#updateLedStrip('left', data['led_left']);
    }

    if(data['led_right']) {
      this.#updateLedStrip('right', data['led_right']);
    }

    if(data['led_left'] || data['led_right']) {
      this.ledStrip.show();
    }
  }
}

module.exports = new Api();
