import Fs from 'fs';
import hashPassword from './hashPassword';

async function setPassword(password: string) {
  const configString = Fs.readFileSync('./serverConfig.json', 'utf8');
  const config = JSON.parse(configString);
  config.auth.password = await hashPassword(password);

  const newConfigString = JSON.stringify(config, undefined, 2);
  Fs.writeFile('./serverConfig.json', newConfigString, error => {
    if(!error) return console.log('Successfully set password.');
    console.error('Failed set password.');
    console.error(error);
  });
}

setPassword(process.argv[2]);
