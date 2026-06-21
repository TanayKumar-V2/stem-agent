import { Injectable } from '@nestjs/common';
import { db, users } from '@stem/database';
import { eq } from 'drizzle-orm';
import { RegisterDto } from '@stem/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersRepository {
  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async create(data: RegisterDto) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const result = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
      })
      .returning();
      
    return result[0];
  }
}
