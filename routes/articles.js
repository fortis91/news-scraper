var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("../models");

mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// A GET route for scraping the echoJS website
router.get("/scrape", function (req, res) {
    axios.get("http://www.echojs.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        $("article h2").each(function (i, element) {
            var result = {};
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            console.log(dbArticle);
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {

            console.log(req.params.id);
            console.log(dbNote._id);
            // return db.Article.findOneAndUpdate({_id : req.params.id }, { $set: {title: "This is a great title" }}, { new: true });
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { note: dbNote._id } }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

module.exports = router;