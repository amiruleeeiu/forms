import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const exampleFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),

  age: z
    .number({ error: "Age must be a number" })
    .min(1, "Minimum age is 1")
    .max(120, "Maximum age is 120"),

  dateOfBirth: z.date({ error: "Date of birth is required" }),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => {
        try {
          return isValidPhoneNumber(val);
        } catch {
          return false;
        }
      },
      { message: "Enter a valid phone number (e.g. +1 555 123 4567)" },
    ),

  gender: z.enum(["male", "female", "other"], {
    error: "Please select a gender",
  }),

  skills: z.array(z.string()).min(1, "Please select at least one skill"),

  country: z.string().min(1, "Please select a country"),

  city: z.string().min(1, "Please select a city"),

  acceptTerms: z.literal(true, "You must accept the terms and conditions"),
});

export type ExampleFormValues = z.infer<typeof exampleFormSchema>;

// Static data used by the form
export const COUNTRY_OPTIONS = [
  { label: "United States", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "United Kingdom", value: "gb" },
  { label: "Australia", value: "au" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Japan", value: "jp" },
  { label: "India", value: "in" },
];

export const CITY_OPTIONS = [
  { label: "New York", value: "new-york" },
  { label: "Los Angeles", value: "los-angeles" },
  { label: "Chicago", value: "chicago" },
  { label: "Toronto", value: "toronto" },
  { label: "Vancouver", value: "vancouver" },
  { label: "London", value: "london" },
  { label: "Manchester", value: "manchester" },
  { label: "Sydney", value: "sydney" },
  { label: "Melbourne", value: "melbourne" },
  { label: "Berlin", value: "berlin" },
  { label: "Paris", value: "paris" },
  { label: "Tokyo", value: "tokyo" },
  { label: "Mumbai", value: "mumbai" },
];

export const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export const SKILL_OPTIONS = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "React", value: "react" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "SQL", value: "sql" },
  { label: "Docker", value: "docker" },
  { label: "AWS", value: "aws" },
];

export const EXAMPLE_FORM_DEFAULTS: Partial<ExampleFormValues> = {
  name: "",
  phone: "",
  skills: [],
  country: "",
  city: "",
};
