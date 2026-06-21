import { Injectable, ForbiddenException } from '@nestjs/common';
import { db, quotaUsage, subscriptions } from '@stem/database';
import { eq, and } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuotaService {
  constructor(private configService: ConfigService) {}

  async checkAndIncrementQuota(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get user subscription tier
    const subResult = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    const tier = subResult[0]?.tier || 'FREE';
    
    const limit = tier === 'PRO' 
      ? this.configService.get<number>('PRO_TIER_DAILY_LIMIT') || 200
      : this.configService.get<number>('FREE_TIER_DAILY_LIMIT') || 10;

    const quotaResult = await db
      .select()
      .from(quotaUsage)
      .where(and(eq(quotaUsage.userId, userId), eq(quotaUsage.date, today)))
      .limit(1);

    const currentUsage = quotaResult[0];

    if (!currentUsage) {
      await db.insert(quotaUsage).values({
        userId,
        date: today,
        requestsCount: 1,
      });
      return true;
    }

    if (currentUsage.requestsCount >= limit) {
      throw new ForbiddenException('Daily quota exceeded. Please upgrade to Pro.');
    }

    await db
      .update(quotaUsage)
      .set({ requestsCount: currentUsage.requestsCount + 1 })
      .where(eq(quotaUsage.id, currentUsage.id));

    return true;
  }
}
