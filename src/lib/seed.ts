import { db } from "@/db";
import {
  locations,
  reviews,
  services,
  serviceImages,
  serviceStaff,
  staff,
  staffSchedule,
  type NewLocation,
  type NewReview,
  type NewService,
  type NewStaff,
} from "@/db/schema";
import { sql } from "drizzle-orm";

const IMG = {
  twists: "/images/services/twists.jpg",
  goddessSynthetic: "/images/services/goddess-synthetic.jpg",
  goddessHuman: "/images/services/goddess-human.jpg",
  frenchCurl: "/images/services/french-curl.jpg",
  riverlocks: "/images/services/riverlocks.jpg",
  springTwist: "/images/services/spring-twist.jpg",
  scalpDetox: "/images/services/scalp-detox.jpg",
  kids: "https://images.pexels.com/photos/15136190/pexels-photo-15136190.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  lashes:
    "https://images.pexels.com/photos/36930354/pexels-photo-36930354.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
  wash: "https://images.pexels.com/photos/16563139/pexels-photo-16563139.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
};

export const SEED_SERVICES: NewService[] = [
  // Twists
  {
    slug: "shoulder-twist",
    name: "Shoulder Length Twist",
    category: "twists",
    shortDescription: "Neat, lightweight twists that sit just at the shoulder.",
    description:
      "Our classic twist, installed with the Giftedhands no-pain technique so your edges stay protected and your scalp stays calm. Shoulder length is perfect if you want something light, quick to style and easy to maintain. Hair is included.",
    priceRands: 450,
    durationMinutes: 180,
    imageUrl: IMG.twists,
    hairIncluded: true,
    featured: false,
    sortOrder: 10,
  },
  {
    slug: "bra-length-twist",
    name: "Bra Length Twist",
    category: "twists",
    shortDescription: "Our most-booked twist length — full, soft and versatile.",
    description:
      "Bra-length twists give you movement and length without the weight. Installed gently, section by section, with hair included. Wear them down, half-up or in a high bun — they hold beautifully for 6–8 weeks with the right care.",
    priceRands: 650,
    durationMinutes: 240,
    imageUrl: IMG.twists,
    hairIncluded: true,
    featured: true,
    sortOrder: 11,
  },
  {
    slug: "waist-length-twist",
    name: "Waist Length Twist",
    category: "twists",
    shortDescription: "Dramatic, flowing twists that fall to the waist.",
    description:
      "Full-length twists for maximum drama. We keep the roots feather-light so the length never pulls, and finish every twist with sealed ends. Hair is included.",
    priceRands: 850,
    durationMinutes: 300,
    imageUrl: IMG.twists,
    hairIncluded: true,
    featured: false,
    sortOrder: 12,
  },
  {
    slug: "own-hair-twist-treatment",
    name: "Own Hair Twist with Treatment",
    category: "twists",
    shortDescription: "Two-strand twists on your natural hair, with a deep treatment.",
    description:
      "A nourishing option for natural hair: we start with a deep-conditioning treatment, then twist your own hair into neat two-strand twists. Great as a protective style on its own or as a twist-out base.",
    priceRands: 550,
    durationMinutes: 180,
    imageUrl: IMG.scalpDetox,
    hairIncluded: false,
    featured: false,
    sortOrder: 13,
  },
  {
    slug: "spring-twist-shoulder",
    name: "Spring Twist — Shoulder Length",
    category: "twists",
    shortDescription: "Bouncy, coily spring twists with loads of volume.",
    description:
      "Spring twists give you that springy, full-bodied look with a natural coil texture. Shoulder length keeps them light and playful. Hair is included.",
    priceRands: 750,
    durationMinutes: 240,
    imageUrl: IMG.springTwist,
    hairIncluded: true,
    featured: false,
    sortOrder: 14,
  },
  {
    slug: "spring-twist-bra",
    name: "Spring Twist — Bra Length",
    category: "twists",
    shortDescription: "Longer spring twists with full, bouncy body.",
    description:
      "The same coily bounce, with more length to play with. Our stylists install spring twists with a gentle grip at the root so they never feel tight. Hair is included.",
    priceRands: 950,
    durationMinutes: 300,
    imageUrl: IMG.springTwist,
    hairIncluded: true,
    featured: false,
    sortOrder: 15,
  },

  // Goddess braids
  {
    slug: "shoulder-goddess-synthetic",
    name: "Shoulder Goddess — Synthetic Curls",
    category: "goddess",
    shortDescription: "Knotless braids with soft synthetic curls at the shoulder.",
    description:
      "Knotless goddess braids finished with soft, wavy synthetic curls that flow between the braids. Shoulder length is light, elegant and easy to style. Hair is included.",
    priceRands: 650,
    durationMinutes: 240,
    imageUrl: IMG.goddessSynthetic,
    hairIncluded: true,
    featured: false,
    sortOrder: 20,
  },
  {
    slug: "bra-length-goddess-synthetic",
    name: "Bra Length Goddess — Synthetic Curls",
    category: "goddess",
    shortDescription: "Our best-selling goddess look — boho curls, bra length.",
    description:
      "The boho goddess look everyone asks for: knotless braids with loose synthetic curls woven through, falling to bra length. Installed pain-free with edges left intact. Hair is included.",
    priceRands: 850,
    durationMinutes: 300,
    imageUrl: IMG.goddessSynthetic,
    hairIncluded: true,
    featured: true,
    sortOrder: 21,
  },
  {
    slug: "waist-length-goddess-synthetic",
    name: "Waist Length Goddess — Synthetic Curls",
    category: "goddess",
    shortDescription: "Full-length goddess braids with flowing synthetic curls.",
    description:
      "Waist-length goddess braids for a show-stopping finish. Lightweight knotless roots mean you get all the length without the tension. Hair is included.",
    priceRands: 1100,
    durationMinutes: 360,
    imageUrl: IMG.goddessSynthetic,
    hairIncluded: true,
    featured: false,
    sortOrder: 22,
  },
  {
    slug: "shoulder-goddess-human-hair",
    name: "Shoulder Goddess — Human Hair",
    category: "goddess",
    shortDescription: "Premium human-hair curls for a silky, natural finish.",
    description:
      "Upgrade to human-hair curls for a softer, more natural feel that can be washed, re-curled and worn for longer. Shoulder length, knotless, and installed with zero pulling. Hair is included.",
    priceRands: 1200,
    durationMinutes: 240,
    imageUrl: IMG.goddessHuman,
    hairIncluded: true,
    featured: false,
    sortOrder: 23,
  },
  {
    slug: "bra-length-goddess-human-hair",
    name: "Bra Length Goddess — Human Hair",
    category: "goddess",
    shortDescription: "Luxurious bra-length goddess braids with human hair.",
    description:
      "Our luxury goddess install: knotless braids with premium human-hair curls to bra length. Silky, glossy and reusable. Hair is included.",
    priceRands: 1800,
    durationMinutes: 300,
    imageUrl: IMG.goddessHuman,
    hairIncluded: true,
    featured: true,
    sortOrder: 24,
  },
  {
    slug: "waist-length-goddess-human-hair",
    name: "Waist Length Goddess — Human Hair",
    category: "goddess",
    shortDescription: "The ultimate goddess look — waist length, human hair.",
    description:
      "Everything about this install is premium: waist-length knotless braids, human-hair curls, and hours of careful, pain-free work. Perfect for weddings, shoots and special occasions. Hair is included.",
    priceRands: 2400,
    durationMinutes: 360,
    imageUrl: IMG.goddessHuman,
    hairIncluded: true,
    featured: false,
    sortOrder: 25,
  },

  // Signature
  {
    slug: "french-curl",
    name: "French Curl Braids",
    category: "signature",
    shortDescription: "Knotless braids ending in bouncy, loose spiral curls.",
    description:
      "French Curl braids combine sleek knotless braids with soft, bouncy curls at the ends for a romantic, feminine finish. A Giftedhands signature — installed gently and finished to perfection. Hair is included.",
    priceRands: 1200,
    durationMinutes: 300,
    imageUrl: IMG.frenchCurl,
    hairIncluded: true,
    featured: true,
    sortOrder: 30,
  },
  {
    slug: "riverlocks",
    name: "Riverlocks",
    category: "signature",
    shortDescription: "Boho faux locs with loose waves flowing between them.",
    description:
      "Riverlocks (river locs) are soft boho faux locs with wavy human-feel strands flowing between the locs — effortless, beachy and beautiful. Lightweight and comfortable from day one. Hair is included.",
    priceRands: 1200,
    durationMinutes: 300,
    imageUrl: IMG.riverlocks,
    hairIncluded: true,
    featured: true,
    sortOrder: 31,
  },

  // Specials
  {
    slug: "bra-length-special-your-hair",
    name: "Bra Length Special — With Your Hair",
    category: "specials",
    shortDescription: "Bring your own braiding hair and save.",
    description:
      "Our bra-length knotless braid special for clients who bring their own hair. Same no-pain technique, same neat finish, friendlier price. Please bring 6–8 packs of pre-stretched braiding hair.",
    priceRands: 450,
    durationMinutes: 240,
    imageUrl: IMG.twists,
    hairIncluded: false,
    featured: false,
    sortOrder: 40,
  },
  {
    slug: "bra-length-special-our-hair",
    name: "Bra Length Special — With Our Hair",
    category: "specials",
    shortDescription: "Bra-length braids with hair included, at a special price.",
    description:
      "Everything sorted for you: we supply quality pre-stretched braiding hair in your chosen colour and install bra-length knotless braids. Just arrive with clean, blow-dried hair.",
    priceRands: 550,
    durationMinutes: 240,
    imageUrl: IMG.twists,
    hairIncluded: true,
    featured: true,
    sortOrder: 41,
  },

  // Kids
  {
    slug: "kids-braids",
    name: "Kids Braids",
    category: "kids",
    shortDescription: "Gentle, tear-free braids for little ones (12 and under).",
    description:
      "We are known for braiding kids without tears. Our stylists work gently and quickly, with lots of breaks and zero tension on delicate edges. Final price depends on length and style — we confirm before we start.",
    priceRands: 300,
    priceFrom: true,
    durationMinutes: 150,
    imageUrl: IMG.kids,
    hairIncluded: true,
    featured: false,
    sortOrder: 50,
  },

  // Treatments
  {
    slug: "scalp-detox-treatment",
    name: "Scalp Detox Treatment",
    category: "treatments",
    shortDescription: "Deep-cleansing detox to reset your scalp before or after braids.",
    description:
      "A deep-cleansing, exfoliating scalp treatment that removes build-up, soothes itching and stimulates healthy growth. Ideal before a new install or as a reset after taking braids down. Includes a relaxing scalp massage.",
    priceRands: 350,
    durationMinutes: 60,
    imageUrl: IMG.scalpDetox,
    hairIncluded: false,
    featured: false,
    sortOrder: 60,
  },
  {
    slug: "wash-condition-blow",
    name: "Wash, Condition & Blow Dry",
    category: "treatments",
    shortDescription: "Prep your hair for a flawless install.",
    description:
      "A thorough wash, conditioning treatment and stretch blow-dry. Book this before your braiding appointment if you can't arrive with clean, stretched hair.",
    priceRands: 150,
    priceFrom: true,
    durationMinutes: 60,
    imageUrl: IMG.wash,
    hairIncluded: false,
    featured: false,
    sortOrder: 61,
  },

  // Lashes (Centurion)
  {
    slug: "classic-lashes",
    name: "Classic Lashes",
    category: "lashes",
    shortDescription: "One extension per natural lash for a clean, defined look.",
    description:
      "Classic lash extensions applied one-to-one for natural length and definition. Available at our Centurion branch.",
    priceRands: 350,
    durationMinutes: 90,
    imageUrl: IMG.lashes,
    hairIncluded: true,
    centurionOnly: true,
    featured: false,
    sortOrder: 70,
  },
  {
    slug: "hybrid-lashes",
    name: "Hybrid Lashes",
    category: "lashes",
    shortDescription: "A textured mix of classic and volume fans.",
    description:
      "Hybrid lashes blend classic single extensions with light volume fans for a fuller, textured lash line. Available at our Centurion branch.",
    priceRands: 300,
    durationMinutes: 90,
    imageUrl: IMG.lashes,
    hairIncluded: true,
    centurionOnly: true,
    featured: false,
    sortOrder: 71,
  },
  {
    slug: "wispy-hybrid-lashes",
    name: "Wispy Hybrid Lashes",
    category: "lashes",
    shortDescription: "Fluttery, spiked wispy hybrid set.",
    description:
      "Our wispy hybrid set adds fluttery spikes for that soft, doll-eye effect. Available at our Centurion branch.",
    priceRands: 350,
    durationMinutes: 100,
    imageUrl: IMG.lashes,
    hairIncluded: true,
    centurionOnly: true,
    featured: false,
    sortOrder: 72,
  },
];

