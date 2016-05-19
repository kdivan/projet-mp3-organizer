//TODO: Refactoring du code en séparant dans des fichiers
var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();

/*
Test comment
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(__dirname));

var sequelize = new Sequelize('esgi', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

sequelize
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.');
    }, function (err) {
        console.log('Unable to connect to the database:', err);
    });

var Song = sequelize.define('song', {
    artist: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    year: Sequelize.INTEGER(2),
    album: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    directory_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

sequelize
    .sync({ force: false })
    .then(function(err) {
        console.log('It worked!');
    }, function (err) {
        console.log('An error occurred while creating the table:', err);
    });


//parametres en post, put, patch : body
//parametres en get : query
app.get("/songs", function (req, res) {
    var count = req.query.count;
    if (!count) {
        count = 15;
    }
    Song.findAll({ limit : count})
        .then(function(songs) {
            res.json(songs);
        })
        .catch(
            function(err) {
                res.json({error : err});
            }
        );
})

app.get("/songs/:id", function (req, res) {
    Song.findById(req.params.id)
        .then(
            function(songs) {
                res.json(songs);
            })
        .catch(
            function(err) {
                res.json({error : err});
            }
        );
});

app.post("/songs", function (req, res) {
    Song.create({
        artist: req.body.artist,
        title: req.body.title,
        year: req.body.year,
        album: req.body.album,
        directory_name: req.body.directory_name,
    })
        .then(
            function (song) {
                res.json(song);
            })
        .catch(
            function(err) {
                res.json({error : err});
            }
        );
});

app.delete("/songs/:id", function (req, res) {
    Song.findById(req.params.id)
        .then(
            function (song) {
                if (song) {
                    song.destroy();
                } else {
                    res.json({message: "Song does not exist"});
                }
            })
            .then(function(){
                res.json({message: "Sucessfully deleted"});
            })
            .catch(
                function(err) {
                    res.json({error : err});
                }
            )
        .catch(
            function(err) {
                res.json({error : err});
            }
        );
});

app.put("/songs/:id", function(req, res) {
    Song.findById(req.params.id)
        .then(
            function (song) {
                if (song) {
                    song.artist = (typeof req.body.artist !== 'undefined') ? req.body.artist : song.artist;
                    song.album = (typeof req.body.album !== 'undefined') ? req.body.album : song.album;
                    song.title = (typeof req.body.title !== 'undefined') ? req.body.title : song.title;
                    song.year = (typeof req.body.year !== 'undefined') ? req.body.year : song.year;
                    song.directory_name = (typeof req.body.directory_name !== 'undefined') ? req.body.directory_name : song.directory_name;
                    song.save()
                        .then(
                            function () {
                                res.json({message : "Song updated"});
                            })
                        .catch(
                            function(err) {
                                res.json({error : err});
                            });
                } else {
                    res.json({message: "Song does not exist"});
                }
            }
        )
        .catch(
            function(err) {
                res.json({error : err});
            }
        );
});
app.listen(8000);