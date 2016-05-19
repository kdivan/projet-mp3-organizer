var ID3 = require('id3js');
var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');

var folderCreated = false;
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

function addFileToExtract(pathname) {
    files.push(pathname);
    extract();
}

function createAlbumDir(album) {
    if (typeof album != "undefined" || album != "" || album != null) {
        fs.stat("generated", function (error) {
            if (error) {
                if (!folderCreated) {
                    fs.mkdir("generated", function () {
                    });
                    folderCreated = true;
                }
            }
            fs.appendFile("generated" + letter + ".txt", str, 'utf8', function (error) {
                if (error)
                    console.log(error);
            });
        });
    }

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
        //ToDo enregistrement en bdd

        //ToDo creation du repertoire a partir de l'album et deplacement du fichier dans l'album
        //Si on ne connais pas l'album on crée un dossier inconnu-mois-en-cours et on deplace
        if(album != "" && typeof album == "string"){
            moveToDirectory("media/"+album, pathname);
        }else{
            var monthNow = new Date().getMonth();
            moveToDirectory("media/inconnu-"+monthNow, pathname);
        }


        extracted = false;
        //createAlbumDir(album);
        setTimeout(extract(), 100);
    });
}

function moveToDirectory(directory,pathname) {
    fs.stat(directory, function (error, stats) {
        if (error) {
            if (!folderCreated) {
                fs.mkdir(directory, function () {

                });
                folderCreated = true;
            }
        }
        var newPath = pathname.split("\\")[1];
        fs.rename(pathname, directory+"/"+newPath);
    });
}
