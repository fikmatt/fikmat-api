const pixel = require('node-pixel');
const five = require('johnny-five');
const utility = require('./utility.js');
const LedPanel = require('./led_panel.js');

// TODO: move settings to constructor params
const LEDS_COUNT_LEFT_FRONT = 105
const LEDS_COUNT_LEFT_BACK = 89
const LEDS_COUNT_LEFT_TOTAL = LEDS_COUNT_LEFT_FRONT + LEDS_COUNT_LEFT_BACK
const LEDS_COUNT_RIGHT_FRONT = 103
const LEDS_COUNT_RIGHT_BACK = 90
const LEDS_COUNT_RIGHT_TOTAL = LEDS_COUNT_RIGHT_FRONT + LEDS_COUNT_RIGHT_BACK
const LEDS_GAMMA = 2.8

class Api {
  constructor() {
    this.boards = new five.Boards([
      { id: "left", repl: false, port: process.env.PORT_LED_STRIP_LEFT },
      { id: "right", repl: false, port: process.env.PORT_LED_STRIP_RIGHT },
    ]);
    this.ledStrips = {};
    this.callbacks = {};

    this.boards.on('ready', () => {
      const gamma = 2.8;

      this.ledStrips.left = new pixel.Strip({
        board: this.boards.byId("left"),
        controller: "FIRMATA",
        data: 6,
        length: LEDS_COUNT_LEFT_TOTAL,
        gamma: LEDS_GAMMA,
      });

      this.ledStrips.left.on('ready', () => {
        this.ledStrips.right = new pixel.Strip({
          board: this.boards.byId("right"),
          controller: 'FIRMATA',
          data: 6,
          length: LEDS_COUNT_RIGHT_TOTAL,
          gamma: LEDS_GAMMA
        });

        this.ledStrips.left.ledsCounts = {
          front: LEDS_COUNT_LEFT_FRONT,
          back: LEDS_COUNT_LEFT_BACK,
          total: LEDS_COUNT_LEFT_TOTAL,
        };
        this.ledStrips.right.ledsCounts = {
          front: LEDS_COUNT_RIGHT_FRONT,
          back: LEDS_COUNT_RIGHT_BACK,
          total: LEDS_COUNT_RIGHT_TOTAL,
        };

        this.ledStrips.right.on('ready', () => {
          this.boards.info('Boards', 'Ready');
          this.ledPanel = new LedPanel(process.env.PORT_LED_PANEL, 115200, () => {
            this.#runCallback('ready');
          });
        });

        this.boards.on('exit', () => {
          this.ledStrips.left.off();
          this.ledStrips.right.off();
        });
      });
    });
  }

  on(callback, func) {
    this.callbacks[callback] = func;
  }

  #runCallback(callback) {
    this.callbacks[callback].call();
  }

  #updateLedStrip(ledStrip, colors) {
    const colorsCount = colors.length;

    if (colorsCount == 0) return

    if (colorsCount == 1) {
      const rgbColor = utility.convertColor(colors[0]);

      ledStrip.color(rgbColor);
    } else {
      const ledsCounts = ledStrip.ledsCounts;

      // update back first
      this.#updateLedStripPixels(ledStrip, ledsCounts['front'], ledsCounts['back'], colors, colorsCount);

      // reverse colors and update front
      colors = colors.reverse();
      this.#updateLedStripPixels(ledStrip, 0, ledsCounts['front'], colors, colorsCount);
    }
  }

  #updateLedStripPixels(ledStrip, offset, count, colors, colorsCount) {
    if (count == 0) return

    for (let i = 0; i < colorsCount; i++) {
      const color = colors[i];
      const rgbColor = utility.convertColor(color);
      const newPos = Math.floor(utility.mapRange(i, 0, colorsCount, 0, count))

      for (let j = 0; j < count / colorsCount; j++) {
        ledStrip.pixel(offset + newPos + j).color(rgbColor);
      }
    }
  }

  #updateLedPanel(data) {
    this.ledPanel.writeData(data);
  }

  update(data) {
    if(data['led_left']) {
      this.#updateLedStrip(this.ledStrips.left, data['led_left']);
      this.ledStrips.left.show();
    }

    if(data['led_right']) {
      this.#updateLedStrip(this.ledStrips.right, data['led_right']);
      this.ledStrips.right.show();
    }

    if(data['led_panel']) {
      this.#updateLedPanel(data['led_panel']);
    }
  }
}

module.exports = new Api();
