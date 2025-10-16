<?php 
namespace roilafx\seoevobust;

use EvolutionCMS\ServiceProvider;

class SeoevobustServiceProvider extends ServiceProvider
{
    protected $namespace = 'seoevobust';

    public function register()
    {
        $this->loadPluginsFrom(
            dirname(__DIR__) . '/plugins/'
        );
        $this->publishes([
            __DIR__ . '/../publishable/assets'  => MODX_BASE_PATH . 'assets',
        ]);
    }
}