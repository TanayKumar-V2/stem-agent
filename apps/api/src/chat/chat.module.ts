import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CohereModule } from '../cohere/cohere.module';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [CohereModule, QuotaModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
