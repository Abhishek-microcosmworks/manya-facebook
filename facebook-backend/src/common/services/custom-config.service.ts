import { Injectable } from '@nestjs/common';
import config from '../properties';

@Injectable()
export class CustomConfigService {
  static PROPERTIES: any;

  constructor() {
    if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == '') {
      CustomConfigService.PROPERTIES = config.development();
    }

    if (process.env.NODE_ENV == 'production') {
      CustomConfigService.PROPERTIES = config.production();
    }
  }
}
