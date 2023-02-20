require("dotenv").config();
const mongoose = require("mongoose");

// Retrieve database login details from environment variables
CONNECTION_STRING =
  "mongodb+srv://<username>:<password>@snack-in-a-van.cyw7xjo.mongodb.net/?retryWrites=true&w=majority";
MONGO_URL = CONNECTION_STRING.replace(
  "<username>",
  process.env.MONGO_USERNAME
).replace("<password>", process.env.MONGO_PASSWORD);

// Connect to MongoDB
mongoose.connect(MONGO_URL || "mongodb://localhost", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "Snack-in-a-Van",
});

const db = mongoose.connection;

db.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

db.once("open", async () => {
  console.log("MongoDB connection started on " + db.host + ":" + db.port);
});

require("./customer");
require("./order");
require("./snack");
require("./vendor");
