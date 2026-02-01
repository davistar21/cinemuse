import prisma from "../src/config/database.js";
import { createMedia } from "../src/services/media.service.js";
import {
  getPopularMovies,
  getPosterUrl,
} from "../src/services/tmdb.service.js";
import { MediaType } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding popular movies from TMDB...");

  let count = 0;
  const PAGES = 5; // Fetch top 100 movies (20 per page)

  try {
    for (let page = 1; page <= PAGES; page++) {
      console.log(`\n📄 Fetching page ${page}...`);
      const movies = await getPopularMovies(page);

      for (const movie of movies) {
        if (!movie.title) continue;

        // Check if exists
        const exists = await prisma.mediaItem.findFirst({
          where: {
            title: movie.title,
            type: MediaType.MOVIE,
          },
        });

        if (exists) {
          process.stdout.write(".");
          continue;
        }

        try {
          await createMedia({
            type: MediaType.MOVIE,
            title: movie.title,
            description: movie.overview,
            releaseYear: movie.release_date
              ? parseInt(movie.release_date.split("-")[0])
              : undefined,
            posterUrl: getPosterUrl(movie.poster_path),
            tags: [], // No tags initially, could fetch genres if we wanted
          });
          process.stdout.write("+");
          count++;
        } catch (error) {
          console.error(`\n❌ Failed to create "${movie.title}":`, error);
        }
      }
    }

    console.log(`\n\n✅ Seeding complete! Added ${count} new movies.`);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
