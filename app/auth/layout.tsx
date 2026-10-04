import Link from "next/link";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { AmbientScene } from "@/components/three/ambient-scene";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AppearanceButton } from "@/components/appearance/appearance-button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="hero-gradient absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 opacity-60">
        <AmbientScene variant="minimal" />
      </div>
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary via-lavender to-electric text-primary-foreground">
            <SparkleIcon size={16} weight="fill" />
          </span>
          <span className="font-display text-xl tracking-tight">Pairly</span>
        </Link>
        <AppearanceButton />
          <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
