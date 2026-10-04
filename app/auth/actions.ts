"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { SITE_URL } from "@/lib/site";

const signUpSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export async function signUp(input: { firstName: string; lastName: string; email: string; password: string }) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }
  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  await prisma.user.create({
    data: {
      email,
      name: `${firstName} ${lastName}`.trim(),
      password: await hashPassword(password),
    },
  });

  return { success: true as const };
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { password: true } });

  // Always report success regardless of whether the account exists (or is
  // OAuth-only, with no password to reset) — this avoids leaking which
  // emails are registered.
  if (user?.password) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
    await prisma.verificationToken.create({ data: { identifier: normalizedEmail, token: hashedToken, expires } });

    const resetUrl = `${SITE_URL}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
    // No transactional email provider is configured yet — log the link so the
    // flow can be tested locally. Swap this for a real email send (Resend/
    // SendGrid/SES) before shipping to real users.
    console.log(`[password reset] ${normalizedEmail} → ${resetUrl}`);
  }

  return { success: true as const };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export async function resetPassword(input: { token: string; email: string; password: string }) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form and try again." };

  const hashedToken = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.verificationToken.findUnique({ where: { token: hashedToken } });

  if (!record || record.identifier !== parsed.data.email || record.expires < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { email: parsed.data.email },
    data: { password: await hashPassword(parsed.data.password) },
  });
  await prisma.verificationToken.delete({ where: { token: hashedToken } });

  return { success: true as const };
}
