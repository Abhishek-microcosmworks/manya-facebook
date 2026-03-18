import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class NetworkService {
  getServerIp(): string {
    const networkInterfaces = os.networkInterfaces();

    for (const interfaceName in networkInterfaces) {
      const networkInterface = networkInterfaces[interfaceName];

      if (networkInterface) {
        for (const config of networkInterface) {
          // Check if the address is IPv4 and not internal (e.g., not localhost)
          if (config.family === 'IPv4' && !config.internal) {
            return config.address;
          }
        }
      }
    }

    throw new Error('Unable to determine the server IP address');
  }
}
