const { Sequelize } = require("sequelize");
const neon = require("@neondatabase/serverless");
const ws = require("ws");
require("dotenv").config({ override: true });

const databaseUrl = process.env.DATABASE_URL;
const useNeonWebSocket = databaseUrl?.includes(".neon.tech");

if (useNeonWebSocket) {
  neon.neonConfig.webSocketConstructor = ws;
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  ...(useNeonWebSocket ? { dialectModule: neon } : {}),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 15000,
    idle: 10000,
  },
  logging: false,
});

sequelize
  .authenticate()
  .then(async () => {
    console.log("Database connected successfully!");
    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: { drop: false } });
      console.warn("DB_SYNC is enabled; models were synchronized automatically.");
    }
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

module.exports = sequelize;
