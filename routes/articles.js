var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
require("dotenv").config();

var db = require("../models");

// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsscraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

router.get("/", function (req, res) {
    db.Article.find({}).sort({ _id: -1 })
        .then(dbArticles => {
            res.render("index", { dbArticles });
        })
        .catch(err => {
            res.json(err);
        });
});

// A GET route for scraping the echoJS website
router.get("/scrape", function (req, res) {
    // axios.get("http://www.echojs.com/").then(function (response) {
    //     var $ = cheerio.load(response.data);
    //     $("article h2").each(function (i, element) {
    //         var result = {};
    //         result.title = $(this)
    //             .children("a")
    //             .text();
    //         result.link = $(this)
    //             .children("a")
    //             .attr("href");
    //         db.Article.create(result)
    //             .then(function (dbArticle) {
    //                 console.log(dbArticle);
    //             })
    //             .catch(function (err) {
    //                 console.log(err);
    //             });
    //     });

    //     res.send("Scrape Complete");
    // });
    // axios.get("https://lifehacker.com").then(function (response) {
    //     // console.log(response.data);
    //     let $ = cheerio.load(response.data);
    //     $("article h2").each(function (i, element) {

    //         let title = $(this).text();
    //         console.log(title);
    //     });

    //     res.send("Scape Completed");
    // })
    axios.get("https://www.washingtonpost.com/").then(function (response) {

        var $ = cheerio.load(response.data);
        var results = [];

        $(".headline").each(function (i, element) {
                        var result = {};

            // console.log(element);
            // var title = $(element).children().text();
            // var link = $(element).find("a").attr("href");

            // if (title && link) {

            //     results.push({
            //         title: title,
            //         link: link
            //     });
            // }
            
            result.title = $(element).children("a").text().trim();
            // url = $(element).children("a").attr("href");
            result.link = $(element).find("a").attr("href");

            result.summary = $(element).siblings(".blurb").text().trim();
            if (result.title && result.link) {
                db.Article.create(result, { unordered: true })
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        });

        // Log the results once you've looped through each of the elements found with cheerio
        // console.log(results);
        // db.scrapedData.insert(results);
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