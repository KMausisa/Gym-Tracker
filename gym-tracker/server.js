// Import dependencies
let express = require("express");
let path = require("path");
let http = require("http");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let mongoose = require("mongoose");

// import routing file that handles default route
let index = require("./server/routes/app");

// import routing files
const homeRoutes = require("./server/routes/home");
const workoutRoutes = require("./server/routes/workout");
const progressRoutes = require("./server/routes/progress");
const accountRoutes = require("./server/routes/account");

// establish connection to the mongoDB database
mongoose
  .connect("mongodb://localhost:27017/gym-tracker")
  .then(() => {
    console.log("Connected to MongoDB database successfully.");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB database:", err);
  });

// Create Express application
let app = express();

// Tell express to use the following parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Use the Morgan logger for logging requests to the console
app.use(logger("dev"));

// Add COR support for all origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Tell express to use the specified director as the root
app.use(express.static(path.join(__dirname, "dist/gym-tracker/browser")));

// Tell express to map the default route to the index route
app.use("/", index);

// map url's to the routing files
app.use("/home", homeRoutes);
app.use("/workout", workoutRoutes);
app.use("/progress", progressRoutes);
app.use("/account", accountRoutes);

// Tell express to map all other non-defined routes to the index route
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist/gym-tracker/browser/index.html"));
});

// Define the port to run the server on
const PORT = process.env.PORT || 3000;
app.set("port", PORT);

// Create the server and listen on the specified port
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
server.on("error", (error) => {
  console.error("Error starting server:", error);
});