export const SEED_LOCATIONS: NewLocation[] = [
  {
    slug: "centurion",
    name: "Centurion",
    addressLine: "24 Kersieboom Crescent, Zwartkop",
    area: "Centurion, Gauteng",
    description:
      "Our home branch in the heart of Zwartkop, Centurion. Braiding, treatments and lash extensions under one roof, with safe parking.",
    callOutFeeRands: 0,
    capacity: 3,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=24+Kersieboom+Crescent+Zwartkop+Centurion",
    isHouseCall: false,
    sortOrder: 1,
  },
  {
    slug: "fourways",
    name: "Fourways",
    addressLine: "173 Main Road, Rietfontein — inside Belleza Beauty House",
    area: "Fourways, Johannesburg",
    description:
      "Find us inside Belleza Beauty House on Main Road — the perfect spot to pair your braids with a nail or beauty appointment.",
    callOutFeeRands: 0,
    capacity: 2,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=173+Main+Road+Rietfontein+Fourways",
    isHouseCall: false,
    sortOrder: 2,
  },
  {
    slug: "house-call",
    name: "House Call",
    addressLine: "We come to you — Pretoria & Johannesburg",
    area: "Gauteng",
    description:
      "Get braided in the comfort of your own home. A R200 call-out fee applies and is added to your service price. Please make sure there is a comfortable chair and good lighting.",
    callOutFeeRands: 200,
    capacity: 1,
    mapsUrl: null,
    isHouseCall: true,
    sortOrder: 3,
  },
];

