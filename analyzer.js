var ID3 = require('id3js');
var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var sanitize = require('sanitize-filename');

var files = [];
var extracted = false;
/*
 *ToDo create a watcher that analyze incoming_song directory and move it to the correct directory
 * if .mp3 create directory with albums name if exist else create a new directory inconnu-date
 * if others extension move to garbage
 */
var watcher = chokidar.watch('incoming_song/', {
    persistent: true
});

// Add event listeners.
watcher.on('add', function (pathname) {

    if (path.extname(pathname) == ".mp3") {//Si c'est un mp3 alors on extrait les info
        addFileToExtract(pathname);
        //console.log("File " + pathname + " moved")
    } else { //Si le format ne conviens pas alors on deplace dans garbage
        moveToDirectory('garbage/',pathname);
    }
});

//Delete event listener

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

    console.log("extract");
    console.log(pathname);

    ID3({file: pathname, type: ID3.OPEN_LOCAL}, function (err, tags) {
        if (err) {
            console.log(err);
            return;
        }

        console.log("tags ", tags);
        var album = tags.album;
        //ToDo enregistrement en bdd

        //ToDo creation du repertoire a partir de l'album et deplacement du fichier dans l'album
        //Si on ne connais pas l'album on crée un dossier inconnu-mois-en-cours et on deplace
        var newPath = "";
        requestApiSong(tags);
        if(album != "" && typeof album == "string"){
            console.log("ici");
            console.log(album, pathname);
            console.log(pathname.split("\\"));
            moveToDirectory("media/"+album, pathname);
        }else{
            var monthNow = new Date().getMonth();
            newPath = "media/inconnu-"+monthNow;
            moveToDirectory(newPath, pathname);
        }

        extracted = false;
        setTimeout(function () {
            extract();
        }, 100);
    });
}

function moveToDirectory(directory,pathname) {
    fs.stat(directory, function (error, stats) {
        console.log("moveToDirectory");
        console.log(stats);
        console.log(error);
        var newPath = pathname.split("/")[1];
        console.log("moveToDirectory pathname ",pathname)
        fs.exists(directory + "/.dirCreated", function (doesExist) {
            if (!doesExist) {
                fs.mkdir(directory, function () {
                    fs.writeFile(directory + "/.dirCreated", "Dir Created", function(err) {
                        fs.rename(pathname, directory+"/"+newPath);
                    });
                });
            } else {
                fs.rename(pathname, directory+"/"+newPath);
            }
        })
    });
}
function requestApiSong(tags){
    tags.directory_name = tags.album;
    // Build the post string from an object
    var post_data = querystring.stringify(tags);

    // An object of options to indicate where to post to
    var post_options = {
        host: 'localhost',
        port: '8000',
        path: '/songs',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function deleteSongFile(song) {
    fs.exists("media/" + song.directory_name + "/" + song.title, function (doesExist) {
        if(doesExist) {
            return "deleteSongFile does";
            console.log("deleteSongFile doestexist");
        } else {
            return "deleteSongFile doestexist";
        }
    });
}

module.exports = {
    deleteSongFile: deleteSongFile,
}
