$(function () {
    const msgs = $('.direct-chat-messages');
    if (msgs.length !== 0) {
        const height = msgs[0].scrollHeight;
        msgs.scrollTop(height);
    }

    const socket = io();

    $('.submit-message').submit(e => {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: window.location.href,
            data: {
                message: $('.msg').val(),
            },
        })
        $('.msg').val('');
    });

    socket.on('channel message', data => {
        $('.direct-chat-messages').append(`<div class="direct-chat-msg right">
    <div class="direct-chat-infos clearfix">
        <span class="direct-chat-name float-right">${data.author.username}#${data.author.hashtag}</span>
        <span class="direct-chat-timestamp float-left">${getTime(Date.now())}</span>
    </div>
    <img class="direct-chat-img" src="https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}?size=128"
        alt="Message User Image">
    <div class="direct-chat-text">
    ${data.message}
    </div>
</div>`);

        $('.direct-chat-messages').scrollTop($('.direct-chat-messages')[0].scrollHeight);
    });
});

const getTime = timestamp => {
    const d = new Date(timestamp);
    let time = d.toLocaleTimeString();
    let date = d.toDateString();
    date = date.split(' ');
    time = time.split(' ');
    time = time[0];
    time = time.split(':');
    time = `${time[0]}:${time[1]}`;
    date = `${date[1]} ${date[2]}`;

    let newDate = `${date} ${time}`;
    return newDate;
};