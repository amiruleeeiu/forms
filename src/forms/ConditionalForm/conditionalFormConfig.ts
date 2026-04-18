import type { NormalFormConfig } from "@/form-engine/types";

export const conditionalFormConfig: NormalFormConfig = {
  mode: "normal",
  submitLabel: "Save",
  resetLabel: "Reset",
  blocks: [
    // -----------------------------------------------------------------------
    // Block 1: Location — demonstrates disableWhen
    // -----------------------------------------------------------------------
    {
      id: "location-block",
      title: "Location",
      description: "Select your country and region",
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
          // disabled until a country is chosen
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
          // only enabled when district is Dhaka
          disableWhen: { field: "district", operator: "neq", value: "dhaka" },
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

    // -----------------------------------------------------------------------
    // Block 2: Insurance toggle
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // Block 3: Insurance details — showWhen hasInsurance truthy
    // -----------------------------------------------------------------------
    {
      id: "insurance-details-block",
      title: "Insurance Details",
      description: "Provide your insurance information",
      layout: "single",
      showWhen: { field: "hasInsurance", operator: "truthy" },
      fields: [
        {
          name: "insuranceProvider",
          type: "select",
          label: "Insurance Provider",
          required: true,
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
};
