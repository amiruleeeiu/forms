import { SecurityClearanceForm } from "@/forms/SecurityClearanceForm/SecurityClearanceForm";
import Link from "next/link";

export default function SecurityClearancePage() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <main className="mx-auto w-full max-w-3xl rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Link>
          <p className="text-sm text-muted-foreground">
            Please provide your information for security clearance
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight uppercase">
            Application for Security Clearance
          </h1>
        </div>
        <SecurityClearanceForm />
      </main>
    </div>
  );
}
