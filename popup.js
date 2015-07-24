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
                            $(html).find('button').click(function () {
                                var pid = 'Z1S_glHFMe';
                                $('#status').text('success add a video');

                                //$.ajax({
                                //    url: 'http://swizzle.fm/repost/to/' + pid,
                                //    data: {pid : pid, sid : },
                                //    type: 'post',
                                //    success: function () {
                                //        alert('success!');
                                //    }
                                //});

                            }).end().appendTo('#myvideos');
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
    $.ajax({
        url: file,
        dataType: 'text',
        success: function (data) {
            callback(data);
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    readTextFile(youtube_apikey_filename, function (youtubeApiKey) {
        dumpAlbums(youtubeApiKey);
    });
    $.ajax({
        url: 'http://swizzle.fm/discovers/popular',
        dataType: 'html',
        success: function (html) {
            var hrefUrl = $(html).find('.my-navi > a').attr('href');
            if (hrefUrl) {
                var userId = hrefUrl.substring(hrefUrl.lastIndexOf('/') + 1);
                $.ajax({
                    url: 'http://swizzle.fm/pages/userpage/' + userId,
                    crossDomain: true,
                    dataType: 'html',
                    success: function (html) {
                        $('#albums').html(html).find('.userpage img').imgs2CacheFF();
                    }
                });
            } else {
                $('#status').append('Need to login');
            }
        }
    });
});

