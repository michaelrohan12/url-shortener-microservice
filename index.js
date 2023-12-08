require("dotenv").config();
const dns = require("node:dns");
let mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { URL } = require("url");
let bodyParser = require("body-parser");
const app = express();

// Basic Configuration
try {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (err) {
  console.log(err);
}

const port = process.env.PORT || 3000;
app.use(cors());

// Model
const urlShortenerSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: Number,
});

const UrlShortener = mongoose.model("UrlShortener", urlShortenerSchema);

//Mounted body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({ extended: false }));

// Mounted middleware on USE method to serve static files
app.use("/public", express.static(__dirname + "/public"));

//GET API to serve an html file
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// First API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Verify url and provided shortened url index and store it in db
app.route("/api/shorturl").post(async (req, res) => {
  const originalUrlVal = req.body.url;
  const url = new URL(originalUrlVal);

  dns.lookup(url.hostname, (err, address, family) => {
    if (err != null) {
      res.json({ error: "invalid url" });
      return;
    }
  });

  try {
    const maxShortUrl = await UrlShortener.findOne({})
      .sort({ shortUrl: -1 })
      .select({ shortUrl: 1 })
      .lean();

    const newShortUrl = maxShortUrl ? maxShortUrl.shortUrl + 1 : 1;

    const newUrl = await UrlShortener.findOneAndUpdate(
      { originalUrl: originalUrlVal },
      { originalUrl: originalUrlVal, shortUrl: newShortUrl },
      { new: true, upsert: true }
    );

    res.json({ original_url: originalUrlVal, short_url: newUrl.shortUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirect to target url using short url index
app.route("/api/shorturl/:target").get(async (req, res) => {
  const targetIndex = parseInt(req.params.target);

  if (isNaN(targetIndex)) {
    res.status(400).json({ error: "Invalid target index" });
    return;
  }

  try {
    const data = await UrlShortener.findOne({ shortUrl: targetIndex }).exec();
    if (!data) {
      res.status(404).json({ error: "URL NOT FOUND" });
      return;
    }
    res.redirect(data.originalUrl);
    return;
  } catch (err) {
    console.error("Error fetching data from the database:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
