/**
 * Database Seed Script
 *
 * This script populates the database with sample movies, books, shows, and games
 * so you can test the semantic search functionality.
 *
 * Run with: npm run db:seed
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables BEFORE importing Prisma
dotenv.config({ path: path.join(__dirname, "../.env") });

import { PrismaClient, MediaType, TagCategory } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// SAMPLE DATA
// ============================================

const sampleTags = [
  // Moods
  { name: "dark", category: "MOOD" as TagCategory },
  { name: "uplifting", category: "MOOD" as TagCategory },
  { name: "nostalgic", category: "MOOD" as TagCategory },
  { name: "tense", category: "MOOD" as TagCategory },
  { name: "heartwarming", category: "MOOD" as TagCategory },
  { name: "melancholic", category: "MOOD" as TagCategory },
  { name: "whimsical", category: "MOOD" as TagCategory },

  // Themes
  { name: "redemption", category: "THEME" as TagCategory },
  { name: "love", category: "THEME" as TagCategory },
  { name: "revenge", category: "THEME" as TagCategory },
  { name: "coming-of-age", category: "THEME" as TagCategory },
  { name: "survival", category: "THEME" as TagCategory },
  { name: "identity", category: "THEME" as TagCategory },

  // Genres
  { name: "sci-fi", category: "GENRE" as TagCategory },
  { name: "thriller", category: "GENRE" as TagCategory },
  { name: "comedy", category: "GENRE" as TagCategory },
  { name: "drama", category: "GENRE" as TagCategory },
  { name: "horror", category: "GENRE" as TagCategory },
  { name: "romance", category: "GENRE" as TagCategory },
  { name: "action", category: "GENRE" as TagCategory },
  { name: "fantasy", category: "GENRE" as TagCategory },

  // Tropes
  { name: "time-loop", category: "TROPE" as TagCategory },
  { name: "chosen-one", category: "TROPE" as TagCategory },
  { name: "heist", category: "TROPE" as TagCategory },
  { name: "unreliable-narrator", category: "TROPE" as TagCategory },
  { name: "twist-ending", category: "TROPE" as TagCategory },
  { name: "found-family", category: "TROPE" as TagCategory },
];

const sampleMedia = [
  // MOVIES
  {
    type: "MOVIE" as MediaType,
    title: "Groundhog Day",
    description:
      "A cynical TV weatherman finds himself reliving the same day over and over again when he goes on location to the small town of Punxsutawney to cover the annual Groundhog Day event. As he re-experiences the day thousands of times, he gradually becomes a better person.",
    releaseYear: 1993,
    language: "English",
    tags: ["comedy", "time-loop", "redemption", "romance", "uplifting"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "Inception",
    description:
      "A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO. The team must navigate multiple layers of dreams within dreams while confronting their own inner demons.",
    releaseYear: 2010,
    language: "English",
    tags: ["sci-fi", "thriller", "heist", "tense", "twist-ending"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. Andy Dufresne, a banker wrongly convicted of murder, befriends Red, a fellow inmate, while quietly planning his escape over decades.",
    releaseYear: 1994,
    language: "English",
    tags: ["drama", "redemption", "uplifting", "survival"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "Eternal Sunshine of the Spotless Mind",
    description:
      "When a couple undergoes a medical procedure to erase each other from their memories after a painful breakup, they discover the importance of their relationship while it is being erased. A meditation on love, memory, and what makes us who we are.",
    releaseYear: 2004,
    language: "English",
    tags: ["romance", "sci-fi", "melancholic", "love", "identity"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "Parasite",
    description:
      "The Kim family schemes to become employed by the wealthy Park family by posing as unrelated, highly qualified individuals. What starts as a dark comedy about class inequality becomes a thriller as the two families collide.",
    releaseYear: 2019,
    language: "Korean",
    tags: ["thriller", "dark", "twist-ending", "drama"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "The Matrix",
    description:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers. Neo must choose between the blue pill of comfortable ignorance or the red pill of harsh truth.",
    releaseYear: 1999,
    language: "English",
    tags: ["sci-fi", "action", "chosen-one", "identity"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "Amélie",
    description:
      "A shy waitress in Paris decides to change the lives of those around her for the better while struggling with her own isolation. A whimsical tale of a young woman finding love and connection in unexpected places.",
    releaseYear: 2001,
    language: "French",
    tags: ["romance", "comedy", "whimsical", "uplifting", "love"],
  },
  {
    type: "MOVIE" as MediaType,
    title: "Fight Club",
    description:
      "An insomniac office worker and a soap maker form an underground fight club that evolves into something much more dangerous. A critique of consumerism and modern masculinity with a shocking twist.",
    releaseYear: 1999,
    language: "English",
    tags: [
      "thriller",
      "dark",
      "twist-ending",
      "unreliable-narrator",
      "identity",
    ],
  },

  // TV SHOWS
  {
    type: "SHOW" as MediaType,
    title: "Breaking Bad",
    description:
      "A high school chemistry teacher diagnosed with terminal lung cancer turns to manufacturing methamphetamine to secure his family's future. His descent from mild-mannered teacher to ruthless drug lord is both terrifying and compelling.",
    releaseYear: 2008,
    language: "English",
    tags: ["drama", "thriller", "dark", "redemption"],
  },
  {
    type: "SHOW" as MediaType,
    title: "Stranger Things",
    description:
      "When a young boy vanishes from a small town, his friends discover supernatural forces, secret experiments, and a strange girl with psychic powers. A nostalgic love letter to 80s adventure films.",
    releaseYear: 2016,
    language: "English",
    tags: ["sci-fi", "horror", "nostalgic", "coming-of-age", "found-family"],
  },
  {
    type: "SHOW" as MediaType,
    title: "The Office",
    description:
      "A mockumentary on a group of typical office workers at a paper company in Scranton, Pennsylvania, where the regional manager Michael Scott thinks he is the funniest, coolest boss ever.",
    releaseYear: 2005,
    language: "English",
    tags: ["comedy", "heartwarming", "romance"],
  },
  {
    type: "SHOW" as MediaType,
    title: "Dark",
    description:
      "A family saga with a supernatural twist set in a German town where the disappearance of children exposes the double lives and fractured relationships among four families. Everything is connected through time.",
    releaseYear: 2017,
    language: "German",
    tags: ["sci-fi", "thriller", "time-loop", "dark", "twist-ending"],
  },

  // BOOKS
  {
    type: "BOOK" as MediaType,
    title: "1984",
    description:
      "In a totalitarian future society, Winston Smith rebels against the Party and its leader Big Brother by falling in love, an act of ultimate defiance. A haunting vision of surveillance, propaganda, and the destruction of truth.",
    releaseYear: 1949,
    language: "English",
    tags: ["sci-fi", "dark", "thriller", "love"],
  },
  {
    type: "BOOK" as MediaType,
    title: "The Alchemist",
    description:
      "A young shepherd named Santiago travels from Spain to the Egyptian desert in search of treasure and discovers the true meaning of life and his Personal Legend along the way.",
    releaseYear: 1988,
    language: "Portuguese",
    tags: ["fantasy", "uplifting", "coming-of-age", "redemption"],
  },
  {
    type: "BOOK" as MediaType,
    title: "Gone Girl",
    description:
      "On the morning of his fifth wedding anniversary, Nick Dunne reports that his wife Amy has gone missing. Under mounting pressure from the police and media, secrets emerge that call into question everything we think we know.",
    releaseYear: 2012,
    language: "English",
    tags: ["thriller", "twist-ending", "unreliable-narrator", "dark"],
  },
  {
    type: "BOOK" as MediaType,
    title: "The Name of the Wind",
    description:
      "Kvothe, a legendary figure now living in obscurity, recounts his transformation from a traveling performer's son to the most notorious wizard his world has ever seen. A story of music, magic, and the power of stories.",
    releaseYear: 2007,
    language: "English",
    tags: ["fantasy", "coming-of-age", "nostalgic"],
  },

  // GAMES
  {
    type: "GAME" as MediaType,
    title: "The Last of Us",
    description:
      "In a post-apocalyptic world overrun by infected humans, a hardened survivor is hired to smuggle a 14-year-old girl across the country. What starts as a job becomes a journey of emotional survival and connection.",
    releaseYear: 2013,
    language: "English",
    tags: ["action", "drama", "survival", "found-family", "dark"],
  },
  {
    type: "GAME" as MediaType,
    title: "Red Dead Redemption 2",
    description:
      "Arthur Morgan, an outlaw in the dying days of the Wild West, must choose between his loyalty to the gang that raised him and his own moral code. A sweeping tale of loyalty, betrayal, and redemption.",
    releaseYear: 2018,
    language: "English",
    tags: ["action", "drama", "redemption", "melancholic"],
  },
  {
    type: "GAME" as MediaType,
    title: "Undertale",
    description:
      "A child falls into an underground world filled with monsters. You can fight or befriend everyone you meet, and your choices have profound consequences. A clever deconstruction of RPG tropes.",
    releaseYear: 2015,
    language: "English",
    tags: ["fantasy", "comedy", "heartwarming", "twist-ending"],
  },
  {
    type: "GAME" as MediaType,
    title: "Outer Wilds",
    description:
      "You are stuck in a time loop, exploring a solar system that is about to die. Each loop gives you 22 minutes to uncover the mysteries of an ancient alien civilization before the sun explodes.",
    releaseYear: 2019,
    language: "English",
    tags: ["sci-fi", "time-loop", "melancholic", "uplifting"],
  },
];

// ============================================
// SEED FUNCTION
// ============================================

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.listItem.deleteMany();
  await prisma.list.deleteMany();
  await prisma.review.deleteMany();
  await prisma.mediaTag.deleteMany();
  await prisma.mediaEmbedding.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.tag.deleteMany();
  // Keep users if they exist

  // Create tags
  console.log("🏷️  Creating tags...");
  for (const tag of sampleTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }
  console.log(`   Created ${sampleTags.length} tags`);

  // Create media items with tags
  console.log("🎬 Creating media items...");
  for (const media of sampleMedia) {
    const { tags: tagNames, ...mediaData } = media;

    const mediaItem = await prisma.mediaItem.create({
      data: {
        ...mediaData,
        tags: {
          create: tagNames.map((tagName) => ({
            tag: {
              connect: { name: tagName },
            },
          })),
        },
      },
    });

    console.log(`   ✓ ${mediaItem.type}: ${mediaItem.title}`);
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   - ${sampleTags.length} tags`);
  console.log(`   - ${sampleMedia.length} media items`);
  console.log(
    "\n📝 Note: Embeddings will be generated when you run the embedding sync script.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
