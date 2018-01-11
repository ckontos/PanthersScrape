var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//scraping tools
var request = require("request");
var cheerio = require("cheerio");

// = Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

//initialize express
var app = express();

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_llkvhzb7:e699clnd1tqnujml6hvr0c4lav@ds245337.mlab.com:45337/heroku_llkvhzb7";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});

///////////// ********* ROUTES ********** /////////////////

//route for scrape ====================================================================================
app.get("/scrape", function(req, res) {
    request("http://www.panthers.com/news/team-news.html", function(error, response, html) {
        var $ = cheerio.load(html);
        $("h3").each(function(i, element) {
            var result = {};
            if (i < 10) {
                result.title = $(this).children("a").attr("title");
                result.link = "http://www.panthers.com" + $(this).children("a").attr("href");

                db.Article
                    .create(result)
                    .then(function(dbArticle) {
                        // If we were able to successfully scrape and save an Article, send a message to the client
                        console.log(dbArticle);
                    })
                    .catch(function(err) {
                        // If an error occurred, send it to the client
                        res.json(err);
                    });
            }
        });
    });
    //res.send("Scrape Complete");
    res.redirect("/");
});

// Route for getting all Articles from the db ================================================================================
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article
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

//delete articles route ======================================================================================================
app.delete("/articles/delete", function(req, res) {
    // Remove all the articles
    db.Article.remove({}).then(function(err) {
        res.json(err);
    });
});

//route for grabbing article by id ==========================================================================================
app.get("/articles/:id", function(req, res) {

    db.Article
        .findOne({ _id: req.params.id })
        // populate notes
        .populate("note")
        .then(function(dbArticle) {

            res.json(dbArticle);
        })
        .catch(function(err) {

            res.json(err);
        });
});

// Route for saving/updating an Article's Note ================================================================================
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note
        .create(req.body)
        .then(function(dbNote) {
            // get the article and add any notes that don't already exist
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $addToSet: { note: dbNote._id } }, { new: true });
        })
        .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {

            res.json(err);
        });
});

// Delete a note =============================================================================================================
app.delete("/notes/deleteNote/:note_id/:article_id", function(req, res) {
    // Use the note id to find and delete it
    db.Note.findOneAndRemove({ _id: req.params.note_id }, function(err) {
        // error check
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            db.Article.findOneAndUpdate({ _id: req.params.article_id }, { $pull: { note: req.params.note_id } })
                .exec(function(err, data) {
                    // error check
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send(data);
                    }
                });
        }
    });
});

// Route for saving an article ================================================================================================
app.post("/saved/:id", function(req, res) { // grab it by the id and save it
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } })
        .then(function(dbArticle) {
            res.json(dbArticle);
        });
});

// Route for getting all saved articles =======================================================================================
app.get("/saved", function(req, res) {
    // Grab every document in the saved collection and populate with notes
    db.Article.find({ saved: true }).populate("note")
        .then(function(dbArticle) {

            res.json(dbArticle);
        })
        .catch(function(err) {
            // alert any errors
            res.json(err);
        });
});

// Route for deleting a saved article  ========================================================================================
app.post("/deleteSaved/:id", function(req, res) {

    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: false } })
        // return the notes left
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            // alert and errors
            res.json(err);
        });
});



// Start the server  
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
