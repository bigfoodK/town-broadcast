import Fs from 'fs';

interface ServerConfig {
  publicRoot: string,
  http: {
    port: number,
  },
  https: {
    port: number,
    keyPath: string,
    certPath: string,
  },
  amp: {
    pin: number,
  },
}

const defaultConfig: ServerConfig = {
  publicRoot: '../client/build',
  http: {
    port: 3000,
  },
  https: {
    port: 3001,
    keyPath: './key/key.pem',
    certPath: './key/cert.pem',
  },
  amp: {
    pin: 26,
  },
}

function checkConfigFile(piece: any, defaultPiece: any) {
  let resultPiece: any;

  if (typeof defaultPiece === 'object') {
    resultPiece = {};
    Object.keys(defaultPiece).forEach(key => {
      resultPiece[key] = (typeof piece[key] === 'undefined')
        ? defaultPiece[key]
        : checkConfigFile(piece[key], defaultPiece[key]);
    });
  } else {
    resultPiece = (typeof piece === undefined)
      ? defaultPiece
      : piece;
  }

  return resultPiece;
}

function renewConfigFile(inputConfig: ServerConfig): ServerConfig {
  const config = checkConfigFile(inputConfig, defaultConfig) as ServerConfig;
  const configString = JSON.stringify(config, undefined, 2);

  // TODO: Find better condition
  const shouldRenew = !(configString === JSON.stringify(inputConfig, undefined, 2));
  if(shouldRenew) {
    Fs.writeFile('./serverConfig.json', configString, error => {
      if(!error) return console.log('Renewed configuration file.');
      console.error('Failed to renew configuration file.');
      console.error(error) 
    });
  }

  return config;
}

function makeConfigFile() {
  const configString = JSON.stringify(defaultConfig, undefined, 2);

  Fs.writeFile('./serverConfig.json', configString, error => {
    if(!error) return console.log('Created a configuration file.');
    console.error('Failed to create configuration file.');
    console.error(error) 
  });
}

function getConfigFile(): ServerConfig {
  try {
    const inputConfigString = Fs.readFileSync('./serverConfig.json', 'utf8');
    const inputConfig = JSON.parse(inputConfigString);
    const config = renewConfigFile(inputConfig);
    return config;
  } catch (error) {
    if(error.code !== 'ENOENT') throw error;
    makeConfigFile();
    return defaultConfig;
  }
}

export = getConfigFile();