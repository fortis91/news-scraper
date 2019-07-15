var express = require("express");
var logger = require("morgan");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var routes = require("./routes/articles.js");
app.use(routes);

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});