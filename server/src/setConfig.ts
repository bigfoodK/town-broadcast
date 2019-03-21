import Fs from 'fs';
import Readline from 'readline';
import generateConfigFile from './serverConfig';
import hashPassword from './hashPassword';

let stage = 0;

const informMessage = [
  '\nEnter password',
  '\nEnter E-mail address',
  '\nEnter domain name',
];

function inform() {
  if(stage > 2) return;
  console.log(informMessage[stage++]);
}

const input: string[] = [];

const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
inform();
readline.on('line', line => {
  inform();
  input.push(...line.split(' '));
});
readline.on('close', () => {
  generateConfigFile;
  setConfig();
});

async function setConfig() {
  const configString = Fs.readFileSync('./serverConfig.json', 'utf8');
  const config = JSON.parse(configString);
  config.auth.password = await hashPassword(input[0]);
  config.greenlock.email = input[1];
  config.greenlock.approveDomains = input.slice(2);

  const newConfigString = JSON.stringify(config, undefined, 2);
  Fs.writeFile('./serverConfig.json', newConfigString, error => {
    if(!error) return console.log('Successfully set config.');
    console.error('Failed set config.');
    console.error(error);
  });
}