export const SEED_REVIEWS: NewReview[] = [
  {
    customerName: "Thandiwe M.",
    rating: 5,
    comment:
      "I have never had braids done with zero headache afterwards — until Giftedhands. My goddess braids are neat, light and my edges are still intact. Worth every rand.",
    serviceName: "Bra Length Goddess — Synthetic Curls",
    approved: true,
  },
  {
    customerName: "Lerato K.",
    rating: 5,
    comment:
      "Booked a house call for my daughter and I in Fourways. She usually cries through braiding but she actually fell asleep! The 'no pain' promise is real.",
    serviceName: "Kids Braids",
    approved: true,
  },
  {
    customerName: "Nomvula S.",
    rating: 5,
    comment:
      "The French Curl is stunning. Everyone at work asked where I got it done. Professional, on time, and the salon is spotless.",
    serviceName: "French Curl Braids",
    approved: true,
  },
  {
    customerName: "Ayanda D.",
    rating: 5,
    comment:
      "Riverlocks were exactly like the picture. Lightweight from day one and no tightness at all. Already booked my next appointment.",
    serviceName: "Riverlocks",
    approved: true,
  },
  {
    customerName: "Precious N.",
    rating: 4,
    comment:
      "Loved my bra-length twists and the scalp detox beforehand felt amazing. Only wish I'd booked earlier — weekend slots go fast!",
    serviceName: "Bra Length Twist",
    approved: true,
  },
  {
    customerName: "Zanele P.",
    rating: 5,
    comment:
      "Human hair goddess braids for my wedding — absolutely flawless and they lasted through the honeymoon. Thank you, Giftedhands!",
    serviceName: "Bra Length Goddess — Human Hair",
    approved: true,
  },
];

