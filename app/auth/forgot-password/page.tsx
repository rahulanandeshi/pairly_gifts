"use client";

import * as React from "react";
import Link from "next/link";
import { EnvelopeSimpleIcon, ArrowRightIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/shared/auth-card";
import { requestPasswordReset } from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description={`If an account exists for ${email}, we've sent a link to reset your password.`}
      >
        <div className="flex flex-col items-center gap-6 py-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <EnvelopeSimpleIcon size={26} weight="duotone" />
          </span>
          <Button render={<Link href="/auth/login" />} variant="outline" className="h-11 cursor-pointer rounded-full px-6">
            <ArrowLeftIcon size={15} /> Back to Sign In
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email associated with your account and we'll send a reset link."
      footer={
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeftIcon size={13} /> Back to Sign In
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 cursor-pointer rounded-full">
          {loading ? "Sending…" : "Send Reset Link"} {!loading && <ArrowRightIcon size={16} weight="bold" />}
        </Button>
      </form>
    </AuthCard>
  );
}
