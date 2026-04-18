"use client";

import { StepFormEngine, groupValuesByConfig } from "@/form-engine";
import { securityClearanceFormConfig } from "./securityClearanceFormConfig";

// ---------------------------------------------------------------------------
// Dev sample data — filled by the Import button (all steps at once).
// Keys must match the flat RHF field names.  File fields are omitted (null).
// ---------------------------------------------------------------------------
const SAMPLE_DATA: Record<string, unknown> = {
  // Step 1 — Basic Instructions
  workPermitRef: "WP-2024-12345",

  // Step 2 — Bank Details
  accountHolderName: "John Doe",
  bankName: "Dutch-Bangla Bank",
  branchName: "Gulshan",
  bankAccountNumber: "2011234567890",

  // Step 3 — Tax Identification
  tinNumber: "123456789012",

  // Step 4 — Residential Address
  foreignCountry: "belgium",
  foreignCity: "Brussels",
  foreignPostalCode: "1000",
  foreignStreetAddress: "Rue de la Loi 1",
  accommodationType: "arranged-by-company",
  companyAccommodationStatus: "rented-by-company",
  localDivision: "dhaka",
  localDistrict: "dhaka",
  localPoliceStation: "mirpur",
  localPostOffice: "Mirpur Post Office",
  localPostalCode: "1216",
  localArea: "Mirpur 10",
  localRoad: "Road 5",
  localFlat: "Apt 3B",
  localHouse: "House 12",
  localPhone: "+8801711223344",
  localEmail: "contact@example.com",

  // Step 5 — Previous Passport
  hasPreviousPassport: "no",

  // Step 7 — Declarations (picture and agreement intentionally omitted)
  declFullName: "Amirul Islam",
  declDesignation: "Developer",
  declPhone: "+8801711223344",
  declEmail: "amiruleeeiu15@gmail.com",
};

export function SecurityClearanceForm() {
  function handleSubmit(values: Record<string, unknown>) {
    const grouped = groupValuesByConfig(securityClearanceFormConfig, values);
    console.log("SecurityClearanceForm submitted:", grouped);
  }

  function handleDraft(values: Record<string, unknown>) {
    const grouped = groupValuesByConfig(securityClearanceFormConfig, values);
    console.log("SecurityClearanceForm draft saved:", grouped);
  }

  return (
    <StepFormEngine
      config={securityClearanceFormConfig}
      onSubmit={handleSubmit}
      onDraft={handleDraft}
      sampleData={SAMPLE_DATA}
    />
  );
}
