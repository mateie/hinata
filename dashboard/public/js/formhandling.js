$(document).ready(function() {
    $('.guild-kick-member').click(function(e) {
        e.preventDefault();
        let member = $(this).parent().parent();
        let memberID = member.children()[2].innerText;
        $.ajax({
            type: 'POST',
            url: `${window.location.href}/member/${memberID}/kick`,
            success: function() {
                member.remove();
            },
            error: function() {
                console.log('Something went wrong');
            }
        });
    });

    $('.guild-ban-member').click(function(e) {
        e.preventDefault();
        let member = $(this).parent().parent();
        let memberID = member.children()[2].innerText;
        $.ajax({
            type: 'POST',
            url: `${window.location.href}/member/${memberID}/ban`,
            success: function() {
                member.remove();
            },
            error: function() {
                console.log('Something went wrong');
            }
        });
    });
});