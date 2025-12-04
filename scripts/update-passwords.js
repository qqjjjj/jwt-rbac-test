const argon2 = require("argon2");
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "jwt_rbac_db",
  user: "postgres",
  password: "postgres",
});

async function updatePasswords() {
  try {
    console.log("Generating password hashes with Argon2...");

    const adminHash = await argon2.hash("password123");
    const userHash = await argon2.hash("password123");

    console.log("Updating admin password...");
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      adminHash,
      "admin@test.com",
    ]);

    console.log("Updating user password...");
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      userHash,
      "user@test.com",
    ]);

    console.log("✅ Passwords updated successfully!");
    console.log("\nTest credentials:");
    console.log("Admin: admin@test.com / password123");
    console.log("User:  user@test.com / password123");

    await pool.end();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updatePasswords();
