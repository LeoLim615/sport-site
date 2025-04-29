<?php
/*
Plugin Name: SportsDB Scores with Logos
Description: 使用 The Sports DB API 获取体育赛事并显示球队 Logo，支持美观的比赛布局
Version: 1.2
Author: LeoLim
*/

// 获取比赛数据并返回 JSON 响应
function sportsdb_get_scores() {
    $api_key = '3'; // 替换成你的 API 密钥
    $league_id = isset($_GET['league_id']) ? sanitize_text_field($_GET['league_id']) : '4328';

    $api_url = "https://www.thesportsdb.com/api/v1/json/{$api_key}/eventsnextleague.php?id={$league_id}";
    $response = wp_remote_get($api_url);

    if (is_wp_error($response)) {
        wp_send_json_error('无法获取数据，请稍后再试。');
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (empty($data['events'])) {
        wp_send_json_error('未找到相关比赛信息。');
    }

    $events = [];

    foreach ($data['events'] as $event) {
        $homeTeamData = wp_remote_get("https://www.thesportsdb.com/api/v1/json/{$api_key}/searchteams.php?t=" . urlencode($event['strHomeTeam']));
        $awayTeamData = wp_remote_get("https://www.thesportsdb.com/api/v1/json/{$api_key}/searchteams.php?t=" . urlencode($event['strAwayTeam']));

        $homeTeamInfo = json_decode(wp_remote_retrieve_body($homeTeamData), true);
        $awayTeamInfo = json_decode(wp_remote_retrieve_body($awayTeamData), true);

        $homeLogo = $homeTeamInfo['teams'][0]['strTeamBadge'] ?? '';
        $awayLogo = $awayTeamInfo['teams'][0]['strTeamBadge'] ?? '';

        $events[] = [
            'strEvent'    => $event['strEvent'],
            'dateEvent'   => $event['dateEvent'],
            'strTime'     => $event['strTime'],
            'homeTeam'    => $event['strHomeTeam'],
            'awayTeam'    => $event['strAwayTeam'],
            'homeLogo'    => $homeLogo,
            'awayLogo'    => $awayLogo
        ];
    }

    wp_send_json_success($events);
}
add_action('wp_ajax_sportsdb_get_scores', 'sportsdb_get_scores');
add_action('wp_ajax_nopriv_sportsdb_get_scores', 'sportsdb_get_scores');

// 创建短代码
function sportsdb_shortcode($atts) {
    $atts = shortcode_atts(array(
        'league_id' => '4328'
    ), $atts);

    wp_enqueue_script('sportsdb-scores-script', plugin_dir_url(__FILE__) . 'assets/script.js', array('jquery'), null, true);
    wp_enqueue_style('sportsdb-scores-style', plugin_dir_url(__FILE__) . 'assets/style.css');

    wp_localize_script('sportsdb-scores-script', 'ajaxurl', admin_url('admin-ajax.php'));

    return '<div id="sportsdb-scores" data-league-id="' . esc_attr($atts['league_id']) . '">
                <p>加载中...</p>
            </div>';
}
add_shortcode('sportsdb_scores', 'sportsdb_shortcode');
