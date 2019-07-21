const express = require("express");
const logger = require("morgan");
const exphbs = require("express-handlebars");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var routes = require("./routes/articles.js");
app.use(routes);


app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});