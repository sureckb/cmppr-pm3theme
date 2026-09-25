/**
 * botoes.js – botões 3:2 dos tiles de texto rico.
 *
 * Isolado de dropdown, notícias e Galleria. Compatível com jQuery 1.7.
 */
(function ($) {
    'use strict';

    $(document).ready(function () {

        /* Solicita a escala large sem exibir uma URL quebrada durante o teste. */
        function carregarEscalaMaior($imagem) {
            var srcAtual = $imagem.attr('src') || '';
            var base = srcAtual.split('/@@images/')[0];

            if (!base || base === srcAtual) return;

            var srcGrande = base + '/@@images/image/large';
            var teste = new window.Image();

            teste.onload = function () {
                $imagem.attr('src', srcGrande);
            };
            teste.src = srcGrande;
        }

        $('#main-content .cover-richtext-tile').each(function () {
            var $tile = $(this);
            var $botoes = $tile.find('a').filter(function () {
                var $imagem = $(this).find('img').first();
                var origemEditor = $imagem.attr('data-mce-src') || '';

                /*
                 * O Plone grava "thumb" no data-mce-src dos botões. Banners
                 * que usam a imagem original não entram nesta seleção.
                 */
                return $imagem.length &&
                    /\/@@images\/image\/(thumb|mini|tile|preview)/i.test(origemEditor);
            });

            if (!$botoes.length) return;

            $botoes.each(function () {
                var $link = $(this);
                var $imagem = $link.find('img').first();

                $link.addClass('image-button image-button-3x2');

                $imagem
                    .removeAttr('width height')
                    .css({ width: '', height: '' })
                    .attr('loading', 'lazy')
                    .attr('decoding', 'async');

                carregarEscalaMaior($imagem);
            });

            /* Centraliza e permite a quebra uniforme de todos os botões do tile. */
            if (!$botoes.first().closest('.image-buttons-row').length) {
                $botoes.wrapAll('<div class="image-buttons-row image-buttons-row-3x2"></div>');
            } else {
                $botoes.first().closest('.image-buttons-row')
                    .addClass('image-buttons-row-3x2');
            }
        });
    });

}(jQuery));
