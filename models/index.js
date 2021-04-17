require('dotenv').config()
const mongoose = require("mongoose")

// Connect to MongoDB - database login is retrieved from environment variables - YOU SHOULD USE YOUR OWN ATLAS CLUSTER
CONNECTION_STRING = "mongodb+srv://XinyueZhang:1AvWUUKom8y2YpGB@project-t10-generator.1mtcl.mongodb.net/project-t10-generator?retryWrites=true&w=majority" //????
MONGO_URL = CONNECTION_STRING.replace("<username>",process.env.MONGO_USERNAME).replace("<password>",process.env.MONGO_PASSWORD)

mongoose.connect(MONGO_URL || "mongodb://localhost", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: "mylibraryapp"
})

const db = mongoose.connection

db.on("error", err => {
 console.error(err);
 process.exit(1)
})

db.once("open", async () => {
 console.log("Mongo connection started on " + db.host + ":" + db.port)
})

require("./author")