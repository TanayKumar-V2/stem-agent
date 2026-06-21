import { Injectable, NotFoundException } from '@nestjs/common';
import { db, conversations, messages } from '@stem/database';
import { eq, desc } from 'drizzle-orm';
import { CohereService } from '../cohere/cohere.service';

const ARYAN_SYSTEM_PROMPT = `You are Aryan, a senior full-stack software engineer with 10+ years of production experience building scalable SaaS platforms.
You have deep expertise in: NestJS, TypeScript, PostgreSQL, Drizzle ORM, Next.js 15 App Router, React 19, Auth flows, etc.
You write production-quality code. You never use deprecated APIs.`;

@Injectable()
export class ChatService {
  constructor(private cohereService: CohereService) {}

  async getHistory(userId: string) {
    return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
  }

  async getMessages(conversationId: string, userId: string) {
    const convo = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!convo[0] || convo[0].userId !== userId) {
      throw new NotFoundException('Conversation not found');
    }
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createConversation(userId: string, title: string) {
    const res = await db.insert(conversations).values({ userId, title }).returning();
    return res[0];
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    const res = await db.insert(messages).values({ conversationId, role, content }).returning();
    return res[0];
  }

  async generateTitle(content: string) {
    // Basic title generation for now
    return content.slice(0, 30) + (content.length > 30 ? '...' : '');
  }

  async streamChat(conversationId: string, userMessage: string, resRaw: any) {
    resRaw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const previousMessages = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
    
    const cohereMessages = [
      { role: 'system', content: ARYAN_SYSTEM_PROMPT },
      ...previousMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const stream = await this.cohereService.streamChat(cohereMessages);

    let assistantResponse = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content-delta') {
        const text = chunk.delta?.message?.content?.text || '';
        assistantResponse += text;
        
        // SSE format
        resRaw.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Save assistant message to DB
    await this.addMessage(conversationId, 'assistant', assistantResponse);
    
    // Update conversation updatedAt
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));

    resRaw.write(`data: [DONE]\n\n`);
    resRaw.end();
  }
}
