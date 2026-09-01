import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function avatarUrl(name) {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=006948&color=fff&size=256&bold=true`;
}

function portfolioUrls(seed, count = 3) {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/640/480`);
}

const seedProfessionals = [
  {
    email: "arjun.rao@promarket.dev",
    name: "Arjun Rao",
    title: "Master Plumber",
    trade: "Plumbing",
    yearsExperience: 12,
    ratingAvg: 4.9,
    reviewCount: 214,
    hourlyRate: 45,
    verified: true,
    location: "Bangalore, IN",
    latitude: 12.9716,
    longitude: 77.5946,
    availability: "Available Today",
    skills: ["Pipe Repair", "Leak Detection"],
    bio: "Arjun has spent over a decade solving plumbing problems for homes and small businesses across the city, known for clean work and honest quotes.",
    trustBadges: ["Licensed & Insured", "Background Checked", "Emergency Service"],
    servicesOffered: [
      { title: "Leak Repair", subtext: "Fixes for pipes, faucets, and fixtures" },
      { title: "Drain Cleaning", subtext: "Clog removal and maintenance" },
      { title: "Water Heater Install", subtext: "New unit setup and replacement" },
      { title: "Emergency Plumbing", subtext: "Same-day response for urgent issues" },
    ],
  },
  {
    email: "priya.menon@promarket.dev",
    name: "Priya Menon",
    title: "Interior Painter",
    trade: "Painting",
    yearsExperience: 7,
    ratingAvg: 4.8,
    reviewCount: 132,
    hourlyRate: 35,
    verified: true,
    location: "Bangalore, IN",
    latitude: 12.9352,
    longitude: 77.6245,
    availability: "Available Tomorrow",
    skills: ["Interior Painting", "Wall Prep"],
    bio: "Priya brings a designer's eye to every painting job, specializing in clean lines, color consulting, and durable finishes for homes.",
    trustBadges: ["Licensed & Insured", "Background Checked"],
    servicesOffered: [
      { title: "Interior Painting", subtext: "Living rooms, bedrooms, ceilings" },
      { title: "Wall Prep & Repair", subtext: "Filling, sanding, priming" },
      { title: "Color Consulting", subtext: "Help choosing the right palette" },
    ],
  },
  {
    email: "vikram.shah@promarket.dev",
    name: "Vikram Shah",
    title: "Licensed Electrician",
    trade: "Electrical",
    yearsExperience: 9,
    ratingAvg: 4.7,
    reviewCount: 98,
    hourlyRate: 50,
    verified: true,
    location: "Bangalore, IN",
    latitude: 12.9784,
    longitude: 77.6408,
    availability: "Available Today",
    skills: ["Wiring", "Fixture Install"],
    bio: "Vikram handles everything from a single outlet swap to a full rewiring job, with a strong focus on safety and code compliance.",
    trustBadges: ["Licensed & Insured", "Background Checked", "Emergency Service"],
    servicesOffered: [
      { title: "Outlet Installation", subtext: "New outlets and switches" },
      { title: "Light Fixture Install", subtext: "Ceiling fans, fixtures, dimmers" },
      { title: "Panel Upgrades", subtext: "Breaker panel replacement" },
    ],
  },
  {
    email: "meera.das@promarket.dev",
    name: "Meera Das",
    title: "House Cleaning Specialist",
    trade: "Cleaning",
    yearsExperience: 5,
    ratingAvg: 4.9,
    reviewCount: 176,
    hourlyRate: 28,
    verified: true,
    location: "Bangalore, IN",
    latitude: 12.9165,
    longitude: 77.6101,
    availability: "Available This Week",
    skills: ["Deep Cleaning", "Move-out Cleaning"],
    bio: "Meera leads a small, trusted cleaning team known for thorough, reliable service and flexible scheduling.",
    trustBadges: ["Background Checked"],
    servicesOffered: [
      { title: "Standard Cleaning", subtext: "Weekly or bi-weekly upkeep" },
      { title: "Deep Cleaning", subtext: "Top-to-bottom one-time clean" },
      { title: "Move-out Cleaning", subtext: "Full clean for move-in/move-out" },
    ],
  },
];

async function main() {
  for (const [index, entry] of seedProfessionals.entries()) {
    const firebaseUid = `seed-${index + 1}`;

    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: {},
      create: {
        firebaseUid,
        email: entry.email,
        name: entry.name,
        role: "EMPLOYEE",
      },
    });

    const professional = await prisma.professional.upsert({
      where: { userId: user.id },
      update: { latitude: entry.latitude, longitude: entry.longitude },
      create: {
        userId: user.id,
        title: entry.title,
        trade: entry.trade,
        yearsExperience: entry.yearsExperience,
        hourlyRate: entry.hourlyRate,
        bio: entry.bio,
        location: entry.location,
        latitude: entry.latitude,
        longitude: entry.longitude,
        avatar: avatarUrl(entry.name),
        verified: entry.verified,
        availability: entry.availability,
        ratingAvg: entry.ratingAvg,
        reviewCount: entry.reviewCount,
      },
    });

    for (const skillName of entry.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });
      await prisma.professionalSkill.upsert({
        where: {
          professionalId_skillId: {
            professionalId: professional.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: { professionalId: professional.id, skillId: skill.id },
      });
    }

    for (const label of entry.trustBadges) {
      const existing = await prisma.trustBadge.findFirst({
        where: { professionalId: professional.id, label },
      });
      if (!existing) {
        await prisma.trustBadge.create({
          data: { professionalId: professional.id, label },
        });
      }
    }

    for (const url of portfolioUrls(entry.email.split("@")[0])) {
      const existing = await prisma.portfolioImage.findFirst({
        where: { professionalId: professional.id, url },
      });
      if (!existing) {
        await prisma.portfolioImage.create({
          data: { professionalId: professional.id, url },
        });
      }
    }

    for (const service of entry.servicesOffered) {
      const existing = await prisma.service.findFirst({
        where: { professionalId: professional.id, title: service.title },
      });
      if (!existing) {
        await prisma.service.create({
          data: {
            professionalId: professional.id,
            title: service.title,
            subtext: service.subtext,
          },
        });
      }
    }

    console.log(`Seeded ${entry.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
