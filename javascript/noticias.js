/**
 * noticias.js – melhorias isoladas para notícias do Portal Modelo.
 *
 * Este arquivo não altera menu, dropdown, Galleria, acessibilidade ou os
 * demais comportamentos de function.js. Compatível com jQuery 1.7 / Plone 4.
 */
(function ($) {
    'use strict';

    $(document).ready(function () {

        /* Troca somente o nome da escala gerada pelo Plone. */
        function trocarEscalaImagem(url, escala) {
            if (!url) return url;

            var resultado = url.replace(
                /image_(thumb|mini|tile|preview|large)(?=([?#]|$))/i,
                'image_' + escala
            );

            resultado = resultado.replace(
                /(\/@@images\/image)\/(thumb|mini|tile|preview|large)(?=([?#]|$))/i,
                '$1/' + escala
            );

            return resultado;
        }

        /* Na notícia aberta, solicita a imagem original, sem recorte. */
        function usarImagemOriginal(url) {
            if (!url) return url;

            var resultado = url.replace(
                /image_(thumb|mini|tile|preview|large)(?=([?#]|$))/i,
                'image'
            );

            resultado = resultado.replace(
                /(\/@@images\/image)\/(thumb|mini|tile|preview|large)(?=([?#]|$))/i,
                '$1'
            );

            return resultado;
        }

        /*
         * Testa as rotas de escala de Dexterity e Archetypes sem substituir
         * a miniatura atual por um endereço quebrado durante a tentativa.
         */
        function carregarMiniaturaMaior($imagem, urlConteudo) {
            var srcAtual = $imagem.attr('src');
            var baseConteudo = (urlConteudo || '')
                .replace(/[?#].*$/, '')
                .replace(/\/$/, '');
            var candidatos = [];
            var vistos = {};

            function adicionar(url) {
                if (url && !vistos[url]) {
                    vistos[url] = true;
                    candidatos.push(url);
                }
            }

            if (baseConteudo) {
                adicionar(baseConteudo + '/@@images/image/large');
                adicionar(baseConteudo + '/image_large');
            }

            adicionar(trocarEscalaImagem(srcAtual, 'large'));

            function tentar(indice) {
                if (indice >= candidatos.length) return;

                var teste = new window.Image();
                teste.onload = function () {
                    $imagem.attr('src', candidatos[indice]);
                };
                teste.onerror = function () {
                    tentar(indice + 1);
                };
                teste.src = candidatos[indice];
            }

            tentar(0);
        }

        /* Dá uma área própria à data, mesmo quando o template a imprime solta. */
        function identificarDataNoticia($item) {
            var expressaoData = /^\s*\d{2}\/\d{2}\/\d{4}\s*$/;
            var $data = $item
                .children('time, .date, .tile-date, .noticia-data')
                .first();

            if (!$data.length) {
                $data = $item.children('span, p, div').filter(function () {
                    return expressaoData.test($(this).text());
                }).first();
            }

            if ($data.length) {
                $data.addClass('noticia-data');
                return;
            }

            $item.contents().filter(function () {
                return this.nodeType === 3 &&
                    expressaoData.test(this.nodeValue || '');
            }).first().each(function () {
                $(this).replaceWith($('<time/>', {
                    'class': 'noticia-data',
                    text: $.trim(this.nodeValue)
                }));
            });
        }

        /* Aplica as melhorias somente às coleções reconhecidas como notícias. */
        $('.cover-collection-tile').each(function () {
            var $colecao = $(this);
            var $tile = $colecao.closest('.tile');
            var cabecalho = $colecao.find('.tile-header').first().text();
            var ehNoticias = /not[ií]cias?/i.test(cabecalho) ||
                $colecao.hasClass('tile-noticias') ||
                $tile.hasClass('tile-noticias');

            if (!ehNoticias) return;

            $colecao.addClass('tile-noticias');
            $tile.addClass('tile-noticias');

            $colecao.find('.collection-item').each(function () {
                var $item = $(this);
                var $linkImagem = $item.children('a').filter(function () {
                    return $(this).find('img').length > 0;
                }).first();

                identificarDataNoticia($item);

                if ($linkImagem.length) {
                    var $miniatura = $linkImagem.find('img').first();

                    carregarMiniaturaMaior($miniatura, $linkImagem.attr('href'));

                    $miniatura
                        .removeAttr('width height')
                        .attr('loading', 'lazy')
                        .attr('decoding', 'async');

                    /* Remove apenas o hover genérico aplicado antes pelo tema. */
                    $linkImagem
                        .removeClass('image-button')
                        .addClass('noticia-imagem');

                    $item
                        .addClass('noticia-com-imagem')
                        .removeClass('noticia-sem-imagem');
                } else {
                    $item
                        .addClass('noticia-sem-imagem')
                        .removeClass('noticia-com-imagem');
                }
            });
        });

        /* Imagem grande da página individual da notícia. */
        $('.newsImageContainer img, .leadImage img').each(function () {
            var $imagem = $(this);
            var srcAtual = $imagem.attr('src');
            var srcOriginal = usarImagemOriginal(srcAtual);

            if (srcOriginal && srcOriginal !== srcAtual) {
                $imagem.attr('src', srcOriginal);
            }

            $imagem
                .removeAttr('width height')
                .attr('decoding', 'async');

            $imagem.closest('a').removeClass('image-button');
        });

        /* O carrossel já possui navegação própria e não usa o hover dos botões. */
        $('.cover-carousel-tile a').removeClass('image-button');
    });

}(jQuery));
