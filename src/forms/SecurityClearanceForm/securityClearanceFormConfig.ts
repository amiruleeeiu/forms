import type { FieldConfig, StepFormConfig } from "@/form-engine/types";

// ---------------------------------------------------------------------------
// Shared helpers for Step 4: Residential Address
// ---------------------------------------------------------------------------

const LOCAL_ADDRESS_RESET_ON: string[] = [
  "accommodationType",
  "selfAccommodationStatus",
  "companyAccommodationStatus",
  "companyAccommodationLocation",
];

/** Standard local address fields — shared across all non-factory scenarios. */
const STANDARD_LOCAL_ADDRESS_FIELDS: FieldConfig[] = [
  {
    name: "localDivision",
    type: "select",
    label: "Division",
    placeholder: "Select One",
    options: { type: "api", url: "/api/locations/divisions" },
  },
  {
    name: "localDistrict",
    type: "select",
    label: "District",
    placeholder: "Select District",
    options: {
      type: "api",
      url: "/api/locations/districts",
      paramName: "divisionId",
      dependsOn: "localDivision",
    },
  },
  {
    name: "localPoliceStation",
    type: "select",
    label: "Police Station",
    placeholder: "Select Police Station",
    options: {
      type: "api",
      url: "/api/locations/thanas",
      paramName: "districtId",
      dependsOn: "localDistrict",
    },
  },
  {
    name: "localPostOffice",
    type: "text",
    label: "Post Office",
    placeholder: "Post Office",
  },
  {
    name: "localPostalCode",
    type: "text",
    label: "Postal Code / Zip Code",
    placeholder: "Postal Code / Zip Code",
  },
  {
    name: "localArea",
    type: "text",
    label: "Area",
    placeholder: "Area",
  },
  {
    name: "localRoad",
    type: "text",
    label: "Road",
    placeholder: "Road",
  },
  {
    name: "localFlat",
    type: "text",
    label: "Flat",
    placeholder: "Flat",
  },
  {
    name: "localHouse",
    type: "text",
    label: "House",
    placeholder: "House",
  },
  {
    name: "localPhone",
    type: "phone",
    label: "Phone No.",
    validation: { validatePhone: false },
  },
];

