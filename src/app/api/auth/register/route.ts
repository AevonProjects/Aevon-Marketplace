import { NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

const schema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[A-Za-z0-9_]+$/),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(10).max(128)
});

export async function POST(request: Request) {
  const form = await request.formData();

  const parsed = schema.safeParse({
    username: form.get("username"),
    email: form.get("email"),
    password: form.get("password")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const { username, email, password } = parsed.data;

  const exists = await db.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { id: true }
  });

  if (exists) {
    return NextResponse.json({ error: "Username or email is already registered." }, { status: 409 });
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id
  });

  const user = await db.user.create({
    data: { username, email, passwordHash },
    select: { id: true }
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
