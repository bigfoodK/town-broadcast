import Crypto from 'crypto';
import ServerConfig from './serverConfig';

export default function hashPassword(password: string) {
  return new Promise((resolve, reject) => {
    Crypto.pbkdf2(password, 
      ServerConfig.auth.salt, 
      ServerConfig.auth.repeatTime,
      64,
      'sha512',
      (error, key) => {
        if(error) return reject(error);
        resolve(key.toString('base64'));
      });
  });
}