export const securityClearanceFormConfig: StepFormConfig = {
  mode: "stepped",
  submitLabel: "Preview & Submit",
  steps: [
    // -----------------------------------------------------------------------
    // Step 1: Basic Instructions
    // -----------------------------------------------------------------------
    {
      id: "step-basic-instructions",
      dataKey: "basicInstructions",
      title: "Basic Instructions",
      description: "Please provide your information for security clearance",
      blocks: [
        {
          id: "basic-instructions-block",
          layout: "single",
          fields: [
            {
              name: "workPermitRef",
              type: "text",
              label: "Please Give Your Approved Work Permit Reference No.",
              placeholder: "Enter work permit reference number",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 2: Bank Details
    // -----------------------------------------------------------------------
    {
      id: "step-bank-details",
      dataKey: "bankInfo",
      title: "Bank Details",
      description: "Expatriate/Employee Bank Details",
      blocks: [
        {
          id: "bank-details-block",
          title: "Expatriate/Employee Bank Details",
          layout: "2-col",
          fields: [
            {
              name: "accountHolderName",
              type: "text",
              label: "Account Holder Name",
              placeholder: "Enter account holder name",
            },
            {
              name: "bankName",
              type: "text",
              label: "Bank Name",
              placeholder: "Enter bank Name",
            },
            {
              name: "branchName",
              type: "text",
              label: "Branch Name",
              placeholder: "Enter branch Name",
            },
            {
              name: "bankAccountNumber",
              type: "text",
              label: "Bank Account Number",
              placeholder: "Enter bank account number",
            },
          ],
        },
        {
          id: "bank-statement-block",
          layout: "single",
          fields: [
            {
              name: "bankStatement",
              type: "file",
              label: "Bank Statement",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 3: Tax Identification Details
    // -----------------------------------------------------------------------
    {
      id: "step-tax-identification",
      dataKey: "taxIdentification",
      title: "Tax Identification Details",
      description: "Expatriate/Employee Tax Identification Details",
      blocks: [
        {
          id: "tin-block",
          title: "Expatriate/Employee Tax Identification Details",
          layout: "single",
          fields: [
            {
              name: "tinNumber",
              type: "text",
              label: "Tax Identification Number (TIN)",
              placeholder: "Enter Tax Identification Number (TIN)",
              description: "Enter 12-digit TIN number",
              validation: {
                pattern: "^[0-9]{12}$",
                messages: { pattern: "Enter a valid 12-digit TIN number" },
              },
            },
            {
              name: "tinCertificate",
              type: "file",
              label: "Tax Identification Number (TIN) Certificate",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 4: Residential Address
    // -----------------------------------------------------------------------
    {
      id: "step-residential-address",
      dataKey: "residentialAddress",
      title: "Residential Address",
      description: "Provide your residential address details",
      blocks: [
        // --- Foreign Address ---
        {
          id: "foreign-address-block",
          title: "Residential Address (Foreign)",
          dataKey: "foreignAddress",
          layout: "2-col",
          fields: [
            {
              name: "foreignCountry",
              type: "searchable-select",
              label: "Country",
              placeholder: "Select Country",
              options: { type: "api", url: "/api/locations/countries" },
            },
            {
              name: "foreignState",
              type: "text",
              label: "State / Province / Region",
              placeholder: "State / Province / Region",
              required: false,
            },
            {
              name: "foreignCity",
              type: "text",
              label: "City / Town",
              placeholder: "City / Town",
            },
            {
              name: "foreignPostalCode",
              type: "text",
              label: "Postal Code / ZIP Code",
              placeholder: "Postal Code / ZIP Code",
            },
          ],
        },
        {
          id: "foreign-street-block",
          dataKey: "foreignAddress",
          layout: "single",
          fields: [
            {
              name: "foreignStreetAddress",
              type: "text",
              label: "Street Address",
              placeholder: "Street Address",
            },
          ],
        },

        // --- Accommodation Type ---
        {
          id: "accommodation-type-block",
          title: "Residential Address (Bangladesh)",
          layout: "single",
          fields: [
            {
              name: "accommodationType",
              type: "radio-group",
              label: "Accommodation Type",
              options: {
                type: "static",
                items: [
                  {
                    label: "Arranged by Company",
                    value: "arranged-by-company",
                  },
                  {
                    label: "Self Arrangement by Expatriate/Employee",
                    value: "self-arrangement",
                  },
                ],
              },
            },
          ],
        },

        // --- Self Arrangement: Accommodation Status ---
        {
          id: "self-accommodation-status-block",
          layout: "single",
          showWhen: {
            field: "accommodationType",
            operator: "eq",
            value: "self-arrangement",
          },
          resetOn: ["accommodationType"],
          fields: [
            {
              name: "selfAccommodationStatus",
              type: "radio-group",
              label: "Accommodation Status",
              options: {
                type: "static",
                items: [
                  { label: "Current", value: "current" },
                  { label: "Temporary", value: "temporary" },
                ],
              },
            },
          ],
        },

        // --- Company Arrangement: Accommodation Status ---
        {
          id: "company-accommodation-status-block",
          layout: "single",
          showWhen: {
            field: "accommodationType",
            operator: "eq",
            value: "arranged-by-company",
          },
          resetOn: ["accommodationType"],
          fields: [
            {
              name: "companyAccommodationStatus",
              type: "radio-group",
              label: "Accommodation Status",
              options: {
                type: "static",
                items: [
                  { label: "Rented by Company", value: "rented-by-company" },
                  { label: "Company Owned", value: "company-owned" },
                ],
              },
            },
          ],
        },

        // --- Company Owned: Accommodation Location ---
        {
          id: "company-accommodation-location-block",
          layout: "single",
          showWhen: {
            field: "companyAccommodationStatus",
            operator: "eq",
            value: "company-owned",
          },
          resetOn: ["accommodationType", "companyAccommodationStatus"],
          fields: [
            {
              name: "companyAccommodationLocation",
              type: "radio-group",
              label: "Accommodation Location",
              options: {
                type: "static",
                items: [
                  { label: "Within Factory", value: "within-factory" },
                  { label: "Outside Factory", value: "outside-factory" },
                ],
              },
            },
          ],
        },

        // --- Temporary Address (self-arrangement + temporary) ---
        {
          id: "temporary-address-block",
          title: "Temporary Address",
          dataKey: "localAddress",
          layout: "2-col",
          showWhen: {
            field: "selfAccommodationStatus",
            operator: "eq",
            value: "temporary",
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: STANDARD_LOCAL_ADDRESS_FIELDS,
        },

        // --- Current Address (self-arrangement + current) ---
        {
          id: "current-address-block",
          title: "Current Address",
          dataKey: "localAddress",
          layout: "2-col",
          showWhen: {
            field: "selfAccommodationStatus",
            operator: "eq",
            value: "current",
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: STANDARD_LOCAL_ADDRESS_FIELDS,
        },

        // --- Residential Address (company + rented-by-company) ---
        {
          id: "residential-address-block",
          title: "Residential Address",
          dataKey: "localAddress",
          layout: "2-col",
          showWhen: {
            field: "companyAccommodationStatus",
            operator: "eq",
            value: "rented-by-company",
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: STANDARD_LOCAL_ADDRESS_FIELDS,
        },

        // --- Address (company + outside-factory) ---
        {
          id: "outside-factory-address-block",
          title: "Address",
          dataKey: "localAddress",
          layout: "2-col",
          showWhen: {
            field: "companyAccommodationLocation",
            operator: "eq",
            value: "outside-factory",
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: STANDARD_LOCAL_ADDRESS_FIELDS,
        },
        {
          id: "local-email-block",
          dataKey: "localAddress",
          layout: "single",
          showWhen: {
            or: [
              { field: "selfAccommodationStatus", operator: "truthy" },
              {
                field: "companyAccommodationStatus",
                operator: "eq",
                value: "rented-by-company",
              },
              {
                field: "companyAccommodationLocation",
                operator: "eq",
                value: "outside-factory",
              },
            ],
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: [
            {
              name: "localEmail",
              type: "email",
              label: "Email",
              placeholder: "Email",
            },
          ],
        },

        // --- Factory Address (company + within-factory) ---
        {
          id: "factory-address-block",
          title: "Factory Address",
          dataKey: "factoryAddress",
          layout: "2-col",
          showWhen: {
            field: "companyAccommodationLocation",
            operator: "eq",
            value: "within-factory",
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: [
            {
              name: "factoryDivision",
              type: "select",
              label: "Division",
              placeholder: "Select One",
              options: { type: "api", url: "/api/locations/divisions" },
            },
            {
              name: "factoryDistrict",
              type: "select",
              label: "District",
              placeholder: "Select District",
              options: {
                type: "api",
                url: "/api/locations/districts",
                paramName: "divisionId",
                dependsOn: "factoryDivision",
              },
            },
            {
              name: "factoryPoliceStation",
              type: "select",
              label: "Police Station",
              placeholder: "Select Police Station",
              options: {
                type: "api",
                url: "/api/locations/thanas",
                paramName: "districtId",
                dependsOn: "factoryDistrict",
              },
            },
            {
              name: "factoryPostOffice",
              type: "text",
              label: "Post Office",
              placeholder: "Post Office",
            },
            {
              name: "factoryPostalCode",
              type: "text",
              label: "Postal Code / Zip Code",
              placeholder: "Postal Code / Zip Code",
            },
            {
              name: "factoryAddressLine",
              type: "text",
              label: "House, Flat/Apartment, Road",
              placeholder: "Enter address",
            },
            {
              name: "factoryPhone",
              type: "phone",
              label: "Phone No.",
              validation: { validatePhone: false },
            },
          ],
        },
        {
          id: "factory-email-block",
          dataKey: "factoryAddress",
          layout: "single",
          showWhen: {
            field: "companyAccommodationLocation",
            operator: "eq",
            value: "within-factory",
          },
          resetOn: LOCAL_ADDRESS_RESET_ON,
          fields: [
            {
              name: "factoryEmail",
              type: "email",
              label: "Email",
              placeholder: "Email",
            },
          ],
        },

        // --- Rental Agreement (self-arrangement OR company rented) ---
        {
          id: "rental-agreement-block",
          layout: "single",
          showWhen: {
            or: [
              { field: "selfAccommodationStatus", operator: "truthy" },
              {
                field: "companyAccommodationStatus",
                operator: "eq",
                value: "rented-by-company",
              },
            ],
          },
          resetOn: [
            "accommodationType",
            "selfAccommodationStatus",
            "companyAccommodationStatus",
            "companyAccommodationLocation",
          ],
          fields: [
            {
              name: "rentalAgreement",
              type: "file",
              label: "Rental Agreement / Rental Contract / Rental Proof",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
          ],
        },

        // --- Expected Regular Residence Date (temporary only) ---
        {
          id: "expected-regular-date-block",
          layout: "single",
          showWhen: {
            field: "selfAccommodationStatus",
            operator: "eq",
            value: "temporary",
          },
          resetOn: ["accommodationType", "selfAccommodationStatus"],
          fields: [
            {
              name: "expectedRegularDate",
              type: "date",
              label: "Expected Date for Regular Residence",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 5: Previous Passport Details
    // -----------------------------------------------------------------------
    {
      id: "step-previous-passport",
      dataKey: "previousPassport",
      title: "Previous Passport Details",
      description: "Previous Passport Information",
      blocks: [
        {
          id: "previous-passport-toggle-block",
          title: "Previous Passport Information",
          layout: "single",
          fields: [
            {
              name: "hasPreviousPassport",
              type: "radio-group",
              label: "Do You Have Any Previous Passports?",
              options: {
                type: "static",
                items: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
          ],
        },
        {
          id: "previous-passport-details-block",
          layout: "2-col",
          showWhen: {
            field: "hasPreviousPassport",
            operator: "eq",
            value: "yes",
          },
          repeatable: {
            arrayName: "passports",
            minItems: 1,
            addLabel: "+ Add Another Passport",
          },
          fields: [
            {
              name: "passportNo",
              type: "text",
              label: "Passport No.",
              placeholder: "Passport No.",
            },
            {
              name: "passportPersonalNo",
              type: "text",
              label: "Personal No.",
              placeholder: "Personal No.",
            },
            {
              name: "passportNationality",
              type: "text",
              label: "Nationality",
              placeholder: "Enter nationality",
            },
            {
              name: "passportIssuingAuthority",
              type: "text",
              label: "Issuing Authority",
              placeholder: "Issuing Authority",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 6: Attachments
    // -----------------------------------------------------------------------
    {
      id: "step-attachments",
      dataKey: "attachments",
      title: "Attachments",
      description:
        "Please provide relevant documents here (Allowed file size: 10mb, Allowed file format: pdf/jpg/png)",
      blocks: [
        {
          id: "attachments-block",
          layout: "single",
          fields: [
            {
              name: "attachPassport",
              type: "file",
              label:
                "Passport of the Employees/Expatriates/Investor (Whole of the used part)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            {
              name: "attachAppointmentLetter",
              type: "file",
              label:
                "Appointment Letter/transfer order/service contract or agreement for expatriates/investors.",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            {
              name: "attachCV",
              type: "file",
              label:
                "Copies of curriculum vitae (CV). All academic qualification & professional experience certificate for the employee",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            {
              name: "attachTradeLicense",
              type: "file",
              label: "Up to date Trade License",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            {
              name: "attachIncomeTax",
              type: "file",
              label:
                "Up-to-date income tax clearance certificate (Organization)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            {
              name: "attachActivities",
              type: "file",
              label:
                "Specific activities of the organization (On company letterhead)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            {
              name: "attachManpowerStatement",
              type: "file",
              label:
                "Statement of the manpower showing list of local & expatriate personnel employed with designation, salary break-up, nationality and date of first appointment",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              fileVariant: "inline",
            },
            // Items 8–11: optional ("if any" / "applicable for investors")
            {
              name: "attachWorkPermit",
              type: "file",
              label:
                "Copy of work permit (if the foreigner was previously employed in Bangladesh, along with proof of work permit cancellation)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              required: false,
            },
            {
              name: "attachRemittanceCert",
              type: "file",
              label:
                "Encashment certificate of inward remittance of minimum U.S $50,000.00 as initial establishment cost for branch/liaison/representative office and locally incorporated/ joint venture and 100% Foreign ownership companies. (applicable for investors)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              required: false,
            },
            {
              name: "attachComments",
              type: "file",
              label: "Attachment of company's comments as per remarks (if any)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              required: false,
            },
            {
              name: "attachOthers",
              type: "file",
              label: "Others necessary documents (please attach if any)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              required: false,
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Step 7: Declarations
    // -----------------------------------------------------------------------
    {
      id: "step-declarations",
      dataKey: "declarations",
      title: "Declarations",
      description: "Declaration and undertaking",
      blocks: [
        {
          id: "declaration-contact-block",
          title: "Declaration and undertaking",
          description: "Authorized person of the organization",
          dataKey: "contact",
          layout: "2-col",
          fields: [
            {
              name: "declFullName",
              type: "text",
              label: "Full Name",
              placeholder: "Enter full name",
            },
            {
              name: "declDesignation",
              type: "text",
              label: "Designation",
              placeholder: "Enter designation",
            },
            {
              name: "declPhone",
              type: "phone",
              label: "Phone No.",
            },
            {
              name: "declEmail",
              type: "email",
              label: "Email Address",
              placeholder: "Enter Email Address",
            },
          ],
        },
        {
          id: "declaration-picture-block",
          layout: "single",
          fields: [
            {
              name: "declPicture",
              type: "file",
              label: "Picture",
              description: "All file types accepted",
              maxSizeMB: 5,
            },
          ],
        },
        {
          id: "declaration-agreement-block",
          layout: "single",
          fields: [
            {
              name: "declAgreement",
              type: "checkbox",
              label:
                "I hereby declare that the information furnished above is true and correct to the best of my knowledge, and I shall be liable for any false or incorrect statement / information",
              validation: {
                messages: {
                  required: "You must accept the declaration",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
