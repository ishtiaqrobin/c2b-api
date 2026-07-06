import { prisma } from "../../src/app/lib/prisma";

// Bangladesh 64 districts (used via the existing `Prefecture` model).
// code: "BD-XXX", nameEn / nameBn.
const districts: { code: string; nameEn: string; nameBn: string }[] = [
  // Dhaka Division
  { code: "BD-DHA", nameEn: "Dhaka", nameBn: "ঢাকা" },
  { code: "BD-GAZ", nameEn: "Gazipur", nameBn: "গাজীপুর" },
  { code: "BD-NAR", nameEn: "Narayanganj", nameBn: "নারায়ণগঞ্জ" },
  { code: "BD-NRS", nameEn: "Narsingdi", nameBn: "নরসিংদী" },
  { code: "BD-MAN", nameEn: "Manikganj", nameBn: "মানিকগঞ্জ" },
  { code: "BD-MUN", nameEn: "Munshiganj", nameBn: "মুন্সিগঞ্জ" },
  { code: "BD-TAN", nameEn: "Tangail", nameBn: "টাঙ্গাইল" },
  { code: "BD-KIS", nameEn: "Kishoreganj", nameBn: "কিশোরগঞ্জ" },
  { code: "BD-FAR", nameEn: "Faridpur", nameBn: "ফরিদপুর" },
  { code: "BD-GOP", nameEn: "Gopalganj", nameBn: "গোপালগঞ্জ" },
  { code: "BD-MAD", nameEn: "Madaripur", nameBn: "মাদারীপুর" },
  { code: "BD-RAJ", nameEn: "Rajbari", nameBn: "রাজবাড়ী" },
  { code: "BD-SHA", nameEn: "Shariatpur", nameBn: "শরীয়তপুর" },

  // Chattogram Division
  { code: "BD-CTG", nameEn: "Chattogram", nameBn: "চট্টগ্রাম" },
  { code: "BD-COX", nameEn: "Cox's Bazar", nameBn: "কক্সবাজার" },
  { code: "BD-CAN", nameEn: "Cumilla", nameBn: "কুমিল্লা" },
  { code: "BD-BRA", nameEn: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া" },
  { code: "BD-CHA", nameEn: "Chandpur", nameBn: "চাঁদপুর" },
  { code: "BD-FEN", nameEn: "Feni", nameBn: "ফেনী" },
  { code: "BD-LAK", nameEn: "Lakshmipur", nameBn: "লক্ষ্মীপুর" },
  { code: "BD-NOA", nameEn: "Noakhali", nameBn: "নোয়াখালী" },
  { code: "BD-KHG", nameEn: "Khagrachhari", nameBn: "খাগড়াছড়ি" },
  { code: "BD-RAN", nameEn: "Rangamati", nameBn: "রাঙ্গামাটি" },
  { code: "BD-BAN", nameEn: "Bandarban", nameBn: "বান্দরবান" },

  // Rajshahi Division
  { code: "BD-RAJS", nameEn: "Rajshahi", nameBn: "রাজশাহী" },
  { code: "BD-NAT", nameEn: "Natore", nameBn: "নাটোর" },
  { code: "BD-NAW", nameEn: "Chapai Nawabganj", nameBn: "চাঁপাইনবাবগঞ্জ" },
  { code: "BD-NAO", nameEn: "Naogaon", nameBn: "নওগাঁ" },
  { code: "BD-PAB", nameEn: "Pabna", nameBn: "পাবনা" },
  { code: "BD-SIR", nameEn: "Sirajganj", nameBn: "সিরাজগঞ্জ" },
  { code: "BD-BOG", nameEn: "Bogura", nameBn: "বগুড়া" },
  { code: "BD-JOY", nameEn: "Joypurhat", nameBn: "জয়পুরহাট" },

  // Khulna Division
  { code: "BD-KHU", nameEn: "Khulna", nameBn: "খুলনা" },
  { code: "BD-BAG", nameEn: "Bagerhat", nameBn: "বাগেরহাট" },
  { code: "BD-SAT", nameEn: "Satkhira", nameBn: "সাতক্ষীরা" },
  { code: "BD-JES", nameEn: "Jashore", nameBn: "যশোর" },
  { code: "BD-JHE", nameEn: "Jhenaidah", nameBn: "ঝিনাইদহ" },
  { code: "BD-MAG", nameEn: "Magura", nameBn: "মাগুরা" },
  { code: "BD-NARA", nameEn: "Narail", nameBn: "নড়াইল" },
  { code: "BD-KUS", nameEn: "Kushtia", nameBn: "কুষ্টিয়া" },
  { code: "BD-CHU", nameEn: "Chuadanga", nameBn: "চুয়াডাঙ্গা" },
  { code: "BD-MEH", nameEn: "Meherpur", nameBn: "মেহেরপুর" },

  // Barishal Division
  { code: "BD-BAR", nameEn: "Barishal", nameBn: "বরিশাল" },
  { code: "BD-BHO", nameEn: "Bhola", nameBn: "ভোলা" },
  { code: "BD-PAT", nameEn: "Patuakhali", nameBn: "পটুয়াখালী" },
  { code: "BD-PIR", nameEn: "Pirojpur", nameBn: "পিরোজপুর" },
  { code: "BD-BARG", nameEn: "Barguna", nameBn: "বরগুনা" },
  { code: "BD-JHA", nameEn: "Jhalokati", nameBn: "ঝালকাঠি" },

  // Sylhet Division
  { code: "BD-SYL", nameEn: "Sylhet", nameBn: "সিলেট" },
  { code: "BD-MOU", nameEn: "Moulvibazar", nameBn: "মৌলভীবাজার" },
  { code: "BD-HAB", nameEn: "Habiganj", nameBn: "হবিগঞ্জ" },
  { code: "BD-SUN", nameEn: "Sunamganj", nameBn: "সুনামগঞ্জ" },

  // Rangpur Division
  { code: "BD-RANP", nameEn: "Rangpur", nameBn: "রংপুর" },
  { code: "BD-DIN", nameEn: "Dinajpur", nameBn: "দিনাজপুর" },
  { code: "BD-GAI", nameEn: "Gaibandha", nameBn: "গাইবান্ধা" },
  { code: "BD-KUR", nameEn: "Kurigram", nameBn: "কুড়িগ্রাম" },
  { code: "BD-LAL", nameEn: "Lalmonirhat", nameBn: "লালমনিরহাট" },
  { code: "BD-NIL", nameEn: "Nilphamari", nameBn: "নীলফামারী" },
  { code: "BD-PAN", nameEn: "Panchagarh", nameBn: "পঞ্চগড়" },
  { code: "BD-THA", nameEn: "Thakurgaon", nameBn: "ঠাকুরগাঁও" },

  // Mymensingh Division
  { code: "BD-MYM", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ" },
  { code: "BD-JAM", nameEn: "Jamalpur", nameBn: "জামালপুর" },
  { code: "BD-NET", nameEn: "Netrokona", nameBn: "নেত্রকোণা" },
  { code: "BD-SHE", nameEn: "Sherpur", nameBn: "শেরপুর" },
];

async function seedDistricts() {
  console.log("🌱 Seeding Bangladesh districts...");

  for (const d of districts) {
    await prisma.prefecture.upsert({
      where: { code: d.code },
      update: { nameEn: d.nameEn, nameBn: d.nameBn },
      create: d,
    });
  }

  console.log(`✅ Seeded ${districts.length} districts.`);
}

seedDistricts()
  .catch((e) => {
    console.error("❌ District seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
