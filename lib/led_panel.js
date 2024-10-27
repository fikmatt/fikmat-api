const { SerialPort } = require('serialport');

class LedPanel {
  constructor(port, baudRate, readyCallback) {
    this.width = 32;
    this.height = 16;

    this.port = new SerialPort({
      path: port,
      baudRate: baudRate
    })

    this.port.on('error', function(err) {
      console.log('LedPanel:', err.message)
    })

    this.port.on('open', () => {
      console.log('LedPanel: Serial port open:', port);
      readyCallback();
    });
  }

  writeData(data) {
    console.log('Matrix:', data);

    if (data[0].constructor === Array) {
      this.#writePixels(data);
    } else if (data[0].constructor === Object) {
      this.#writeCommands(data);
    }
  }

  #writeCommands(data) {
    this.matrix = Array.from({ length: this.height }, () => Array(this.width).fill(0));

    data.forEach(command => {
      switch (command.command) {
      case 'circle':
        this.#drawCircleInMatrix(command.x, command.y, command.radius);
        break;
      case 'line':
        this.#drawLineInMatrix(command.x1, command.y1, command.x2, command.y2);
        break;
      case 'box':
        this.#drawBoxInMatrix(command.x1, command.y1, command.x2, command.y2);
        break;
      }
    });

    this.#writePixels(this.matrix);
  }

  #drawPixelInMatrix(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.matrix[y][x] = value;
    }
  }

  #drawCircleInMatrix(xCenter, yCenter, radius) {
    let x = 0;
    let y = radius;
    let d = 1 - radius;

    while (x <= y) {
      this.#drawPixelInMatrix(xCenter + x, yCenter + y, 1);
      this.#drawPixelInMatrix(xCenter - x, yCenter + y, 1);
      this.#drawPixelInMatrix(xCenter + x, yCenter - y, 1);
      this.#drawPixelInMatrix(xCenter - x, yCenter - y, 1);
      this.#drawPixelInMatrix(xCenter + y, yCenter + x, 1);
      this.#drawPixelInMatrix(xCenter - y, yCenter + x, 1);
      this.#drawPixelInMatrix(xCenter + y, yCenter - x, 1);
      this.#drawPixelInMatrix(xCenter - y, yCenter - x, 1);

      if (d < 0) {
        d += 2 * x + 3;
      } else {
        d += 2 * (x - y) + 5;
        y--;
      }
      x++;
    }
  }

  #drawLineInMatrix(x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.#drawPixelInMatrix(x0, y0, 1); // Set the pixel to "on" in the matrix

      if (x0 === x1 && y0 === y1) break;

      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  #drawBoxInMatrix(x0, y0, x1, y1) {
    this.#drawLineInMatrix(x0, y0, x1, y0);
    this.#drawLineInMatrix(x1, y0, x1, y1);
    this.#drawLineInMatrix(x1, y1, x0, y1);
    this.#drawLineInMatrix(x0, y1, x0, y0);
  }

  #writePixels(data) {
    const pixelData = data.flat().join('');

    this.port.write(pixelData + '\n', (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
    });
  }
}

module.exports = LedPanel;
