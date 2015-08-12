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
                            html += '<div id="' + youtubeId + '" class="playlist-area" data-title="' + title + '" ' +
                                'style="height:80px;background-image:url(' + defaultUrl + ');background-repeat:no-repeat;' +
                                'background-position:center center; background-size:cover;">';
                            html += '</div>';
                            html += '<div class="loading" style="display:none;text-align: center;"><img src="uploading.gif" ' +
                                'style="width:80px;height:80px;"/></div>';
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
                                .appendTo('#myvideos > .items > .row');
                        }
                    }
                });
            }
        }
        if (!exist) {
            $('#myvideos').append('<ul><li>No videos available.</li> <li><a href="http://youtube.com">Go Youtube to find new videos!</a></li></ul>');
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
            $('#albums').html(html)
                // TODO: This part will use for create album function.
                //.find('#playlists .row')
                //.prepend('<div class="col-xs-6 col-sm6 col-md-6 col-lg-4 playlist" id="create_playlist"><div class="playlist-area ui-droppable"><a href="/" class="playlist-detail"><div class="thumbnail-area"><div title="Black Screen" class="thumb"></div></div><div class="caption">Create New Album</div></a><div class="summery text-center"><div class="music-summery"><i class="fa fa-music icon-left"></i>0</div><div class="coments-summery"><i class="fa fa-comments icon-left"></i>0</div><div class="subscribed-summery"><i class="fa fa-thumb-tack icon-left"></i>0</div></div></div></div>')
                //.end().parent()
                .find('.playlist-area, #myvideos').droppable({
                    hoverClass: 'ui-state-hover',
                    greedy: true,
                    drop: function (event, ui) {
                        if (event.pageY > $('#myvideos').offset().top) {

                        } else {
                            var youtubeId = ui.draggable[0].id;
                            var youtubeDom = $(ui.draggable[0]);
                            var youtubeTitle = youtubeDom.data('title');
                            youtubeDom.hide().parents().find('.loading').show();
                            var playlistDom = $($(event.target).find('a')[0]);
                            var playlistUrl = playlistDom.attr('href');
                            var caption = $(event.target).find('.caption').text();
                            var playlistId = playlistUrl.substring(playlistUrl.lastIndexOf('/') + 1);
                            if (playlistId) {
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
                                        $('.popover').html('<div class="popover-content">A video [' + youtubeTitle + '] was added to [' + caption + '] album</div>')
                                            .fadeIn().delay(3000).fadeOut();
                                        youtubeDom.show().parents().find('.loading').hide();
                                        loadMyAlbums(userId);
                                    },
                                    error: function () {
                                        $('.popover').html('<div class="popover-content">Network error!</div>')
                                            .fadeIn().delay(3000).fadeOut();
                                        youtubeDom.show().parents().find('.loading').hide();
                                    }
                                });
                            } else {
                                // TODO: This part will use for create album function.
                                $('.popover').html('<div class="popover-content">Sorry, something was wrong!</div>')
                                    .fadeIn().delay(3000).fadeOut();
                                youtubeDom.show().parents().find('.loading').hide();
                            }

                        }
                    }
                }).end()
                .find('.userpage img').imgs2CacheFF();
        }
    });
};