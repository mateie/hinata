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

$(".flip, .back a").click(function () {
    $(".player").toggleClass("playlist");
});

$(".bottom a").not(".flip").click(function () {
    $(this).toggleClass("active");
});

setInterval(() => {
    $.ajax({
        type: 'GET',
        url: `${window.location.href}/player`,
        success: function (data) {
            reloadPlayer(data);
        },
        error: function (err) {
            console.log(err, 'error');
        },
    });
}, 1000);

function reloadPlayer(data) {
    let currentTrack = data.track;
    $('.art').attr('src', currentTrack.thumbnail);
    //$('.now-playing').text(`${currentTrack.playing ? 'Currently Playing' : 'Paused'}`);
    //$('.duration').html(currentTrack.duration);
    //$('.progress').html(currentTrack.progress);
    $('time').children('span')[0].innerText = currentTrack.progress;
    $('time').children('span')[1].innerText = currentTrack.duration;
    $('.info > h1').text(currentTrack.artist.name);
    $('.info > h2').text(currentTrack.title);
    //$('.artist-avatar').attr('src', currentTrack.artist.avatar);
}

$('.update-playlist').click(function () {
    $.ajax({
        type: 'GET',
        url: `${window.location.href}/player`,
        success: function (data) {
            let songs = data.songs;
            console.log(songs);
            let playlist = $('.back ol');
            for(let i = 0; i < songs.length; i++) {
                if(i > 0) {
                    let song = songs[i];
                    console.log(i);
                    playlist.html(`<li><a><img src="${song.thumbnail}" /><div><h3>${song.author.name}</h3><h4>${song.title}</h4></div></a></li>`);
                }
            }
        },
        error: function (err) {
            console.log(err, 'error');
        },
    });
});