export const SEED_STAFF: NewStaff[] = [
  {
    name: "Thembi Ndlovu",
    slug: "thembi-ndlovu",
    role: "braider",
    avatar: "/images/staff-avatar.png",
    bio: "Primary goddess-braid and knotless specialist with gentle, patient hands.",
    active: true,
    sortOrder: 1,
  },
  {
    name: "Zanele Maseko",
    slug: "zanele-maseko",
    role: "braider",
    avatar: "/images/staff-avatar.png",
    bio: "Fast twist and kids-braiding specialist; excellent with sensitive scalps.",
    active: true,
    sortOrder: 2,
  },
  {
    name: "Busisiwe Dlamini",
    slug: "busisiwe-dlamini",
    role: "braider",
    avatar: "/images/staff-avatar.png",
    bio: "Riverlocks, French Curl and longer installs — neat parting and soft finish.",
    active: true,
    sortOrder: 3,
  },
  {
    name: "Amahle Nkosi",
    slug: "amahle-nkosi",
    role: "stylist",
    avatar: "/images/staff-avatar.png",
    bio: "Treatments, lashes and finishing support for busy braiding days.",
    active: true,
    sortOrder: 4,
  },
];

const SERVICE_IMAGE_BY_SLUG: Record<string, string> = {
  "shoulder-twist": IMG.twists,
  "bra-length-twist": IMG.twists,
  "waist-length-twist": IMG.twists,
  "own-hair-twist-treatment": IMG.scalpDetox,
  "spring-twist-shoulder": IMG.springTwist,
  "spring-twist-bra": IMG.springTwist,
  "shoulder-goddess-synthetic": IMG.goddessSynthetic,
  "bra-length-goddess-synthetic": IMG.goddessSynthetic,
  "waist-length-goddess-synthetic": IMG.goddessSynthetic,
  "shoulder-goddess-human-hair": IMG.goddessHuman,
  "bra-length-goddess-human-hair": IMG.goddessHuman,
  "waist-length-goddess-human-hair": IMG.goddessHuman,
  "french-curl": IMG.frenchCurl,
  "riverlocks": IMG.riverlocks,
  "bra-length-special-your-hair": IMG.twists,
  "bra-length-special-our-hair": IMG.twists,
  "kids-braids": IMG.kids,
  "scalp-detox-treatment": IMG.scalpDetox,
  "wash-condition-blow": IMG.wash,
  "classic-lashes": IMG.lashes,
  "hybrid-lashes": IMG.lashes,
  "wispy-hybrid-lashes": IMG.lashes,
};

