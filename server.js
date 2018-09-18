var express = require("express");
var expressHandlebars = require("express-handlebars");

var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
//scraping tools

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

//middleware
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/mongoNews", { useNewUrlParser: true });

// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);

app.get("/scrape", function (req, res) {

    var currentData = [];
    db.Article.find({}).then(function(found) {
        currentData = found;
    }).catch(function(err) {
        console.log(err);
    });

    axios.get("https://techcrunch.com/").then(function (response) {

        var test = false;
        var $ = cheerio.load(response.data);

        $(".post-block").each(function(i, element) {

            // var result = {};

            var headline = $(this).children(".post-block__header").children("h2").children("a").text();
            var url = $(this).children(".post-block__header").children("h2").children("a").attr("href");
            var summary = $(this).children(".post-block__content").text();

            for (i=0; i<currentData.length; i++) {
                if (headline === currentData[i].headline) {
                    test = true;
                    break;
                };
            };

            if (headline && url && summary && !test) {

                  
            db.Article.create({
                headline: headline,
                url: url,
                summary: summary
            }).then(function(dbArticle) {

                console.log(dbArticle);
            })
            .catch(function(err) {
                
                return res.json(err);
                console.log("error:" + err);
            });
        };
            
        });

        res.send("ScrapeComplete");
    });
    //console.log(result);
});

app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("comment").then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Route for saving/updating an Article's associated comment
app.post("/articles/:id", function(req, res) {

    db.Comment.create(req.body)
    .then(function(dbComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id}, { new: true });
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
})