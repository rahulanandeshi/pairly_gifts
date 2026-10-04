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
import { signUp } from "@/app/auth/actions";

const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function SignUpPage() {
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
    const input = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const result = await signUp(input);
    if (result.error) {
      setLoading(false);
      toast.error(result.error);
      return;
    }

    await signIn("credentials", { email: input.email, password: input.password, redirect: false });
    setLoading(false);
    toast.success("Welcome to Pairly!", { description: "Your account has been created." });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthCard
      title="Create your account"
      description="Start sending cards that feel personal — free forever plan included."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
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
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" autoComplete="given-name" required className="h-11" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" autoComplete="family-name" required className="h-11" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required className="h-11" minLength={8} />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 cursor-pointer rounded-full">
          {loading ? "Creating account…" : "Create Account"} {!loading && <ArrowRightIcon size={16} weight="bold" />}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
