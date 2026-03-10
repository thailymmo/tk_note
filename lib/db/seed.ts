import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const email = "admin@admin.com";
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const password = await bcrypt.hash("admin123", 12);

  await db.insert(users).values({
    email,
    password,
    name: "Admin",
    role: "admin",
    maxNotes: 999,
  });

  console.log("Admin user created: admin@admin.com / admin123");
}

seed().catch(console.error);
