
document.addEventListener('DOMContentLoaded', function() {
    const scoresDiv = document.getElementById('sportsdb-scores');
    const apiKey = '508029'; // 替換成你的付費 API 金鑰
    const leagueId = '4328'; // 英超

    fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${leagueId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.events) {
                scoresDiv.innerHTML = '<p>找不到比賽資料</p>';
                return;
            }

            let html = '<div class="scores-container">';
            data.events.forEach(event => {
                html += `
                    <div class="match-row">
                        <div class="team-left">
                            <img src="https://www.thesportsdb.com/images/media/team/badge/${event.idHomeTeam}.png" alt="${event.strHomeTeam}" class="team-logo">
                            <span>${event.strHomeTeam}</span>
                        </div>
                        <div class="match-center">VS</div>
                        <div class="team-right">
                            <span>${event.strAwayTeam}</span>
                            <img src="https://www.thesportsdb.com/images/media/team/badge/${event.idAwayTeam}.png" alt="${event.strAwayTeam}" class="team-logo">
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            scoresDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('載入錯誤:', error);
            scoresDiv.innerHTML = '<p>載入失敗，請稍後再試。</p>';
        });
});
