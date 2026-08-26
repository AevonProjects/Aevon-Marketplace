import { NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128)
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse({
    email: form.get("email"),
    password: form.get("password")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid login." }, { status: 401 });
  }

  const valid = await argon2.verify(user.passwordHash, parsed.data.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid login." }, { status: 401 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
