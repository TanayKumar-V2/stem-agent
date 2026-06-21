import { pgTable, pgEnum, uuid, varchar, boolean, timestamp, text, integer, date, uniqueIndex } from 'drizzle-orm/pg-core';

export const tierEnum = pgEnum('tier', ['free', 'pro']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  tier: tierEnum('tier').default('free').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }).notNull(),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(), // 'pending' | 'active' | 'cancelled'
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).default('New Conversation').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),   // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  tokenCount: integer('token_count'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotaUsage = pgTable('quota_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({ uniq: uniqueIndex('quota_usage_user_date_idx').on(t.userId, t.date) }));
