import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Welcome to <span className="text-primary">UniNest</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-[600px]">
        The smart, secure hostel allocation platform for university students. Find your perfect space today.
      </p>
      <div className="flex gap-4">
        <Button size="lg" className="rounded-full shadow-lg hover:scale-105 transition-transform">Find a Hostel</Button>
        <Button size="lg" variant="outline" className="rounded-full hover:scale-105 transition-transform">List your Property</Button>
      </div>
    </div>
  );
}
