"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { AuthCard } from "@/components/shared/auth-card";
import { resetPassword } from "@/app/auth/actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    const result = await resetPassword({ token, email, password });
    if (result.error) {
      setLoading(false);
      toast.error(result.error);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    setDone(true);
  };

  if (!token || !email) {
    return (
      <AuthCard title="Invalid reset link" description="This password reset link is missing required information.">
        <Button render={<Link href="/auth/forgot-password" />} className="h-11 w-full cursor-pointer rounded-full">
          Request a new link
        </Button>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" description="You're signed in with your new password.">
        <div className="flex flex-col items-center gap-6 py-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircleIcon size={26} weight="fill" />
          </span>
          <Button render={<Link href="/dashboard" />} className="h-11 cursor-pointer rounded-full px-6">
            Go to Dashboard
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a new password for your account."
      footer={
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeftIcon size={13} /> Back to Sign In
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={8} className="h-11" />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 cursor-pointer rounded-full">
          {loading ? "Updating…" : "Update Password"} {!loading && <ArrowRightIcon size={16} weight="bold" />}
        </Button>
      </form>
    </AuthCard>
  );
}
