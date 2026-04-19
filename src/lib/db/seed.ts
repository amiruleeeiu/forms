/**
 * Seed script — run once after `npx drizzle-kit push`
 * Usage: npx tsx src/lib/db/seed.ts
 *
 * Populates: countries, divisions, districts, thanas
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const sql = postgres({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  database: process.env.DATABASE_NAME ?? "form_db",
  username: process.env.DATABASE_USERNAME ?? "postgres",
  password: process.env.DATABASE_PASSWORD ?? "12345",
});

const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Countries (ISO selection)
// ---------------------------------------------------------------------------

const COUNTRIES = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Argentina", code: "AR" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Belgium", code: "BE" },
  { name: "Brazil", code: "BR" },
  { name: "Bulgaria", code: "BG" },
  { name: "Cambodia", code: "KH" },
  { name: "Canada", code: "CA" },
  { name: "Chile", code: "CL" },
  { name: "China", code: "CN" },
  { name: "Colombia", code: "CO" },
  { name: "Croatia", code: "HR" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Denmark", code: "DK" },
  { name: "Egypt", code: "EG" },
  { name: "Ethiopia", code: "ET" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "Greece", code: "GR" },
  { name: "Hungary", code: "HU" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" },
  { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Jordan", code: "JO" },
  { name: "Kazakhstan", code: "KZ" },
  { name: "Kenya", code: "KE" },
  { name: "Kuwait", code: "KW" },
  { name: "Lebanon", code: "LB" },
  { name: "Libya", code: "LY" },
  { name: "Malaysia", code: "MY" },
  { name: "Mexico", code: "MX" },
  { name: "Morocco", code: "MA" },
  { name: "Myanmar", code: "MM" },
  { name: "Nepal", code: "NP" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nigeria", code: "NG" },
  { name: "Norway", code: "NO" },
  { name: "Oman", code: "OM" },
  { name: "Pakistan", code: "PK" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" },
  { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Singapore", code: "SG" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sri Lanka", code: "LK" },
  { name: "Sudan", code: "SD" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Syria", code: "SY" },
  { name: "Taiwan", code: "TW" },
  { name: "Thailand", code: "TH" },
  { name: "Turkey", code: "TR" },
  { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Venezuela", code: "VE" },
  { name: "Vietnam", code: "VN" },
  { name: "Yemen", code: "YE" },
];

// ---------------------------------------------------------------------------
// Bangladesh divisions
// ---------------------------------------------------------------------------

const DIVISIONS = [
  { name: "Dhaka", slug: "dhaka" },
  { name: "Chattogram", slug: "chattogram" },
  { name: "Rajshahi", slug: "rajshahi" },
  { name: "Khulna", slug: "khulna" },
  { name: "Barisal", slug: "barisal" },
  { name: "Sylhet", slug: "sylhet" },
  { name: "Rangpur", slug: "rangpur" },
  { name: "Mymensingh", slug: "mymensingh" },
];

// Districts keyed by division slug
const DISTRICTS_BY_DIVISION: Record<string, string[]> = {
  dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Narsingdi",
    "Munshiganj",
    "Manikganj",
    "Kishoreganj",
    "Tangail",
    "Faridpur",
    "Rajbari",
    "Madaripur",
    "Shariatpur",
    "Gopalganj",
  ],
  chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Rangamati",
    "Khagrachari",
    "Bandarban",
    "Feni",
    "Lakshmipur",
    "Noakhali",
    "Comilla",
    "Chandpur",
    "Brahmanbaria",
  ],
  rajshahi: [
    "Rajshahi",
    "Natore",
    "Naogaon",
    "Chapainawabganj",
    "Bogura",
    "Joypurhat",
    "Sirajganj",
    "Pabna",
  ],
  khulna: [
    "Khulna",
    "Satkhira",
    "Bagerhat",
    "Narail",
    "Jessore",
    "Magura",
    "Jhenaidah",
    "Chuadanga",
    "Meherpur",
    "Kushtia",
  ],
  barisal: [
    "Barisal",
    "Bhola",
    "Patuakhali",
    "Barguna",
    "Pirojpur",
    "Jhalokati",
  ],
  sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  rangpur: [
    "Rangpur",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ],
  mymensingh: ["Mymensingh", "Jamalpur", "Sherpur", "Netrokona"],
};

// Sample thanas per district (3-4 each, enough for dev/demo)
const THANAS_BY_DISTRICT: Record<string, string[]> = {
  dhaka: ["Dhanmondi", "Gulshan", "Motijheel", "Uttara", "Mirpur", "Tejgaon"],
  gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  narayanganj: [
    "Narayanganj Sadar",
    "Araihazar",
    "Bandar",
    "Rupganj",
    "Sonargaon",
  ],
  narsingdi: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura"],
  munshiganj: ["Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Tongibari"],
  manikganj: ["Manikganj Sadar", "Ghior", "Harirampur", "Saturia", "Shibalaya"],
  kishoreganj: ["Kishoreganj Sadar", "Bajitpur", "Bhairab", "Hossainpur"],
  tangail: ["Tangail Sadar", "Basail", "Delduar", "Ghatail", "Madhupur"],
  faridpur: ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari"],
  rajbari: ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Pangsha"],
  madaripur: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
  shariatpur: ["Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat"],
  gopalganj: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur"],
  chattogram: [
    "Kotwali",
    "Halishahar",
    "Pahartali",
    "Panchlaish",
    "Double Mooring",
  ],
  "cox's bazar": [
    "Cox's Bazar Sadar",
    "Chakaria",
    "Kutubdia",
    "Maheshkhali",
    "Teknaf",
  ],
  rangamati: ["Rangamati Sadar", "Baghaichhari", "Belaichhari", "Kaptai"],
  khagrachari: [
    "Khagrachari Sadar",
    "Dighinala",
    "Lakshmichhari",
    "Mahalchhari",
  ],
  bandarban: [
    "Bandarban Sadar",
    "Alikadam",
    "Lama",
    "Naikhongchhari",
    "Rowangchhari",
  ],
  feni: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram"],
  lakshmipur: ["Lakshmipur Sadar", "Kamalnagar", "Raipur", "Ramganj"],
  noakhali: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj"],
  comilla: ["Comilla Sadar", "Brahmanpara", "Burichang", "Chandina"],
  chandpur: ["Chandpur Sadar", "Faridganj", "Haimchar", "Kachua"],
  brahmanbaria: [
    "Brahmanbaria Sadar",
    "Ashuganj",
    "Bancharampur",
    "Bijoynagar",
  ],
  rajshahi: ["Boalia", "Motihar", "Paba", "Rajpara", "Shah Makhdum"],
  natore: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur"],
  naogaon: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Manda", "Niamatpur"],
  chapainawabganj: [
    "Chapainawabganj Sadar",
    "Bholahat",
    "Gomastapur",
    "Nachole",
  ],
  bogura: ["Bogura Sadar", "Adamdighi", "Dhunat", "Gabtali", "Sherpur"],
  joypurhat: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
  sirajganj: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda"],
  pabna: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar"],
  khulna: ["Khulna Sadar", "Batiaghata", "Dacope", "Dumuria", "Fulbarigate"],
  satkhira: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Tala"],
  bagerhat: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat"],
  narail: ["Narail Sadar", "Kalia", "Lohagara"],
  jessore: [
    "Jessore Sadar",
    "Abhaynagar",
    "Bagherpara",
    "Chaugachha",
    "Jhikorgachha",
  ],
  magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  jhenaidah: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur"],
  chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
  meherpur: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
  kushtia: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali"],
  barisal: ["Kotwali", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara"],
  bhola: ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan"],
  patuakhali: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa"],
  barguna: ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata"],
  pirojpur: [
    "Pirojpur Sadar",
    "Bhandaria",
    "Kawkhali",
    "Mathbaria",
    "Nazirpur",
  ],
  jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  sylhet: [
    "Sylhet Sadar",
    "Balaganj",
    "Beanibazar",
    "Bishwanath",
    "Companiganj",
  ],
  moulvibazar: [
    "Moulvibazar Sadar",
    "Barlekha",
    "Juri",
    "Kamalganj",
    "Kulaura",
  ],
  habiganj: [
    "Habiganj Sadar",
    "Ajmiriganj",
    "Bahubal",
    "Baniachong",
    "Chunarughat",
  ],
  sunamganj: [
    "Sunamganj Sadar",
    "Bishwamvarpur",
    "Chhatak",
    "Derai",
    "Dharmapasha",
  ],
  rangpur: ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur"],
  dinajpur: [
    "Dinajpur Sadar",
    "Birganj",
    "Birampur",
    "Chirirbandar",
    "Ghoraghat",
  ],
  gaibandha: ["Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur"],
  kurigram: [
    "Kurigram Sadar",
    "Bhurungamari",
    "Chilmari",
    "Nageswari",
    "Phulbari",
  ],
  lalmonirhat: [
    "Lalmonirhat Sadar",
    "Aditmari",
    "Hatibandha",
    "Kaliganj",
    "Patgram",
  ],
  nilphamari: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj"],
  panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  thakurgaon: [
    "Thakurgaon Sadar",
    "Baliadangi",
    "Haripur",
    "Pirganj",
    "Ranisankail",
  ],
  mymensingh: [
    "Mymensingh Sadar",
    "Bhaluka",
    "Dhobaura",
    "Fulbaria",
    "Gaffargaon",
  ],
  jamalpur: [
    "Jamalpur Sadar",
    "Bakshiganj",
    "Dewanganj",
    "Islampur",
    "Melandaha",
  ],
  sherpur: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
  netrokona: [
    "Netrokona Sadar",
    "Atpara",
    "Barhatta",
    "Durgapur",
    "Khaliajuri",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding database...");

  // Countries
  console.log("  Inserting countries...");
  await db.insert(schema.countries).values(COUNTRIES).onConflictDoNothing();

  // Divisions
  console.log("  Inserting divisions...");
  const insertedDivisions = await db
    .insert(schema.divisions)
    .values(DIVISIONS)
    .onConflictDoNothing()
    .returning();

  // Build division slug -> id map (query all to handle existing rows too)
  const allDivisions = await db.select().from(schema.divisions);
  const divisionMap = Object.fromEntries(
    allDivisions.map((d) => [d.slug, d.id]),
  );

  // Districts
  console.log("  Inserting districts...");
  const allDistrictValues: {
    name: string;
    slug: string;
    divisionId: number;
  }[] = [];
  for (const [divSlug, districtNames] of Object.entries(
    DISTRICTS_BY_DIVISION,
  )) {
    const divId = divisionMap[divSlug];
    if (!divId) continue;
    for (const dName of districtNames) {
      allDistrictValues.push({
        name: dName,
        slug: toSlug(dName),
        divisionId: divId,
      });
    }
  }
  await db
    .insert(schema.districts)
    .values(allDistrictValues)
    .onConflictDoNothing();

  // Build district slug -> id map
  const allDistricts = await db.select().from(schema.districts);
  const districtMap = Object.fromEntries(
    allDistricts.map((d) => [d.slug, d.id]),
  );

  // Thanas
  console.log("  Inserting thanas...");
  const allThanaValues: { name: string; slug: string; districtId: number }[] =
    [];
  for (const [districtSlugKey, thanaNames] of Object.entries(
    THANAS_BY_DISTRICT,
  )) {
    const distId = districtMap[districtSlugKey];
    if (!distId) continue;
    for (const tName of thanaNames) {
      allThanaValues.push({
        name: tName,
        slug: toSlug(tName),
        districtId: distId,
      });
    }
  }
  await db.insert(schema.thanas).values(allThanaValues).onConflictDoNothing();

  console.log("Seed complete.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
