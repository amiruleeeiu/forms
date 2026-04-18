"use client";

import {
  CheckboxField,
  CheckboxGroupField,
  DatePickerField,
  NumberInputField,
  PhoneInputField,
  RadioGroupField,
  SearchableSelectField,
  SelectField,
  TextInputField,
} from "@/components/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  CITY_OPTIONS,
  COUNTRY_OPTIONS,
  EXAMPLE_FORM_DEFAULTS,
  exampleFormSchema,
  GENDER_OPTIONS,
  SKILL_OPTIONS,
  type ExampleFormValues,
} from "./schema";

export function ExampleForm() {
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const form = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: EXAMPLE_FORM_DEFAULTS,
    mode: "onTouched",
  });

  const { isSubmitting, isSubmitSuccessful } = form.formState;

  async function onSubmit(data: ExampleFormValues) {
    // Simulate async API call
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    setSubmitResult(JSON.stringify(data, null, 2));
    console.log("Form submitted:", data);
  }

  function handleReset() {
    form.reset(EXAMPLE_FORM_DEFAULTS);
    setSubmitResult(null);
  }

  if (isSubmitSuccessful && submitResult) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <h2 className="mb-2 font-semibold text-green-800 dark:text-green-200">
            Form submitted successfully!
          </h2>
          <pre className="overflow-auto text-xs text-green-700 dark:text-green-300">
            {submitResult}
          </pre>
        </div>
        <Button variant="outline" onClick={handleReset}>
          Reset &amp; Fill Again
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-label="Example registration form"
        className="flex flex-col gap-6"
      >
        {/* Section: Personal Info */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-base font-semibold">
            Personal Information
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInputField
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              required
              autoComplete="name"
            />
            <NumberInputField
              name="age"
              label="Age"
              placeholder="25"
              required
              min={1}
              max={120}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DatePickerField
              name="dateOfBirth"
              label="Date of Birth"
              placeholder="Pick a date"
              required
              maxDate={new Date()}
            />
            <PhoneInputField
              name="phone"
              label="Phone Number"
              placeholder="+1 555 123 4567"
              required
            />
          </div>
        </fieldset>

        {/* Section: Identity */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-base font-semibold">Identity</legend>
          <RadioGroupField
            name="gender"
            label="Gender"
            options={GENDER_OPTIONS}
            required
          />
          <CheckboxGroupField
            name="skills"
            label="Skills"
            options={SKILL_OPTIONS}
            required
            description="Select all that apply."
          />
        </fieldset>

        {/* Section: Location */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-base font-semibold">Location</legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              name="country"
              label="Country"
              placeholder="Select a country"
              options={COUNTRY_OPTIONS}
              required
            />
            <SearchableSelectField
              name="city"
              label="City"
              placeholder="Search cities…"
              options={CITY_OPTIONS}
              required
            />
          </div>
        </fieldset>

        {/* Section: Terms */}
        <CheckboxField
          name="acceptTerms"
          label="I agree to the Terms of Service and Privacy Policy"
          required
        />

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
