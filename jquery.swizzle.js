/**
 * Custom jQuery Functions
 * =======================================================================
 */

(function ($) {
    'use strict';

    /*
     * Facebook profile picture into session storage to use later as cache
     */

    // check duplicate key
    var $chkDupKey = [];

    $.fn.imgs2CacheFF = function () {
        $chkDupKey = [];

        var elements = this || [];

        for (var i = 0, len = elements.length; i < len; i += 1) {
            var pic = $(elements[i]);

            _imgs2Cache(pic);
        }

        return this;
    };

    function _imgs2Cache(pic) {
        var src = pic.data('src');
        var key = pic.data('key');

        if (src) {
            if (!Modernizr.sessionstorage) {
                console.log('Browser is not supporting Session Storage');

                pic.attr('src', src);
            } else {
                var cache = sessionStorage.getItem(key);

                if (cache) {
                    pic.attr('src', cache);

                    return false;
                } else {
                    pic.attr('src', src);

                    if ($chkDupKey.indexOf(key) === -1) {
                        $chkDupKey.push(key);

                        $.get(src + '&redirect=false', function (data) {
                            if (data.data) {
                                var url = data.data.url;

                                try {
                                    sessionStorage.setItem(key, url);
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        });
                    }
                }
            }
        }
    }
})(jQuery);