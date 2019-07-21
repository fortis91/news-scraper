var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    index: true,
    required: true
  },
  link: {
    type: String,
    required: true,
    index: true,
    // createIndex: true
    // dropDups: true
  },
  summary: {
    type: String,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
