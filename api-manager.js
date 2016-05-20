var http = require('http');

function postSong(post_data) {
    // Set up the request
    var post_req = http.request({
            host: 'localhost',
            port: '8000',
            path: '/songs',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        },
        function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    post_req.write(post_data);
    post_req.end();
}

module.exports = {
    postSong: postSong,
}