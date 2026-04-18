import type { StepFormConfig } from "@/form-engine/types";

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
              type: "text",
              label: "Country",
              placeholder: "Country",
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
          fields: [
            {
              name: "selfAccommodationStatus",
              type: "radio-group",
              label: "Accommodation Status",
              required: false,
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
          fields: [
            {
              name: "companyAccommodationStatus",
              type: "radio-group",
              label: "Accommodation Status",
              required: false,
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
          fields: [
            {
              name: "companyAccommodationLocation",
              type: "radio-group",
              label: "Accommodation Location",
              required: false,
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

        // --- Local Address (shown once accommodation type selected) ---
        {
          id: "local-address-block",
          title: "Address",
          dataKey: "localAddress",
          layout: "2-col",
          showWhen: { field: "accommodationType", operator: "truthy" },
          fields: [
            {
              name: "localDivision",
              type: "select",
              label: "Division",
              placeholder: "Select One",
              required: false,
              options: {
                type: "static",
                items: [
                  { label: "Dhaka", value: "dhaka" },
                  { label: "Chittagong", value: "chittagong" },
                  { label: "Rajshahi", value: "rajshahi" },
                  { label: "Khulna", value: "khulna" },
                  { label: "Barishal", value: "barishal" },
                  { label: "Sylhet", value: "sylhet" },
                  { label: "Rangpur", value: "rangpur" },
                  { label: "Mymensingh", value: "mymensingh" },
                ],
              },
            },
            {
              name: "localDistrict",
              type: "select",
              label: "District",
              placeholder: "Select District",
              required: false,
              options: {
                type: "static",
                items: [
                  { label: "Dhaka", value: "dhaka" },
                  { label: "Gazipur", value: "gazipur" },
                  { label: "Narayanganj", value: "narayanganj" },
                  { label: "Chattogram", value: "chattogram" },
                ],
              },
            },
            {
              name: "localPoliceStation",
              type: "select",
              label: "Police Station",
              placeholder: "Select Police Station",
              required: false,
              options: {
                type: "static",
                items: [
                  { label: "Kapasia", value: "kapasia" },
                  { label: "Mirpur", value: "mirpur" },
                  { label: "Dhanmondi", value: "dhanmondi" },
                  { label: "Gulshan", value: "gulshan" },
                ],
              },
            },
            {
              name: "localPostOffice",
              type: "text",
              label: "Post Office",
              placeholder: "Post office",
              required: false,
            },
            {
              name: "localPostalCode",
              type: "text",
              label: "Postal Code / Zip Code",
              placeholder: "Postal Code / Zip Code",
              required: false,
            },
            {
              name: "localArea",
              type: "text",
              label: "Area",
              placeholder: "Area",
              required: false,
            },
            {
              name: "localRoad",
              type: "text",
              label: "Road",
              placeholder: "Road",
              required: false,
            },
            {
              name: "localFlat",
              type: "text",
              label: "Flat",
              placeholder: "Flat",
              required: false,
            },
            {
              name: "localHouse",
              type: "text",
              label: "House",
              placeholder: "House",
              required: false,
            },
            {
              name: "localPhone",
              type: "phone",
              label: "Phone No.",
              required: false,
              validation: { validatePhone: false },
            },
          ],
        },
        {
          id: "local-email-block",
          dataKey: "localAddress",
          layout: "single",
          showWhen: { field: "accommodationType", operator: "truthy" },
          fields: [
            {
              name: "localEmail",
              type: "email",
              label: "Email",
              placeholder: "email",
              required: false,
            },
          ],
        },

        // --- Rental Agreement (self-arrangement OR company rented) ---
        {
          id: "rental-agreement-block",
          layout: "single",
          showWhen: {
            or: [
              {
                field: "accommodationType",
                operator: "eq",
                value: "self-arrangement",
              },
              {
                field: "companyAccommodationStatus",
                operator: "eq",
                value: "rented-by-company",
              },
            ],
          },
          fields: [
            {
              name: "rentalAgreement",
              type: "file",
              label: "Rental Agreement / Rental Contract / Rental Proof",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
              required: false,
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
          fields: [
            {
              name: "expectedRegularDate",
              type: "date",
              label: "Expected Date for Regular Residence",
              required: false,
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
          dataKey: "passportInfo",
          layout: "2-col",
          showWhen: {
            field: "hasPreviousPassport",
            operator: "eq",
            value: "yes",
          },
          fields: [
            {
              name: "passportNo",
              type: "text",
              label: "Passport No.",
              placeholder: "Passport No.",
              required: false,
            },
            {
              name: "passportPersonalNo",
              type: "text",
              label: "Personal No.",
              placeholder: "Personal No.",
              required: false,
            },
            {
              name: "passportNationality",
              type: "text",
              label: "Nationality",
              placeholder: "Enter nationality",
              required: false,
            },
            {
              name: "passportIssuingAuthority",
              type: "text",
              label: "Issuing Authority",
              placeholder: "Issuing Authority",
              required: false,
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
            },
            {
              name: "attachAppointmentLetter",
              type: "file",
              label:
                "Appointment Letter/transfer order/service contract or agreement for expatriates/investors.",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
            {
              name: "attachCV",
              type: "file",
              label:
                "Copies of curriculum vitae (CV). All academic qualification & professional experience certificate for the employee",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
            {
              name: "attachTradeLicense",
              type: "file",
              label: "Up to date Trade License",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
            {
              name: "attachIncomeTax",
              type: "file",
              label:
                "Up-to-date income tax clearance certificate (Organization)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
            {
              name: "attachActivities",
              type: "file",
              label:
                "Specific activities of the organization (On company letterhead)",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
            },
            {
              name: "attachManpowerStatement",
              type: "file",
              label:
                "Statement of the manpower showing list of local & expatriate personnel employed with designation, salary break-up, nationality and date of first appointment",
              accept: ["pdf", "jpg", "png"],
              maxSizeMB: 10,
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
