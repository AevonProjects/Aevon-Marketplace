import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "ATeam",
    slug: "ateam",
    shortDescription: "Complete team management and progression system.",
    description: "Complete team management, progression, quests, allies, homes, warps, logos, and competitive systems.",
    priceCents: 49900,
    currentVersion: "1.3.x",
    supportedVersions: "Paper/Purpur 1.21.x",
    status: ProductStatus.PUBLISHED
  },
  {
    name: "ALicense",
    slug: "alicense",
    shortDescription: "Secure Minecraft item licensing and recall.",
    description: "Item licensing, recall, duplicate protection, container protection, and ownership management.",
    priceCents: 34900,
    currentVersion: "1.1.x",
    supportedVersions: "Paper/Purpur 1.21.x",
    status: ProductStatus.PUBLISHED
  },
  {
    name: "AStats",
    slug: "astats",
    shortDescription: "Modern player statistics and progression presentation.",
    description: "Player statistics and progression presentation built for modern Paper and Purpur servers.",
    priceCents: 29900,
    currentVersion: "1.0.x",
    supportedVersions: "Paper/Purpur 1.21.x",
    status: ProductStatus.PUBLISHED
  },
  {
    name: "AEnchantremover",
    slug: "aenchantremover",
    shortDescription: "GUI enchantment management.",
    description: "GUI-based enchantment adding and removal with Vanilla and AdvancedEnchantments support.",
    priceCents: 29900,
    currentVersion: "1.1.x",
    supportedVersions: "Paper/Purpur 1.21.x",
    status: ProductStatus.PUBLISHED
  },
  {
    name: "ADiscordALL",
    slug: "adiscordall",
    shortDescription: "All-in-one Minecraft and Discord integration.",
    description: "Discord integration for account linking, chat, console, command logging, rewards, and announcements.",
    priceCents: 44900,
    currentVersion: "1.0.x",
    supportedVersions: "Paper/Purpur 1.21.x",
    status: ProductStatus.PUBLISHED
  }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }
  console.log(`Seeded ${products.length} Aevon products.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
