document.addEventListener('DOMContentLoaded', function () {
    const scoresDiv = document.getElementById('sportsdb-scores');
    const apiKey = '508029';
    const leagueId = '4328';

    fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${leagueId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.events) {
                scoresDiv.innerHTML = '<p>找不到比賽資料</p>';
                return;
            }

            let html = '<div class="scores-container">';
            const promises = data.events.map(event => {
                const homeTeam = event.strHomeTeam;
                const awayTeam = event.strAwayTeam;

                // 查詢主隊Logo
                const homeLogoPromise = fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodeURIComponent(homeTeam)}`)
                    .then(res => res.json())
                    .then(teamData => teamData.teams?.[0]?.strTeamBadge || '');

                // 查詢客隊Logo
                const awayLogoPromise = fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodeURIComponent(awayTeam)}`)
                    .then(res => res.json())
                    .then(teamData => teamData.teams?.[0]?.strTeamBadge || '');

                // 組合成比賽區塊
                return Promise.all([homeLogoPromise, awayLogoPromise]).then(([homeLogo, awayLogo]) => {
                    return `
                        <div class="match-row">
                            <div class="team-left">
                                <img src="${homeLogo}" alt="${homeTeam}" class="team-logo">
                                <span>${homeTeam}</span>
                            </div>
                            <div class="match-center">VS</div>
                            <div class="team-right">
                                <span>${awayTeam}</span>
                                <img src="${awayLogo}" alt="${awayTeam}" class="team-logo">
                            </div>
                        </div>
                    `;
                });
            });

            Promise.all(promises).then(results => {
                html += results.join('');
                html += '</div>';
                scoresDiv.innerHTML = html;
            });
        })
        .catch(error => {
            console.error('載入錯誤:', error);
            scoresDiv.innerHTML = '<p>載入失敗，請稍後再試。</p>';
        });
});