const STAFF_BY_CATEGORY: Record<string, string[]> = {
  twists: ["zanele-maseko", "thembi-ndlovu", "busisiwe-dlamini"],
  goddess: ["thembi-ndlovu", "busisiwe-dlamini", "zanele-maseko"],
  signature: ["busisiwe-dlamini", "thembi-ndlovu", "zanele-maseko"],
  specials: ["zanele-maseko", "thembi-ndlovu", "busisiwe-dlamini"],
  kids: ["zanele-maseko", "thembi-ndlovu", "amahle-nkosi"],
  treatments: ["amahle-nkosi", "thembi-ndlovu", "zanele-maseko"],
  lashes: ["amahle-nkosi", "busisiwe-dlamini", "thembi-ndlovu"],
};

let seededThisProcess = false;
let inFlight: Promise<void> | null = null;

async function runSeed() {
  await db.transaction(async (tx) => {
    // Serialise concurrent seeders across requests/processes.
    await tx.execute(sql`select pg_advisory_xact_lock(902211)`);

    const [{ count: serviceCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(services);
    if (serviceCount === 0) {
      await tx.insert(services).values(SEED_SERVICES).onConflictDoNothing();
    }

    const [{ count: locationCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(locations);
    if (locationCount === 0) {
      await tx.insert(locations).values(SEED_LOCATIONS).onConflictDoNothing();
    }

    const [{ count: reviewCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews);
    if (reviewCount === 0) {
      await tx.insert(reviews).values(SEED_REVIEWS);
    }

    const [{ count: staffCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(staff);
    if (staffCount === 0) {
      await tx.insert(staff).values(SEED_STAFF).onConflictDoNothing();
    }

    const serviceRows = await tx.select().from(services);
    const staffRows = await tx.select().from(staff);
    const locationRows = await tx.select().from(locations);
    const staffBySlug = new Map(staffRows.map((row) => [row.slug, row]));

    const [{ count: imageCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(serviceImages);
    if (imageCount === 0) {
      const images = serviceRows
        .map((service) => ({
          serviceId: service.id,
          imageUrl: SERVICE_IMAGE_BY_SLUG[service.slug] ?? service.imageUrl,
          caption: service.name,
          sortOrder: 1,
          active: true,
        }));
      if (images.length > 0) {
        await tx.insert(serviceImages).values(images);
      }
    }

    const [{ count: serviceStaffCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(serviceStaff);
    if (serviceStaffCount === 0) {
      const mappings = serviceRows.flatMap((service) =>
        (STAFF_BY_CATEGORY[service.category] ?? ["thembi-ndlovu", "zanele-maseko", "busisiwe-dlamini"])
          .map((staffSlug, index) => {
            const person = staffBySlug.get(staffSlug);
            if (!person) return null;
            return {
              serviceId: service.id,
              staffId: person.id,
              priority: index + 1,
              active: true,
            };
          })
          .filter((row): row is { serviceId: number; staffId: number; priority: number; active: true } => Boolean(row)),
      );
      if (mappings.length > 0) {
        await tx.insert(serviceStaff).values(mappings);
      }
    }

    const [{ count: scheduleCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(staffSchedule);
    if (scheduleCount === 0) {
      const centurion = locationRows.find((row) => row.slug === "centurion");
      const fourways = locationRows.find((row) => row.slug === "fourways");
      const todaySast = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const scheduleRows = [] as Array<{
        staffId: number;
        locationId: number;
        date: string;
        startMinutes: number;
        endMinutes: number;
        capacity: number;
        notes: string;
      }>;

      for (let i = 0; i < 45; i++) {
        const date = new Date(Date.UTC(
          todaySast.getUTCFullYear(),
          todaySast.getUTCMonth(),
          todaySast.getUTCDate() + i,
        ));
        const dateStr = date.toISOString().slice(0, 10);
        const dow = date.getUTCDay();
        const open = dow === 0 ? 9 * 60 : dow === 6 ? 7 * 60 : 7 * 60 + 30;
        const close = dow === 0 ? 15 * 60 : dow === 6 ? 17 * 60 : 18 * 60;
        if (centurion) {
          for (const slug of ["thembi-ndlovu", "zanele-maseko", "amahle-nkosi"]) {
            const person = staffBySlug.get(slug);
            if (person) {
              scheduleRows.push({
                staffId: person.id,
                locationId: centurion.id,
                date: dateStr,
                startMinutes: open,
                endMinutes: close,
                capacity: 1,
                notes: "Seeded branch shift",
              });
            }
          }
        }
        if (fourways) {
          for (const slug of ["busisiwe-dlamini", "zanele-maseko"]) {
            const person = staffBySlug.get(slug);
            if (person) {
              scheduleRows.push({
                staffId: person.id,
                locationId: fourways.id,
                date: dateStr,
                startMinutes: open,
                endMinutes: close,
                capacity: 1,
                notes: "Seeded branch shift",
              });
            }
          }
        }
      }

      if (scheduleRows.length > 0) {
        await tx.insert(staffSchedule).values(scheduleRows);
      }
    }
  });
}

/**
 * Idempotently seeds services, locations and sample reviews when the tables are empty.
 * Safe to call from any server request: concurrent callers share one in-flight run and
 * an advisory lock guards against parallel processes seeding twice.
 */
export async function ensureSeeded() {
  if (seededThisProcess) return;
  if (!inFlight) {
    inFlight = runSeed()
      .then(() => {
        seededThisProcess = true;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  await inFlight;
}
