const { SerialPort } = require('serialport');

class LedPanel {
  constructor(port, baudRate, readyCallback) {
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
    this.#writePixels(data.values);
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
