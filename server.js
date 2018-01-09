var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//scraping tools
var request = require("request");
var cheerio = require("cheerio");

// = Require Schemas 
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

var PORT = process.env.PORT || 8080;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_llkvhzb7:e699clnd1tqnujml6hvr0c4lav@ds245337.mlab.com:45337/heroku_llkvhzb7";

//initialize express
var app = express();

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});
var db = mongoose.connection

app.get("/scrape", function(req, res) {
    request("http://www.panthers.com/news/team-news.html", function(error, response, html) {
        var $ = cheerio.load(html);
        $("h3").each(function(i, element) {
            var result = {};
            result.title = $(this).children("a").attr("title");
            result.link = "http://www.panthers.com" + $(this).children("a").attr("href");

            Article
                .create(result)
                .then(function(dbArticle) {
                    // If we were able to successfully scrape and save an Article, send a message to the client
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });
    });
    //res.send("Scrape Complete");
    res.redirect("/");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    Article
        .find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article
        .findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {

    var newNote = new Note(req.body);

    // save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

app.delete("/delete/:id", function(req, res) {
    var id = req.params.id.toString();
    Note.remove({
        "_id": id
    }).exec(function(error, doc) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("note deleted");
            res.redirect("/");
        }
    });
});
// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
