import Link from "next/link";
import { HouseIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { AmbientScene } from "@/components/three/ambient-scene";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="hero-gradient absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 opacity-70">
        <AmbientScene variant="soft" />
      </div>
      <span className="font-display text-8xl text-primary/80">404</span>
      <h1 className="mt-4 text-balance font-display text-3xl">This card seems to have drifted away</h1>
      <p className="mt-3 max-w-sm text-balance text-muted-foreground">
        The page you're looking for doesn't exist, or may have been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href="/" />} size="lg" className="h-11 cursor-pointer rounded-full px-6">
          <HouseIcon size={16} weight="fill" /> Back Home
        </Button>
        <Button render={<Link href="/cards" />} variant="outline" size="lg" className="h-11 cursor-pointer rounded-full px-6">
          <MagnifyingGlassIcon size={16} /> Browse Cards
        </Button>
      </div>
    </div>
  );
}
