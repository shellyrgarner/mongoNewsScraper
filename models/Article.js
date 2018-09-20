var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

    title: {
        type: String,
        // required: true
        dropDups: true
    },

    link: {
        type: String,
        // required: true
    },

    summary: {
        type: String
    },
    scrapedOn: {
        type: Date,
        default: Date.now
    },
    saved: {
        type: Boolean,
        default: false
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }

    
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;