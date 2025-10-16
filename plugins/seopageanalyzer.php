<?php
namespace EvolutionCMS\Seoevobust;

use Illuminate\Support\Facades\Event;
$modx = evo();

Event::listen(['evolution.OnLoadWebDocument'], function() use ($modx) {
    // Проверяем что это администратор
    if (!$modx->isLoggedIn('mgr')) {
        return;
    }

    // Проверяем что это фронтенд (не админка)
    if (defined('IN_MANAGER_MODE') && IN_MANAGER_MODE === true) {
        return;
    }
    
    // Добавляем CSS
    $modx->regClientCSS(MODX_SITE_URL . 'assets/plugins/Seoevobust/css/seo-analyzer.css');
    
    // Добавляем JavaScript
    $modx->regClientHTMLBlock('<script type="module" src="/assets/plugins/Seoevobust/js/index.js"></script>');
});