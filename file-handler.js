//Modules
var sanitize = require('sanitize-filename');
var chokidar = require('chokidar');
var path = require('path');
var querystring = require('querystring');
var ID3 = require('id3js');

//Custom module
var apiManager = require('./api-manager.js');
var fileManager = require('./file-manager.js');

//Init
var files = [];
var extracted = false;
var now = new Date();

//Global variables
var songDirectory = "media/";
var garbageDirectory = "garbage/";
var incSong = 'incoming_song/';


var watcher = chokidar.watch(incSong, {
    persistent: true
});

watcher.on('add', function (pathname) {
    var extension = path.extname(pathname).toLowerCase();
    if (extension == ".mp3") {
        addFileToExtract(pathname);
    } else {
        fileManager.moveToDirectory(garbageDirectory, pathname);
    }
});


function addFileToExtract(pathname) {
    files.push(pathname);
    extract();
}

function extract() {

    if (extracted || files.length == 0) {
        return;
    }
    extracted = true;

    var pathname = files.pop();

    ID3({file: pathname, type: ID3.OPEN_LOCAL}, function (err, tags) {
        if (err) {
            console.log(err);
            return;
        }

        var album = tags.album;
        var newPath = "";
        var refYear = now.getFullYear() + "" + now.getMonth();

        tags.directory_name = tags.album == "" || typeof tags.album != "string" ? "inconnu-" + refYear : sanitize(tags.album);
        tags.album = tags.directory_name;
        tags.artist = tags.artist == "" || typeof tags.artist != "string" ? "" : sanitize(tags.artist);
        tags.title = tags.title == "" || typeof tags.title != "string" ? "" : sanitize(tags.title);
        tags.year = tags.year == "" || typeof tags.year != "string" ? "" : sanitize(tags.year);
        tags.file_name = path.basename(pathname);
        tags.file_path = tags.directory_name + "/" + path.basename(pathname);

        apiManager.postSong(querystring.stringify(tags));
        if (album != "" && typeof album == "string") {
            fileManager.moveToDirectory(songDirectory + sanitize(album), pathname);
        } else {
            var refYear = now.getFullYear() + "" + now.getMonth();
            newPath = songDirectory + "inconnu-" + refYear;
            fileManager.moveToDirectory(newPath, pathname);
        }

        extracted = false;
        setTimeout(function () {
            extract();
        }, 100);
    });
}
