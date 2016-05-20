var fs = require('fs');

var hiddenDirFile = ".dir";

function moveToDirectory(directory, pathname) {
    fs.stat(directory, function (error, stats) {
        var newPath = pathname.split("/")[1];
        fs.exists(directory + "/"+hiddenDirFile, function (doesExist) {
            if (!doesExist) {
                fs.mkdir(directory, function () {
                    fs.writeFile(directory + "/"+hiddenDirFile, "Dir Created", function (err) {
                        fs.rename(pathname, directory + "/" + newPath);
                    });
                });
            } else {
                fs.rename(pathname, directory + "/" + newPath);
            }
        })
    });
}


function deleteSongFile(song) {
    fs.exists(songDirectory +song.file_path, function (doesExist) {
        if(doesExist) {
            fs.unlink(songDirectory + song.file_path, function (err) {
                if (err) {
                    return;
                }
                fs.rmdir(songDirectory + song.directory_name, function(err) {
                })
            });
        }
    });
}

module.exports = {
    moveToDirectory: moveToDirectory,
    deleteSongFile: deleteSongFile,
}