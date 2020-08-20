$(function () {
    $("main").addClass("pre-enter").removeClass("with-hover");
    setTimeout(function () {
        $("main").addClass("on-enter");
    }, 500);
    setTimeout(function () {
        $("main").removeClass("pre-enter on-enter");
        setTimeout(function () {
            $("main").addClass("with-hover");
        }, 50);
    }, 2000);

    $(".flip, .back a.currently").click(function () {
        $(".player").toggleClass("playlist");
    });

    const socket = io();

    let playSVG = `<svg viewBox="0 0 24 24"><path d="M9.82866499,18.2771971 L16.5693679,12.3976203 C16.7774696,12.2161036 16.7990211,11.9002555 16.6175044,11.6921539 C16.6029128,11.6754252 16.5872233,11.6596867 16.5705402,11.6450431 L9.82983723,5.72838979 C9.62230202,5.54622572 9.30638833,5.56679309 9.12422426,5.7743283 C9.04415337,5.86555116 9,5.98278612 9,6.10416552 L9,17.9003957 C9,18.1765381 9.22385763,18.4003957 9.5,18.4003957 C9.62084305,18.4003957 9.73759731,18.3566309 9.82866499,18.2771971 Z" /></svg>`;

    let pauseSVG = `<svg viewBox="0 0 24 24"><path d="M8,6 L10,6 C10.5522847,6 11,6.44771525 11,7 L11,17 C11,17.5522847 10.5522847,18 10,18 L8,18 C7.44771525,18 7,17.5522847 7,17 L7,7 C7,6.44771525 7.44771525,6 8,6 Z M14,6 L16,6 C16.5522847,6 17,6.44771525 17,7 L17,17 C17,17.5522847 16.5522847,18 16,18 L14,18 C13.4477153,18 13,17.5522847 13,17 L13,7 C13,6.44771525 13.4477153,6 14,6 Z" /></svg>`;

    let queue;

    socket.on('player update', info => {
        // Times
        $('.current-duration').text(info.current.progress);
        $('.total-duration').text(info.current.duration);

        // Current Song Information
        $('.info > h1').text(info.current.artist.name);
        $('.info > h2').text(info.current.title);

        // Thumbnail
        $('.art').attr('src', info.current.thumbnail);

        // Loop Button
        if (info.loop) {
            $('.loop').addClass('active');
        } else {
            $('.loop').removeClass('active');
        }

        if (info.playing) {
            $('.toggle').html(pauseSVG);
        } else {
            $('.toggle').html(playSVG);
        }

        queue = info;
    });

    socket.on('player end', () => {
        // Times
        $('.current-duration').text('');
        $('.total-duration').text('');

        // Current Song Information
        $('.info > h1').text('');
        $('.info > h2').text('');

        // Thumbnail
        $('.art').removeAttr('src');

        $('.toggle').html('');

    });

    // Click Events
    $('.skip').click(function () {
        takeAction('skip');
    });

    $('.toggle').click(function () {
        if(queue.playing) {
            takeAction('pause');
        } else {
            takeAction('play');
        }
    });

    function takeAction(action) {
        $.ajax({
            type: 'POST',
            url: `${window.location.href}/player`,
            data: {
                player: action,
            },
            error: function (e) {
                console.log('Weird error');
                console.log(e);
            },
        });
    }
});