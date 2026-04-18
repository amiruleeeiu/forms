import type { StepFormConfig } from "@/form-engine/types";

export const stepFormConfig: StepFormConfig = {
  mode: "stepped",
  submitLabel: "Complete Registration",
  steps: [
    // -----------------------------------------------------------------------
    // Step 1: Personal Information
    // -----------------------------------------------------------------------
    {
      id: "step-personal",
      title: "Personal",
      description: "Tell us about yourself",
      blocks: [
        {
          id: "personal-block",
          layout: "2-col",
          fields: [
            {
              name: "fullName",
              type: "text",
              label: "Full Name",
              required: true,
              placeholder: "e.g. Alice Smith",
              autoComplete: "name",
              validation: {
                minLength: 2,
                messages: { minLength: "Name must be at least 2 characters" },
              },
            },
            {
              name: "email",
              type: "email",
              label: "Email",
              required: true,
              placeholder: "you@example.com",
              autoComplete: "email",
            },
            {
              name: "phone",
              type: "phone",
              label: "Phone Number",
              required: true,
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 2: Address
    // -----------------------------------------------------------------------
    {
      id: "step-address",
      title: "Address",
      description: "Where are you located?",
      blocks: [
        {
          id: "address-block",
          layout: "2-col",
          fields: [
            {
              name: "country",
              type: "select",
              label: "Country",
              required: true,
              placeholder: "Select country",
              options: {
                type: "static",
                items: [
                  { label: "Bangladesh", value: "bd" },
                  { label: "India", value: "in" },
                  { label: "United States", value: "us" },
                ],
              },
            },
            {
              name: "district",
              type: "select",
              label: "District",
              required: false,
              placeholder: "Select district",
              disableWhen: { field: "country", operator: "falsy" },
              options: {
                type: "static",
                items: [
                  { label: "Dhaka", value: "dhaka" },
                  { label: "Chittagong", value: "chittagong" },
                  { label: "Sylhet", value: "sylhet" },
                ],
              },
            },
            {
              name: "upazila",
              type: "select",
              label: "Upazila",
              required: false,
              placeholder: "Select upazila",
              disableWhen: {
                field: "district",
                operator: "neq",
                value: "dhaka",
              },
              options: {
                type: "static",
                items: [
                  { label: "Dhanmondi", value: "dhanmondi" },
                  { label: "Mirpur", value: "mirpur" },
                  { label: "Gulshan", value: "gulshan" },
                ],
              },
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 3: Preferences (with nested conditional block)
    // -----------------------------------------------------------------------
    {
      id: "step-preferences",
      title: "Preferences",
      description: "Customize your experience",
      blocks: [
        {
          id: "skills-block",
          title: "Skills",
          layout: "single",
          fields: [
            {
              name: "skills",
              type: "checkbox-group",
              label: "Select your skills",
              required: true,
              validation: {
                messages: { required: "Select at least one skill" },
              },
              options: {
                type: "static",
                items: [
                  { label: "React", value: "react" },
                  { label: "TypeScript", value: "typescript" },
                  { label: "Node.js", value: "node" },
                  { label: "Python", value: "python" },
                ],
              },
            },
          ],
        },
        {
          id: "insurance-toggle-block",
          title: "Insurance",
          layout: "single",
          fields: [
            {
              name: "hasInsurance",
              type: "checkbox",
              label: "I have health insurance",
              required: false,
            },
          ],
        },
        {
          id: "insurance-details-block",
          title: "Insurance Details",
          layout: "single",
          showWhen: { field: "hasInsurance", operator: "truthy" },
          fields: [
            {
              name: "insuranceProvider",
              type: "select",
              label: "Insurance Provider",
              required: false,
              placeholder: "Select provider",
              options: {
                type: "static",
                items: [
                  { label: "MetLife", value: "metlife" },
                  { label: "Green Delta", value: "greendelta" },
                  { label: "Pragati Life", value: "pragati" },
                ],
              },
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 4: Terms & Conditions
    // -----------------------------------------------------------------------
    {
      id: "step-terms",
      title: "Terms",
      description: "Please review and accept the terms",
      blocks: [
        {
          id: "terms-block",
          layout: "single",
          fields: [
            {
              name: "acceptTerms",
              type: "checkbox",
              label: "I accept the Terms and Conditions",
              required: true,
              validation: {
                messages: { required: "You must accept the terms" },
              },
            },
          ],
        },
      ],
    },
  ],
};
