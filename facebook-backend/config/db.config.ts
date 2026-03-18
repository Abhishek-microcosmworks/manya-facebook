import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CustomConfigService } from 'src/common/services';

dotenv.config();

@Injectable()
export class DatabaseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    const { username, password, host, port, database } =
      CustomConfigService.PROPERTIES.mongoDBConfig;

    const isAtlas = host.includes('mongodb.net'); // check for Atlas

    let mongodbConnectionUrl = '';
    const hasAuth = Boolean(username) && Boolean(password);
    const auth = hasAuth
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : '';

    if (isAtlas) {
      // MongoDB Atlas URL format
      mongodbConnectionUrl =
        'mongodb+srv://' +
        // username +
        // ':' +
        // password +
        // '@' +
        auth +
        host +
        '/' +
        database;
    } else {
      // Regular MongoDB URL format with optional port
      mongodbConnectionUrl =
        'mongodb://' +
        // username +
        // ':' +
        // password +
        // '@' +
        auth +
        host +
        (port ? ':' + port : '') + // Only append port if provided
        '/' +
        database;
    }

    return {
      uri: mongodbConnectionUrl,
    };
  }
}
