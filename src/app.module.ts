import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [UsersModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
