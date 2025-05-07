// Import dependencies
let express = require("express");
let path = require("path");
let router = express.Router();

// Get home page
router.get("/", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../../dist/gym-tracker/browser/index.html")
  );
});

module.exports = router;
