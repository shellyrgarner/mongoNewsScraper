var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var request = require("request");
//scraping tools
// var axios = require("axios");
var cheerio = require("cheerio");
var mongojs = require("mongojs");

var db = require("../models");



mongoose.connect("mongodb://localhost/mongoNews", { useNewUrlParser: true });

// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);


// var hbsObject = {};

// home page 
router.get('/', function (request, response) {

    // get all the saved articles
    db.Article.find({saved: true})
        .then(function (dbArticle) {
            // hbsObject = { articles: found };
            // response.render("saved", hbsObject);
            // console.log(hbsObject);
            response.render("saved",  {title: "NewsScraper", articles: dbArticle});
        })
        .catch(function (err) {
            response.json(err);
        });
});



// scrape route
router.get('/scrape', function (req, res) {

    request("https://techcrunch.com/", function (error, response, html) {
        // if (error) console.log("Error Scraping", error);

        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        //Target articles by tag
        $(".post-block").each(function (i, element) {
            var title = $(this).children(".post-block__header").children("h2").children("a").text();
            var link = $(this).children(".post-block__header").children("h2").children("a").attr("href");
            var summary = $(this).children(".post-block__content").text();
            var author = $(this).find(".river-byline__authors").find("a").text();

            if (title && link && summary) {

                db.Article.create({
                    title: title,
                    link: link,
                    summary: summary
                }).then(function(dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                  })
                  .catch(function(err) {
                    // If an error occurred, send it to the client
                    return response.json(err);
                });
            };
            
        });
      

        db.Article.find({}).sort({ scrapedOn: -1 }).limit(30).then(function (found) {
            // hbsObject = { articles: found };
            // console.log(hbsObject);
            // res.render("scraped", hbsObject);
            res.render("scraped",  {title: "NewsScraper",articles: found});
        }).catch(function (err) {
            console.log(err);
        });
    });

});

// Get all the saved articles
router.get("/saved", function (req, res) {
    db.Article.find({saved: true})
    .then(function (dbArticle) {
        // hbsObject = { articles: found };
        // res.render("saved", hbsObject);
        // console.log(hbsObject);
        res.render("saved",  {title: "NewsScraper", articles: dbArticle});
    })
    .catch(function (err) {
        res.json(err);
    });
});

//Find note associated with associated with saved article id when add note button is hit
router.get("/saved/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (found) {
            console.log(found);
            res.json(found);
        }).catch(function (err) {
            res.json(err);
        });
});


//Change article status to saved.
router.post("/articles/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: req.body.saved }, { new: true }).then(function (dbArticle) {
        console.log(dbArticle);
        res.sendStatus(200);
    }).catch(function (err) {
        console.log(err)
    });
});

//Add a new note to an article or modify an exisiting one
router.post("/saved/:id_Article/:id_Note", function (req, res) {
    if (req.params.id_Note==0) {
        db.Note.create(req.body).then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id_Article }, { note: dbNote._id }, { new: true });
        })
            .then(function (dbArticle) {
                console.log(dbArticle);
                res.sendStatus(200);
            })
            .catch(function (err) {
                res.json(err);
            });
    } else {
        db.Note.findOneAndUpdate({_id: req.params.id_Note}, {body: req.body.body}).then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id_Article }, { note: dbNote._id }, { new: true });
        })
            .then(function (dbArticle) {
                console.log(dbArticle);
                res.sendStatus(200);
            })
            .catch(function (err) {
                res.json(err);
            });
    }
});

router.delete("/saved/:id_Article/:id_Note", function(req, res){
    db.Note.findOneAndRemove({_id: req.params.id_Note}).then(function (dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id_Article }, { $unset: {note: 1 }}, { new: true });
    })
        .then(function (dbArticle) {
            console.log(dbArticle);
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.json(err);
        });
})

module.exports = router;