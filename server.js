var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", function(req, res){
  res.render("index");
  });

app.get("/scrape", function(req, res) {
  axios.get("https://www.npr.org/sections/world/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".item-info").each(function(i, element) {
      var result = {};
      result.headline = $(this)
        .children(".title")
        .text();
      result.summary = $(this)
        .children("p")
        .text();
      result.link = $(this)
        .children("h2").children("a")
        .attr("href");
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});


app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err)
    })
});

// Supposed to populate comment section with previous comments
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comments")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      console.log('route error is', err);
      res.json(err);
    });
});

// Supposed to populate specific article models with comments associated with article ID
app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(dbComment => {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { comment: dbComment.id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/delete/:id", function(req,res) {
  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { $unset: { comment: 1 } },
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        console.log('success');
        return res.status(200).send(result);
      }
    }
  );
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });