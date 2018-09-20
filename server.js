var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");

var routes = require("./controllers/newsController.js")

var PORT = process.env.PORT || 3000;

var app = express();

//middleware
app.use(logger("dev"));
//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));


app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs'}));
app.set('view engine', 'hbs');

app.use("/", routes);


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
})