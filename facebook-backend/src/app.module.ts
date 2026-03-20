import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { User, UserSchema } from 'models/user';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user/user.module';
import { ThirdPartyModule } from './third-party/third-party.module';
import { CommonModule } from './common/common.module';
import { FriendsModule } from './friends/friends.module';
import { BootstrapService } from './bootstrap.service';
import { NetworkService } from './utils/services/network.service';
import { AppController } from './app.controller';
import { APIUrlLoggerMiddleware } from './middlewares';
import { DatabaseConfigService } from 'config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MulterModule.register(),
    AuthModule,
    UserModule,
    ThirdPartyModule,
    CommonModule,
    FriendsModule,
  ],
  providers: [BootstrapService, NetworkService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(APIUrlLoggerMiddleware).forRoutes('*');
  }
}
