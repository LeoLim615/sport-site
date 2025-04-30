const apiKey = "508029";
const liveUrl = "https://www.thesportsdb.com/api/v2/json/livescore/soccer";
const container = document.getElementById("liveScores");

fetch(liveUrl, { headers: { "x-api-key": apiKey } })
  .then(res => res.json())
  .then(data => {
    if (!data.livescore || data.livescore.length === 0) {
      container.innerHTML = "📭 目前没有正在进行的比赛";
      return;
    }

    const grouped = {};
    data.livescore.forEach(match => {
      const league = match.strLeague || "其他联赛";
      if (!grouped[league]) grouped[league] = [];
      grouped[league].push(match);
    });

    let html = "";
    Object.entries(grouped).forEach(([league, matches]) => {
      html += `<div class="league-title">🏆 ${league}</div>`;
      matches.forEach(match => {
        const id = match.idEvent;
        const home = match.strHomeTeam;
        const away = match.strAwayTeam;
        const hScore = match.intHomeScore;
        const aScore = match.intAwayScore;
        const status = match.strStatus || "";
        const progress = match.strProgress ? ` | ${match.strProgress}′` : "";
        const hLogo = match.strHomeTeamBadge || "";
        const aLogo = match.strAwayTeamBadge || "";
        const datetime = match.dateEvent && match.strEventTime ?
                         match.dateEvent + " " + match.strEventTime : "";

        html += `<div class="live-match">
          <div style="grid-column:1 / span 4">🕒 开球时间: <span class="convert-time" data-datetime="${datetime}">UTC时间加载中...</span></div>
          <div style="text-align:left;display:flex;align-items:center;gap:6px;">
            ${hLogo ? `<img src="${hLogo}" alt="${home}"/>` : ""} ${home}
          </div>
          <div class="score-button" data-id="${id}">
            ${hScore} - ${aScore}<br><small>⏱️ ${status}${progress}</small>
          </div>
          <div style="text-align:right;display:flex;justify-content:flex-end;align-items:center;gap:6px;">
            ${away} ${aLogo ? `<img src="${aLogo}" alt="${away}"/>` : ""}
          </div>
          <div class="match-details" id="details-${id}">加载中...</div>
        </div>`;
      });
    });

    container.innerHTML = html;

    // Time conversion
    document.querySelectorAll(".convert-time").forEach(el => {
      const utc = el.dataset.datetime;
      const date = new Date(utc + " UTC");
      el.textContent = date.toLocaleString();
    });

    // Score button
    document.querySelectorAll(".score-button").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const detailBox = document.getElementById("details-" + id);
        if (detailBox.style.display === "block") {
          detailBox.style.display = "none";
          return;
        }
        detailBox.style.display = "block";
        detailBox.innerHTML = "⏳ 正在加载详细事件...";

        fetch("https://www.thesportsdb.com/api/v2/json/" + apiKey + "/lookup/event_timeline/" + id)
          .then(res => res.json())
          .then(data => {
            if (!data.timeline || data.timeline.length === 0) {
              detailBox.innerHTML = "⚠️ 没有详细事件数据";
              return;
            }
            const events = data.timeline.map(item => {
              let icon = "⚽️";
              if (item.strTimeline === "Goal") icon = "⚽️ 进球";
              else if (item.strTimeline === "Yellow Card") icon = "🟨 黄牌";
              else if (item.strTimeline === "Red Card") icon = "🟥 红牌";
              else if (item.strTimeline === "Substitution") icon = "🔄 换人";
              return `⏱️ ${item.intTime}' ${icon}: <strong>${item.strPlayer}</strong> ${item.strTimelineDetail ? `(${item.strTimelineDetail})` : ""}`;
            }).join("<br>");
            detailBox.innerHTML = events;
          })
          .catch(() => detailBox.innerHTML = "⚠️ 加载失败");
      });
    });

  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "⚠️ 无法获取实时比分";
  });
