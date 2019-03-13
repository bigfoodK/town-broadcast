import Onoff from 'onoff';

const powerPin = 26;
const power = new Onoff.Gpio(powerPin, 'out');

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
