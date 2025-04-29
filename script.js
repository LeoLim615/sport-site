jQuery(document).ready(function($) {
    const scoresDiv = $('#sportsdb-scores');
    const leagueId = scoresDiv.data('league-id');

    $.ajax({
        url: ajaxurl,
        method: 'GET',
        data: {
            action: 'sportsdb_get_scores',
            league_id: leagueId
        },
        success: function(response) {
            if (response.success) {
                let html = '<div class="scores-container">';
                response.data.forEach(event => {
                    html += `<div class="match-row">
                        <div class="team-left">
                            <img src="${event.homeLogo}" alt="${event.homeTeam}" class="team-logo">
                            <span>${event.homeTeam}</span>
                        </div>
                        <div class="match-center">VS</div>
                        <div class="team-right">
                            <span>${event.awayTeam}</span>
                            <img src="${event.awayLogo}" alt="${event.awayTeam}" class="team-logo">
                        </div>
                    </div>`;
                });
                html += '</div>';
                scoresDiv.html(html);
            } else {
                scoresDiv.html(`<p>${response.data}</p>`);
            }
        },
        error: function() {
            scoresDiv.html('<p>加载比赛数据时出现错误，请稍后再试。</p>');
        }
    });
});