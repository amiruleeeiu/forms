import { ExampleForm } from "@/forms/ExampleForm/ExampleForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <main className="mx-auto w-full max-w-2xl space-y-8">
        <div className="rounded-xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              Registration Form
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              A full-featured example using React Hook Form, Zod, and shadcn/ui.
            </p>
          </div>
          <ExampleForm />
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">More Forms</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/conditional"
              className="flex-1 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium">Conditional Form</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fields that show, hide, or disable based on other values.
              </p>
            </Link>
            <Link
              href="/step"
              className="flex-1 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium">Step Form</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Multi-step registration with per-step validation.
              </p>
            </Link>
            <Link
              href="/security-clearance"
              className="flex-1 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium">Security Clearance</p>
              <p className="mt-1 text-sm text-muted-foreground">
                7-step application form with file uploads and conditional
                blocks.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
