const { server } = require("./app");
const sequelize = require("./config/dbconfig");

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown Handling
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed gracefully.");
    process.exit(0);
  });
});

// process.on("SIGTERM", () => {
//   console.log("Shutting down server...");
//   server.close(() => {
//     console.log("Server closed gracefully.");
//     process.exit(0);
//   });
// });
