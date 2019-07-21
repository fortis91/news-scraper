var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
require("dotenv").config();

var db = require("../models");

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
    axios.get("https://www.washingtonpost.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];

        $(".headline").each(function (i, element) {
            var result = {};
            result.title = $(element).children("a").text().trim();
            // url = $(element).children("a").attr("href");
            result.link = $(element).find("a").attr("href");
            summary = $(element).siblings(".blurb").text().trim();
            if (summary) {
                result.summary = $(element).siblings(".blurb").text().trim();
            }
            else {
                result.summary = 'No summary available';
            }
            if (result.title && result.link) {
                results.push(result);
            }
        });
        db.Article.create(results, { unordered: true })
            .then(function (dbArticles) {
                console.log(dbArticles);
            })
            .catch(function (err) {
                console.log(err);
            });
        res.send("Scape Completed");
    });
});

router.get("/comments/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("notes")
        .then(function (dbArticle) {
            res.render("comments", { dbArticle });
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.post("/comments/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { notes: dbNote._id } },
                { new: true, useFindAndModify: false }
            );
        })
        .then(function (dbArticle) {
            res.end();
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.delete("/comments/:articleid/:commentid", function (req, res) {
    db.Note.deleteOne({ _id: req.params.commentid }).then(dbNote => {
        db.Article.findOneAndUpdate(
            { _id: req.params.articleid },
            { $pull: { notes: req.params.commentid } },
            { useFindAndModify: false }
        ).then(dbArticle => {
            res.end();
        });
    });
});






// router.get("/comments/:id", function (req, res) {
//     db.Article.findOne({ _id: req.params.id })
//         .populate("notes")
//         .then(function (dbArticle) {
//             res.render("comments", { dbArticle });
//         })
//         .catch(function (err) {
//             res.json(err);
//         });
// });

// router.post("/comments/:id", function (req, res) {
//     db.Note.create(req.body)
//         .then(function (dbNote) {
//             return db.Article.findOneAndUpdate(
//                 { _id: req.params.id },
//                 { $push: { notes: dbNote._id } },
//                 { new: true, useFindAndModify: false }
//             );
//         })
//         .then(function (dbArticle) {
//             res.end();
//         })
//         .catch(function (err) {
//             res.json(err);
//         });
// });

// router.delete("/comments/:articleid/:commentid", function (req, res) {
//     db.Note.deleteOne({ _id: req.params.commentid }).then(dbNote => {
//         db.Article.findOneAndUpdate(
//             { _id: req.params.articleid },
//             { $pull: { notes: req.params.commentid } },
//             { useFindAndModify: false }
//         ).then(dbArticle => {
//             res.end();
//         });
//     });
// });



// // Route for getting all Articles from the db
// router.get("/articles", function (req, res) {
//     db.Article.find({})
//         .then(function (dbArticle) {
//             res.json(dbArticle)
//         })
//         .catch(function (err) {
//             res.json(err);
//         });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// router.get("/articles/:id", function (req, res) {
//     db.Article.findOne({ _id: req.params.id })
//         .populate("note")
//         .then(function (dbArticle) {
//             console.log(dbArticle);
//             res.json(dbArticle)
//         })
//         .catch(function (err) {
//             res.json(err);
//         });
// });

// // Route for saving/updating an Article's associated Note
// router.post("/articles/:id", function (req, res) {
//     db.Note.create(req.body)
//         .then(function (dbNote) {

//             console.log(req.params.id);
//             console.log(dbNote._id);
//             // return db.Article.findOneAndUpdate({_id : req.params.id }, { $set: {title: "This is a great title" }}, { new: true });
//             return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { note: dbNote._id } }, { new: true });
//         })
//         .then(function (dbArticle) {
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             res.json(err);
//         });
// });

module.exports = router;