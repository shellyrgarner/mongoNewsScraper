var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

    headline: {
        type: String,
        // required: true
    },

    url: {
        type: String,
        // required: true
    },

    summary: {
        type: String
    }

    
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;