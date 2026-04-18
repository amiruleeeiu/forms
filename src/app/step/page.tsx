import { StepForm } from "@/forms/StepForm/StepForm";
import Link from "next/link";

export default function StepFormPage() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <main className="mx-auto w-full max-w-2xl rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Step Form</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A multi-step registration form with per-step validation.
          </p>
        </div>
        <StepForm />
      </main>
    </div>
  );
}
