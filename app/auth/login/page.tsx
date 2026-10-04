"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { GoogleLogoIcon, AppleLogoIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/shared/password-input";
import { AuthCard } from "@/components/shared/auth-card";

const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogle = () => {
    if (!googleEnabled) {
      toast("This is a design preview — OAuth isn't wired up yet.");
      return;
    }
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast.error("Incorrect email or password.");
      return;
    }
    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to pick up where you left off."
      footer={
        <>
          New to Pairly?{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="h-11 cursor-pointer justify-center gap-2 rounded-full"
        >
          <GoogleLogoIcon size={17} weight="bold" /> {googleLoading ? "Redirecting…" : "Continue with Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => toast("This is a design preview — OAuth isn't wired up yet.")}
          className="h-11 cursor-pointer justify-center gap-2 rounded-full"
        >
          <AppleLogoIcon size={17} weight="fill" /> Continue with Apple
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" autoComplete="current-password" required className="h-11" />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 cursor-pointer rounded-full">
          {loading ? "Signing in…" : "Sign In"} {!loading && <ArrowRightIcon size={16} weight="bold" />}
        </Button>
      </form>
    </AuthCard>
  );
}
