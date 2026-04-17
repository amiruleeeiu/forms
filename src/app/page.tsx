import { ExampleForm } from "@/forms/ExampleForm/ExampleForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <main className="mx-auto w-full max-w-2xl rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Registration Form
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A full-featured example using React Hook Form, Zod, and shadcn/ui.
          </p>
        </div>
        <ExampleForm />
      </main>
    </div>
  );
}
