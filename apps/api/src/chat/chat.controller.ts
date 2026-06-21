import { Controller, Post, Get, Body, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { QuotaService } from '../quota/quota.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('chat')
@UseGuards(ThrottlerGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private quotaService: QuotaService,
  ) {}

  @Get('history')
  async getHistory(@Req() req: FastifyRequest) {
    const userId = (req.user as any).sub;
    return this.chatService.getHistory(userId);
  }

  @Get(':id')
  async getMessages(@Param('id') id: string, @Req() req: FastifyRequest) {
    const userId = (req.user as any).sub;
    return this.chatService.getMessages(id, userId);
  }

  // Throttle to 5 requests per minute for chat streaming specifically
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  async streamChat(
    @Body() body: { conversationId?: string; message: string },
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const userId = (req.user as any).sub;

    // 1. Check quota
    await this.quotaService.checkAndIncrementQuota(userId);

    // 2. Resolve conversation
    let conversationId = body.conversationId;
    if (!conversationId) {
      const title = await this.chatService.generateTitle(body.message);
      const convo = await this.chatService.createConversation(userId, title);
      conversationId = convo.id;
    }

    // 3. Save user message
    await this.chatService.addMessage(conversationId, 'user', body.message);

    // 4. Stream response
    // We send conversationId as the first SSE event so the client knows it
    res.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.raw.write(`data: ${JSON.stringify({ conversationId })}\n\n`);

    await this.chatService.streamChat(conversationId, body.message, res.raw);
  }
}
