$(function () {
    const msgs = $('.messages-card');
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
        $('.messages').append(`<div class="timeline-item">
        <div class="timeline-item-marker">
            <div class="timeline-item-marker-text">
                ${getTime(Date.now())}
            </div>
            <div class="timeline-item-marker-indicator"><img
                    class="img-fluid avatar avatar-lg shadow-sm"
                    src="https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png?size=128">
            </div>
        </div>
        <div class="timeline-item-content pt-0">
            <div class="card rounded shadow-sm p-3 mb-3">
                <div class="card-body">
                    <h6>${data.author.username}#${data.author.hashtag}
                    </h6>
                    ${data.message}
                </div>
            </div>
        </div>
    </div>`);

        $('.messages-card').scrollTop($('.messages-card')[0].scrollHeight);
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