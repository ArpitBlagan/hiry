"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("dotenv/config"); // Load environment variables
const migrator_1 = require("drizzle-orm/neon-http/migrator"); // Import the migrate function
const neon_http_1 = require("drizzle-orm/neon-http"); // Import drizzle for database connection
const serverless_1 = require("@neondatabase/serverless"); // Import the Neon database client
// Ensure the DATABASE_URL is set in your environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in the environment variables.");
}
// Create a Neon database client
const client = (0, serverless_1.neon)(DATABASE_URL);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize the database connection with Drizzle ORM
        const db = (0, neon_http_1.drizzle)(client);
        console.log("Applying migrations...");
        // Run migrations
        yield (0, migrator_1.migrate)(db, { migrationsFolder: "./migration" }); // Adjust the path if needed
        console.log("Migrations applied successfully!");
    }
    catch (error) {
        console.error("Error applying migrations:", error);
    }
});
// Execute the main function
main();
