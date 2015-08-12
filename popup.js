var youtube_apikey_filename = 'youtube_apikey';

function dumpAlbums(youtubeApiKey) {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
        var exist = false;
        for (var i = 0, tab; tab = tabs[i]; i++) {
            var url = tab.url;
            if (url.indexOf('youtube') > 0 && url.indexOf('v=') > 0) {
                exist = true;
                var youtubeId = url.substring(url.indexOf('v=') + 2, url.indexOf('v=') + 13);
                var youtubeUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + youtubeId + '&key=' + youtubeApiKey + '&part=snippet';
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
                            html += '<div class="col-xs-6 col-sm6 col-md-6 col-lg-4 playlist">';
                            html += '<div id="' + youtubeId + '" class="playlist-area" data-title="' + title + '">';
                            html += '<img src="' + defaultUrl + '"/>';
                            html += '</div>';
                            html += '<div class="playlist-profile">';
                            html += title;
                            html += '</div>';
                            html += '</div>';

                            $(html)
                                .find('.playlist-area').css({'z-index': 9999})
                                .draggable({
                                    revert: true,
                                    scroll: false
                                }).end()
                                .find('img').width('100%').end()
                                .appendTo('#myvideos > .items > .row');
                        }
                    }
                });
            }
        }
        if (!exist) {
            $('#myvideos').append('<li>No videos available.</li> <li><a href="http://youtube.com">Go Youtube to find new videos!</a></li>');
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
    $(document).on("click", "a", function () {
        var innerUrl = $(this).attr('href');
        if (innerUrl.indexOf('http://') > -1 || innerUrl.indexOf('https://') > -1) {
            chrome.tabs.create({url: innerUrl});
        } else {
            chrome.tabs.create({url: 'http://swizzle.fm' + innerUrl});
        }
        return false;
    });

    $.ajax({
        url: 'http://swizzle.fm/discovers/popular',
        dataType: 'html',
        success: function (html) {
            var hrefUrl = $(html).find('.my-navi > a').attr('href');
            if (hrefUrl) {
                var userId = hrefUrl.substring(hrefUrl.lastIndexOf('/') + 1);

                $(document).on("click", ".edit-user-info", function () {
                    chrome.tabs.create({url: 'http://swizzle.fm/users/profile/' + userId});
                    return false;
                });

                loadMyAlbums(userId);

            } else {
                $('#albums').append('You need to sign-in on the web. <br/><a href="/">Go swizzle for sign-in!</a>')
                    .css('padding', 30);
            }
        }
    });
});

var loadMyAlbums = function (userId) {
    $.ajax({
        url: 'http://swizzle.fm/pages/userpage/' + userId,
        crossDomain: true,
        dataType: 'html',
        success: function (html) {
            $('#albums').html(html).parent()
                .find('.playlist-area, #myvideos').droppable({
                    hoverClass: 'ui-state-hover',
                    greedy: true,
                    drop: function (event, ui) {
                        if (event.pageY > $('#myvideos').offset().top) {

                        } else {
                            var youtubeId = ui.draggable[0].id;
                            var youtubeTitle = $(ui.draggable[0]).data('title');
                            var playlistDom = $($(event.target).find('a')[0]);
                            var playlistUrl = playlistDom.attr('href');
                            var caption = $(event.target).find('.caption').text();
                            var playlistId = playlistUrl.substring(playlistUrl.lastIndexOf('/') + 1);

                            $.ajax({
                                url: 'http://swizzle.fm/songs/create/' + playlistId,
                                data: {
                                    song: {
                                        youtube_id: youtubeId,
                                        title: youtubeTitle
                                    },
                                    pid: playlistId,
                                    uid: userId
                                },
                                type: 'post',
                                success: function () {
                                    $('#status').append('<div class="popover-content">success add a video [' + youtubeTitle + '] to album [' + caption + ']</div>')
                                        .fadeIn().delay(3000).fadeOut();

                                    loadMyAlbums(userId);
                                },
                                error: function () {
                                    $('#status').append('<div class="popover-content">Network error!</div>')
                                        .fadeIn().delay(3000).fadeOut();
                                }
                            });


                        }
                    }
                }).end()
                .find('.userpage img').imgs2CacheFF();
        }
    });
};