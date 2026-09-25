/*

 * Compatível com jQuery 1.x (Plone 4.3)

$(document).ready(function () {


       /** Menu mobile*/

    var $nav        = $('#main-navigation');
    var $menuRoot   = $nav.find('.menu-root, ul').first();
    var $portletItem   = $('.portletNavigationTree .portletItem');
    var $portletHeader = $('.portletNavigationTree .portletHeader');

    // Injeta botão hamburguer se ainda não existir
    if ($('.menu-button').length === 0) {
        $nav.before(
            '<div class="menu-button">' +
            '<button aria-label="Mostrar ou ocultar menu" aria-expanded="false">' +
            '<span class="hiddenStructure">Menu</span>' +
            '<i class="icon-reorder fa fa-bars" aria-hidden="true"></i>' +
            '</button></div>'
        );
    }

    // Clique no hamburguer → abre/fecha a ul do menu principal
    $('.menu-button button').on('click', function () {
        var $btn     = $(this);
        var aberto   = $menuRoot.is(':visible');

        if (aberto) {
            $menuRoot.slideUp(200);
            $btn.attr('aria-expanded', 'false').removeClass('menuAtivo');
        } else {
            $menuRoot.slideDown(200);
            $btn.attr('aria-expanded', 'true').addClass('menuAtivo');
        }
    });

    /* =========================================================
       2. DROPDOWN (Plone Native / webcouturier.dropdownmenu)
       ========================================================= */

    // 1. Identifica submenus nativos do Plone
    $('#main-navigation li').each(function() {
        var $li = $(this);
        var $submenu = $li.children('ul');
        
        if ($submenu.length > 0) {
            $li.addClass('has-submenu');
            $submenu.addClass('plone-submenu'); // Classe específica para estilizar
            
            var $link = $li.children('a');
            
            // Injeta apenas um span com ícone (não um button nativo)
            if ($link.find('.seta-dropdown').length === 0) {
                $link.append('<span class="seta-dropdown"><i class="fa fa-chevron-down"></i></span>');
            }
        }
    });

    // 2. Lógica de Clique (Apenas para o ícone da seta no Mobile)
    $(document).on('click', '.seta-dropdown', function(e) {
        e.preventDefault();   // Impede de navegar ao clicar na seta
        e.stopPropagation();  // Impede eventos conflitantes
        
        var $li = $(this).closest('li.has-submenu');
        var isAberto = $li.hasClass('active');
        
        // Fecha outros submenus abertos no mesmo nível
        $li.siblings('.has-submenu').removeClass('active');
        
        // Alterna o estado do submenu atual
        if (!isAberto) {
            $li.addClass('active');
        } else {
            $li.removeClass('active');
        }
    });
    
    // (Opcional) Clique fora para fechar submenus no mobile
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#main-navigation').length) {
            $('#main-navigation li.has-submenu').removeClass('active');
        }
    });
    /* =========================================================
       3. RESPONSIVIDADE – portlet lateral e menu
       ========================================================= */

    function responsiveMenu() {
        var largura = $(window).width();

        if (largura < 901) {
            // Mobile: oculta menu e portlets
            $portletItem.hide();
            $('#column-one').hide();
            $portletHeader.off('click').on('click', function (e) {
                e.preventDefault();
                $(this).toggleClass('menuAtivo');
                $(this).next().slideToggle();
            });

        } else {
            // Desktop: mostra tudo
            $portletItem.show();
            $('#column-one').show().css('display', 'table-cell');
            $portletHeader.off('click');
            // Garante que o menu principal está visível
            $menuRoot.css('display', '');
            $('.menu-button button').removeClass('menuAtivo').attr('aria-expanded', 'false');
        }
    }

    responsiveMenu();

    $(window).on('resize', function () {
        responsiveMenu();
    });

    /* =========================================================
       4. CONTROLE DE FONTE (sem localStorage)
       ========================================================= */

    var tamanhoFonte = 100; // percentual base

    function aplicarFonte() {
        $('body').css('font-size', tamanhoFonte + '%');
    }

    // Botões do topbar (topbar injetado no index.html)
    $('#increase-font').on('click', function (e) {
        e.preventDefault();
        if (tamanhoFonte < 140) {
            tamanhoFonte += 10;
            aplicarFonte();
        }
    });

    $('#decrease-font').on('click', function (e) {
        e.preventDefault();
        if (tamanhoFonte > 80) {
            tamanhoFonte -= 10;
            aplicarFonte();
        }
    });

    $('#reset-font').on('click', function (e) {
        e.preventDefault();
        tamanhoFonte = 100;
        aplicarFonte();
    });

    /* =========================================================
       5. ALTO CONTRASTE (sem localStorage)
       ========================================================= */

    $('#toggle-contrast').on('click', function (e) {
        e.preventDefault();
        $('body').toggleClass('high-contrast');
    });

    /* =========================================================
       6. ACESSIBILIDADE – teclas de atalho numéricas (1–4)
          O navegador trata os accesskey do HTML;
          este bloco garante compatibilidade com alguns
          navegadores que precisam do evento keydown manual.
       ========================================================= */

    $(document).on('keydown', function (e) {
        // Só dispara quando não há input/textarea focado
        var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        var mapa = {
            '1': '#main-content',
            '2': '#main-navigation',
            '3': '#portal-searchbox',
            '4': '#footer-info'
        };

        var alvo = mapa[e.key];
        if (alvo) {
            var $el = $(alvo);
            if ($el.length) {
                e.preventDefault();
                // Scroll suave até o elemento
                $('html, body').animate({ scrollTop: $el.offset().top - 60 }, 300);
                // Foca se possível
                $el.attr('tabindex', '-1').focus();
            }
        }
    });

    /* =========================================================
       7. HOVER NOS BOTÕES DE IMAGEM 200×200
          Detecção automática: imagens quadradas (~200px)
          dentro de links no #main-content recebem a classe
          "image-button" para ativar o CSS de overlay.
       ========================================================= */

    /* Limita o efeito aos botões criados dentro de tiles de texto rico. */
    $('#main-content .cover-richtext-tile a').each(function () {
        var $link = $(this);
        var $img  = $link.find('img');

        if ($img.length === 0) return;

        var w = $img.attr('width') || $img.width();
        var h = $img.attr('height') || $img.height();

        // Considera "botão" se largura entre 120–260px (aprox. quadrado)
        if (w && h && w >= 120 && w <= 260 && Math.abs(w - h) < 60) {
            $link.addClass('image-button');
        } else if ($link.find('img[width="200"], img[width="200px"]').length) {
            $link.addClass('image-button');
        }
    });

    // Agrupa botões consecutivos num wrapper responsivo
    // (apenas se não estiverem já dentro de .image-buttons-row)
    var grupos = [];
    var grupoAtual = [];

    $('#main-content .cover-richtext-tile a.image-button').each(function (i, el) {
        var ant = grupoAtual.length > 0 ? grupoAtual[grupoAtual.length - 1] : null;
        if (ant && ($(el).prev().is('a.image-button') || $(el).parent().prev().children('a.image-button').length)) {
            grupoAtual.push(el);
        } else {
            if (grupoAtual.length > 0) grupos.push(grupoAtual);
            grupoAtual = [el];
        }
    });
    if (grupoAtual.length > 0) grupos.push(grupoAtual);

    $.each(grupos, function (i, grupo) {
        if (grupo.length > 1 && !$(grupo[0]).closest('.image-buttons-row').length) {
            $(grupo).wrapAll('<div class="image-buttons-row"></div>');
        }
    });

});
