import { prisma } from "../../src/app/lib/prisma";

// Bangladesh 8 Divisions
const divisions: { code: string; nameEn: string; nameBn: string }[] = [
  { code: "BD-1", nameEn: "Dhaka", nameBn: "ঢাকা" },
  { code: "BD-2", nameEn: "Chattogram", nameBn: "চট্টগ্রাম" },
  { code: "BD-3", nameEn: "Rajshahi", nameBn: "রাজশাহী" },
  { code: "BD-4", nameEn: "Khulna", nameBn: "খুলনা" },
  { code: "BD-5", nameEn: "Barishal", nameBn: "বরিশাল" },
  { code: "BD-6", nameEn: "Sylhet", nameBn: "সিলেট" },
  { code: "BD-7", nameEn: "Rangpur", nameBn: "রংপুর" },
  { code: "BD-8", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ" },
];

// Districts grouped by division
const divisionDistricts: {
  divisionCode: string;
  code: string;
  nameEn: string;
  nameBn: string;
}[] = [
  // Dhaka Division
  { divisionCode: "BD-1", code: "BD-DHA", nameEn: "Dhaka", nameBn: "ঢাকা" },
  {
    divisionCode: "BD-1",
    code: "BD-GAZ",
    nameEn: "Gazipur",
    nameBn: "গাজীপুর",
  },
  {
    divisionCode: "BD-1",
    code: "BD-NAR",
    nameEn: "Narayanganj",
    nameBn: "নারায়ণগঞ্জ",
  },
  {
    divisionCode: "BD-1",
    code: "BD-NRS",
    nameEn: "Narsingdi",
    nameBn: "নরসিংদী",
  },
  {
    divisionCode: "BD-1",
    code: "BD-MAN",
    nameEn: "Manikganj",
    nameBn: "মানিকগঞ্জ",
  },
  {
    divisionCode: "BD-1",
    code: "BD-MUN",
    nameEn: "Munshiganj",
    nameBn: "মুন্সিগঞ্জ",
  },
  {
    divisionCode: "BD-1",
    code: "BD-TAN",
    nameEn: "Tangail",
    nameBn: "টাঙ্গাইল",
  },
  {
    divisionCode: "BD-1",
    code: "BD-KIS",
    nameEn: "Kishoreganj",
    nameBn: "কিশোরগঞ্জ",
  },
  {
    divisionCode: "BD-1",
    code: "BD-FAR",
    nameEn: "Faridpur",
    nameBn: "ফরিদপুর",
  },
  {
    divisionCode: "BD-1",
    code: "BD-GOP",
    nameEn: "Gopalganj",
    nameBn: "গোপালগঞ্জ",
  },
  {
    divisionCode: "BD-1",
    code: "BD-MAD",
    nameEn: "Madaripur",
    nameBn: "মাদারীপুর",
  },
  {
    divisionCode: "BD-1",
    code: "BD-RAJ",
    nameEn: "Rajbari",
    nameBn: "রাজবাড়ী",
  },
  {
    divisionCode: "BD-1",
    code: "BD-SHA",
    nameEn: "Shariatpur",
    nameBn: "শরীয়তপুর",
  },

  // Chattogram Division
  {
    divisionCode: "BD-2",
    code: "BD-CTG",
    nameEn: "Chattogram",
    nameBn: "চট্টগ্রাম",
  },
  {
    divisionCode: "BD-2",
    code: "BD-COX",
    nameEn: "Cox's Bazar",
    nameBn: "কক্সবাজার",
  },
  {
    divisionCode: "BD-2",
    code: "BD-CAN",
    nameEn: "Cumilla",
    nameBn: "কুমিল্লা",
  },
  {
    divisionCode: "BD-2",
    code: "BD-BRA",
    nameEn: "Brahmanbaria",
    nameBn: "ব্রাহ্মণবাড়িয়া",
  },
  {
    divisionCode: "BD-2",
    code: "BD-CHA",
    nameEn: "Chandpur",
    nameBn: "চাঁদপুর",
  },
  { divisionCode: "BD-2", code: "BD-FEN", nameEn: "Feni", nameBn: "ফেনী" },
  {
    divisionCode: "BD-2",
    code: "BD-LAK",
    nameEn: "Lakshmipur",
    nameBn: "লক্ষ্মীপুর",
  },
  {
    divisionCode: "BD-2",
    code: "BD-NOA",
    nameEn: "Noakhali",
    nameBn: "নোয়াখালী",
  },
  {
    divisionCode: "BD-2",
    code: "BD-KHG",
    nameEn: "Khagrachhari",
    nameBn: "খাগড়াছড়ি",
  },
  {
    divisionCode: "BD-2",
    code: "BD-RAN",
    nameEn: "Rangamati",
    nameBn: "রাঙ্গামাটি",
  },
  {
    divisionCode: "BD-2",
    code: "BD-BAN",
    nameEn: "Bandarban",
    nameBn: "বান্দরবান",
  },

  // Rajshahi Division
  {
    divisionCode: "BD-3",
    code: "BD-RAJS",
    nameEn: "Rajshahi",
    nameBn: "রাজশাহী",
  },
  { divisionCode: "BD-3", code: "BD-NAT", nameEn: "Natore", nameBn: "নাটোর" },
  {
    divisionCode: "BD-3",
    code: "BD-NAW",
    nameEn: "Chapai Nawabganj",
    nameBn: "চাঁপাইনবাবগঞ্জ",
  },
  { divisionCode: "BD-3", code: "BD-NAO", nameEn: "Naogaon", nameBn: "নওগাঁ" },
  { divisionCode: "BD-3", code: "BD-PAB", nameEn: "Pabna", nameBn: "পাবনা" },
  {
    divisionCode: "BD-3",
    code: "BD-SIR",
    nameEn: "Sirajganj",
    nameBn: "সিরাজগঞ্জ",
  },
  { divisionCode: "BD-3", code: "BD-BOG", nameEn: "Bogura", nameBn: "বগুড়া" },
  {
    divisionCode: "BD-3",
    code: "BD-JOY",
    nameEn: "Joypurhat",
    nameBn: "জয়পুরহাট",
  },

  // Khulna Division
  { divisionCode: "BD-4", code: "BD-KHU", nameEn: "Khulna", nameBn: "খুলনা" },
  {
    divisionCode: "BD-4",
    code: "BD-BAG",
    nameEn: "Bagerhat",
    nameBn: "বাগেরহাট",
  },
  {
    divisionCode: "BD-4",
    code: "BD-SAT",
    nameEn: "Satkhira",
    nameBn: "সাতক্ষীরা",
  },
  { divisionCode: "BD-4", code: "BD-JES", nameEn: "Jashore", nameBn: "যশোর" },
  {
    divisionCode: "BD-4",
    code: "BD-JHE",
    nameEn: "Jhenaidah",
    nameBn: "ঝিনাইদহ",
  },
  { divisionCode: "BD-4", code: "BD-MAG", nameEn: "Magura", nameBn: "মাগুরা" },
  { divisionCode: "BD-4", code: "BD-NARA", nameEn: "Narail", nameBn: "নড়াইল" },
  {
    divisionCode: "BD-4",
    code: "BD-KUS",
    nameEn: "Kushtia",
    nameBn: "কুষ্টিয়া",
  },
  {
    divisionCode: "BD-4",
    code: "BD-CHU",
    nameEn: "Chuadanga",
    nameBn: "চুয়াডাঙ্গা",
  },
  {
    divisionCode: "BD-4",
    code: "BD-MEH",
    nameEn: "Meherpur",
    nameBn: "মেহেরপুর",
  },

  // Barishal Division
  {
    divisionCode: "BD-5",
    code: "BD-BAR",
    nameEn: "Barishal",
    nameBn: "বরিশাল",
  },
  { divisionCode: "BD-5", code: "BD-BHO", nameEn: "Bhola", nameBn: "ভোলা" },
  {
    divisionCode: "BD-5",
    code: "BD-PAT",
    nameEn: "Patuakhali",
    nameBn: "পটুয়াখালী",
  },
  {
    divisionCode: "BD-5",
    code: "BD-PIR",
    nameEn: "Pirojpur",
    nameBn: "পিরোজপুর",
  },
  {
    divisionCode: "BD-5",
    code: "BD-BARG",
    nameEn: "Barguna",
    nameBn: "বরগুনা",
  },
  {
    divisionCode: "BD-5",
    code: "BD-JHA",
    nameEn: "Jhalokati",
    nameBn: "ঝালকাঠি",
  },

  // Sylhet Division
  { divisionCode: "BD-6", code: "BD-SYL", nameEn: "Sylhet", nameBn: "সিলেট" },
  {
    divisionCode: "BD-6",
    code: "BD-MOU",
    nameEn: "Moulvibazar",
    nameBn: "মৌলভীবাজার",
  },
  {
    divisionCode: "BD-6",
    code: "BD-HAB",
    nameEn: "Habiganj",
    nameBn: "হবিগঞ্জ",
  },
  {
    divisionCode: "BD-6",
    code: "BD-SUN",
    nameEn: "Sunamganj",
    nameBn: "সুনামগঞ্জ",
  },

  // Rangpur Division
  { divisionCode: "BD-7", code: "BD-RANP", nameEn: "Rangpur", nameBn: "রংপুর" },
  {
    divisionCode: "BD-7",
    code: "BD-DIN",
    nameEn: "Dinajpur",
    nameBn: "দিনাজপুর",
  },
  {
    divisionCode: "BD-7",
    code: "BD-GAI",
    nameEn: "Gaibandha",
    nameBn: "গাইবান্ধা",
  },
  {
    divisionCode: "BD-7",
    code: "BD-KUR",
    nameEn: "Kurigram",
    nameBn: "কুড়িগ্রাম",
  },
  {
    divisionCode: "BD-7",
    code: "BD-LAL",
    nameEn: "Lalmonirhat",
    nameBn: "লালমনিরহাট",
  },
  {
    divisionCode: "BD-7",
    code: "BD-NIL",
    nameEn: "Nilphamari",
    nameBn: "নীলফামারী",
  },
  {
    divisionCode: "BD-7",
    code: "BD-PAN",
    nameEn: "Panchagarh",
    nameBn: "পঞ্চগড়",
  },
  {
    divisionCode: "BD-7",
    code: "BD-THA",
    nameEn: "Thakurgaon",
    nameBn: "ঠাকুরগাঁও",
  },

  // Mymensingh Division
  {
    divisionCode: "BD-8",
    code: "BD-MYM",
    nameEn: "Mymensingh",
    nameBn: "ময়মনসিংহ",
  },
  {
    divisionCode: "BD-8",
    code: "BD-JAM",
    nameEn: "Jamalpur",
    nameBn: "জামালপুর",
  },
  {
    divisionCode: "BD-8",
    code: "BD-NET",
    nameEn: "Netrokona",
    nameBn: "নেত্রকোণা",
  },
  { divisionCode: "BD-8", code: "BD-SHE", nameEn: "Sherpur", nameBn: "শেরপুর" },
];

async function seedDivisionsAndDistricts() {
  console.log("🌱 Seeding Bangladesh divisions & districts...");

  // Seed divisions
  const divisionMap = new Map<string, number>();
  for (const div of divisions) {
    const created = await prisma.division.upsert({
      where: { code: div.code },
      update: { nameEn: div.nameEn, nameBn: div.nameBn },
      create: div,
    });
    divisionMap.set(div.code, created.id);
  }

  // Seed districts linked to divisions
  for (const d of divisionDistricts) {
    await prisma.district.upsert({
      where: { code: d.code },
      update: {
        nameEn: d.nameEn,
        nameBn: d.nameBn,
        divisionId: divisionMap.get(d.divisionCode)!,
      },
      create: {
        code: d.code,
        nameEn: d.nameEn,
        nameBn: d.nameBn,
        divisionId: divisionMap.get(d.divisionCode)!,
      },
    });
  }

  console.log(
    `✅ Seeded ${divisions.length} divisions & ${divisionDistricts.length} districts.`,
  );
}

seedDivisionsAndDistricts()
  .catch((e) => {
    console.error("❌ District seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
