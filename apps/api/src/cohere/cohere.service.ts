import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CohereClientV2 } from 'cohere-ai';

@Injectable()
export class CohereService {
  private cohere: CohereClientV2;

  constructor(private configService: ConfigService) {
    this.cohere = new CohereClientV2({
      token: this.configService.get<string>('COHERE_API_KEY') || '',
    });
  }

  async streamChat(messages: any[]) {
    return await this.cohere.chatStream({
      model: 'command-a-plus-05-2026',
      messages,
      temperature: 0.3,
    });
  }
}
