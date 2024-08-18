import "dotenv/config";
import "dotenv/config"; // Load environment variables
import { migrate } from "drizzle-orm/neon-http/migrator"; // Import the migrate function
import { drizzle } from "drizzle-orm/neon-http"; // Import drizzle for database connection
import { neon as createClient } from "@neondatabase/serverless"; // Import the Neon database client

// Ensure the DATABASE_URL is set in your environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}

// Create a Neon database client
const client = createClient(DATABASE_URL);

const main = async () => {
  try {
    // Initialize the database connection with Drizzle ORM
    const db = drizzle(client);

    console.log("Applying migrations...");

    // Run migrations
    await migrate(db, { migrationsFolder: "./migration" }); // Adjust the path if needed

    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Error applying migrations:", error);
  }
};

// Execute the main function
main();
