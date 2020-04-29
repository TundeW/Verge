const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database");
const verge = require("./route");

let app = express();
let port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.listen(port, () =>{
    console.log("Application Listening on Port " + port)
});

app.use("/api/v1", verge);

module.exports = app
