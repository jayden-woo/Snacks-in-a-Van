require('dotenv').config()
const mongoose = require("mongoose")

// database login is retrieved from environment variables
CONNECTION_STRING = "mongodb+srv://<username>:<password>@project-t10-generator.1mtcl.mongodb.net/INFO30005?retryWrites=true&w=majority"
MONGO_URL = CONNECTION_STRING.replace("<username>", process.env.MONGO_USERNAME).replace("<password>", process.env.MONGO_PASSWORD)

// connect to MongoDB
mongoose.connect(MONGO_URL || "mongodb://localhost", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: "INFO30005"
})

const db = mongoose.connection

db.on("error", err => {
 console.error(err);
 process.exit(1)
})

db.once("open", async () => {
 console.log("Mongo connection started on " + db.host + ":" + db.port)
})

require("./customer")
require("./order")
require("./snack")
require("./user")
require("./vendor")
