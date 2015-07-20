var youtube_apikey_filename = 'youtube_apikey';

function dumpAlbums(youtubeApiKey) {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
        var exist = false;
        for (var i = 0, tab; tab = tabs[i]; i++) {
            var url = tab.url;
            if (url.indexOf('youtube') > 0 && url.indexOf('v=') > 0) {
                exist = true;
                var id = url.substring(url.indexOf('v=') + 2, url.indexOf('v=') + 13);
                var youtubeUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=' + youtubeApiKey + '&part=snippet';
                $.ajax({
                    url: youtubeUrl,
                    dataType: 'json',
                    success: function (data) {
                        for (var j = 0, item; item = data.items[j]; j++) {
                            var snippet = item.snippet;
                            var thumbnails = snippet.thumbnails;
                            var title = snippet.title;
                            var defaultUrl = thumbnails.default.url;
                            var html = '';
                            html += '<div>';
                            html += '<table><tr><td>';
                            html += '<button>Add Video</button>';
                            html += '</td><td>';
                            html += '<img src="' + defaultUrl + '"/>';
                            html += '</td></tr>';
                            html += '<tr><td></td><td style="text-align: center;">'
                            html += '<span>' + title + '</span>';
                            html += '</td></tr>';
                            html += '</div>';
                            $('#myvideos').append(html);
                        }
                    }
                });
            }
        }
        if (!exist) {
            $('#myvideos').append('No Video Available.');
        }
    });
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                callback(allText);
            }
        }
    }
    rawFile.send(null);
}


document.addEventListener('DOMContentLoaded', function () {
    var youtubeApiKey = readTextFile(youtube_apikey_filename, function (youtubeApiKey) {
        dumpAlbums(youtubeApiKey);
    });
});