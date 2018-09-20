// require cheerio 
var cheerio = require('cheerio');

// get html
var request = require('request');


// Use Article model
var Article = require('../models/Article');



function scrapedWeb(callback) 
{
  request("https://techcrunch.com/", function(error, response, html)
    
  {
    if (error) console.log("Error Scraping", error);

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    $(".post-block").each(function (i, element) {
        var title = $(this).children(".post-block__header").children("h2").children("a").text();
        var link = $(this).children(".post-block__header").children("h2").children("a").attr("href");
        var summary = $(this).children(".post-block__content").text();
        var author = $(this).find(".river-byline__authors").find("a").text();

      var scrapeArticle = new Article(
      {
        title: title,
        link: link
      });

      // Save Article
      scrapeArticle.save(function(error) 
      {
        //if (error) console.log("Unable to save article", error); //removes duplicate error msg
      });
    });

    callback();
  });
      
}

// export the scraps
exports.scrapedWeb = scrapedWeb;