import Onoff from 'onoff';

const powerPin = 26;

function getGpio() {
  try {
    return new Onoff.Gpio(powerPin, 'out');
  } catch (error) {
    console.warn('Failed to create GPIO, It seems to be an unsupported os.');
    return { write: () => {} };
  }
}

const power = getGpio();

function turnOn() {
  power.write(1);
}

function turnOff() {
  power.write(0);
}

export = {
  turnOn,
  turnOff,
};
