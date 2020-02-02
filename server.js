var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
var path = require("path");
var axios = require("axios");

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var databaseUrl = "news";
var collections = ["articles", "comments"];

var db = mongojs(databaseUrl, collections);

db.on("error", function (error) {
    console.log("Database Error:", error);
});

app.get("/all", function (req, res) {
    db.scrappedData.find({}, function (error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });

    db.comments.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });

});

app.get("/", function (req, res) {
    axios.get("https://www.nytimes.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        $("").each(function (i, element) {
            var title = $(element).children().text();
            var link = $(element).children().attr("href");

            if (title && link) {
                db.scrappedData.insert({
                    title: title,
                    link: link
                },
                    function (err, inserted) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(inserted);
                        }
                    });
            }
        });
    });

    res.sendFile(path.join(__dirname + "/public/html/index.html"));
});

app.post("/submit", function (rew, res) {
    console.log(req.body);

    db.comments.insert(req.body, function (error, saved) {
        if (error) {
            console.log(error);
        }
        else {
            res.send(saved);
        }
    });
});

// app.get("/all", function (req, res) {
//     db.comments.find({}, function(error, found) {
//         if (error) {
//             console.log(error);
//         }
//         else {
//             res.json(found);
//         }
//     });
// });

app.get("/find/:id", function(req, res) {
    db.comments.findOne(
        {
            _id: mongojs.ObjectId(req.params.id)
        },
        function(error, found) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(found);
                res.send(found);
            }
        }
    );
});

app.post("/update/:id", function (req, res) {
    db.comments.update(
        {
            _id: mongojs.ObjectId(req.params.id)
        },
        function(error, edited) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(edited);
                res.send(edited);
            }
        }
    );
});

app.get("/delete/:id", function(req, res) {
    db.comments.remove(
        {
            _id: mongojs.ObjectId(req.params.id)
        },
        function(error, removed) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(removed);
                res.send(removed);
            }
        }
    );
});

app.get("/clearall", function(req, res) {
    db.comments.remove({}, function(error, response) {
        if (error) {
            console.log(error);
            res.send(error);
        }
        else {
            console.log(response);
            res.send(response);
        }
    });
});

app.listen(3000, function() {
    console.log("App running on localhost:3000")
});