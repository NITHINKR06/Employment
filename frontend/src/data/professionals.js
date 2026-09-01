function avatarUrl(name) {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=006948&color=fff&size=256&bold=true`;
}

function portfolioUrls(seed, count = 3) {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/640/480`);
}

export const professionals = [
  {
    id: "arjun-rao",
    name: "Arjun Rao",
    title: "Master Plumber",
    trade: "Plumbing",
    yearsExperience: 12,
    rating: 4.9,
    reviewCount: 214,
    hourlyRate: 45,
    avatar: avatarUrl("Arjun Rao"),
    verified: true,
    location: "Bangalore, IN",
    availability: "Available Today",
    skills: ["Pipe Repair", "Leak Detection"],
    bio: "Arjun has spent over a decade solving plumbing problems for homes and small businesses across the city, known for clean work and honest quotes.",
    trustBadges: ["Licensed & Insured", "Background Checked", "Emergency Service"],
    portfolio: portfolioUrls("arjun-rao"),
    servicesOffered: [
      { title: "Leak Repair", subtext: "Fixes for pipes, faucets, and fixtures" },
      { title: "Drain Cleaning", subtext: "Clog removal and maintenance" },
      { title: "Water Heater Install", subtext: "New unit setup and replacement" },
      { title: "Emergency Plumbing", subtext: "Same-day response for urgent issues" },
    ],
  },
  {
    id: "priya-menon",
    name: "Priya Menon",
    title: "Interior Painter",
    trade: "Painting",
    yearsExperience: 7,
    rating: 4.8,
    reviewCount: 132,
    hourlyRate: 35,
    avatar: avatarUrl("Priya Menon"),
    verified: true,
    location: "Bangalore, IN",
    availability: "Available Tomorrow",
    skills: ["Interior Painting", "Wall Prep"],
    bio: "Priya brings a designer's eye to every painting job, specializing in clean lines, color consulting, and durable finishes for homes.",
    trustBadges: ["Licensed & Insured", "Background Checked"],
    portfolio: portfolioUrls("priya-menon"),
    servicesOffered: [
      { title: "Interior Painting", subtext: "Living rooms, bedrooms, ceilings" },
      { title: "Wall Prep & Repair", subtext: "Filling, sanding, priming" },
      { title: "Color Consulting", subtext: "Help choosing the right palette" },
    ],
  },
  {
    id: "vikram-shah",
    name: "Vikram Shah",
    title: "Licensed Electrician",
    trade: "Electrical",
    yearsExperience: 9,
    rating: 4.7,
    reviewCount: 98,
    hourlyRate: 50,
    avatar: avatarUrl("Vikram Shah"),
    verified: true,
    location: "Bangalore, IN",
    availability: "Available Today",
    skills: ["Wiring", "Fixture Install"],
    bio: "Vikram handles everything from a single outlet swap to a full rewiring job, with a strong focus on safety and code compliance.",
    trustBadges: ["Licensed & Insured", "Background Checked", "Emergency Service"],
    portfolio: portfolioUrls("vikram-shah"),
    servicesOffered: [
      { title: "Outlet Installation", subtext: "New outlets and switches" },
      { title: "Light Fixture Install", subtext: "Ceiling fans, fixtures, dimmers" },
      { title: "Panel Upgrades", subtext: "Breaker panel replacement" },
    ],
  },
  {
    id: "meera-das",
    name: "Meera Das",
    title: "House Cleaning Specialist",
    trade: "Cleaning",
    yearsExperience: 5,
    rating: 4.9,
    reviewCount: 176,
    hourlyRate: 28,
    avatar: avatarUrl("Meera Das"),
    verified: true,
    location: "Bangalore, IN",
    availability: "Available This Week",
    skills: ["Deep Cleaning", "Move-out Cleaning"],
    bio: "Meera leads a small, trusted cleaning team known for thorough, reliable service and flexible scheduling.",
    trustBadges: ["Background Checked"],
    portfolio: portfolioUrls("meera-das"),
    servicesOffered: [
      { title: "Standard Cleaning", subtext: "Weekly or bi-weekly upkeep" },
      { title: "Deep Cleaning", subtext: "Top-to-bottom one-time clean" },
      { title: "Move-out Cleaning", subtext: "Full clean for move-in/move-out" },
    ],
  },
];

export function getProfessionalById(id) {
  return professionals.find((p) => p.id === id);
}
