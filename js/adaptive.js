$(document).ready(function() {

    $('#nav_trailers').before('<a href="#" class="nav_trailers-link">Каталог</a>');

    $('.mobile-menu-link').click(function(e) {
        if ($('html').hasClass('mobile-menu-open')) {
            $('html').removeClass('mobile-menu-open');
            $('.page_margins').css('margin-top', 0);
            $(window).scrollTop($('html').data('scrollTop'));
        } else {
            var curScroll = $(window).scrollTop();
            $('html').addClass('mobile-menu-open');
            $('html').data('scrollTop', curScroll);
            $('.page_margins').css('margin-top', -curScroll);
        }
        e.preventDefault();
    });

    if ($('h1').text() == 'Сравнение прицепов') {
        $('#col3_content table').wrapAll('<div class="compare-table"></div>');
    }

    if ($('h1').text() == 'Заявка на прицеп') {
        $('#adminForm').addClass('order-form-adaptive');
    }

    if ($('#YMapsID').length == 1) {
        $('#header').parent().addClass('header-dealers-adaptive');
    }

    $('#pcard_desc').each(function() {
        $('#pcard_desc').append('<div id="pcard_params" class="page_wrapper ie_floatexpand pcard_params_mobile">' + $('#pcard_params').html() + '</div>');
    });

    $('body').append('<a href="#" class="up-link"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 15L12 9L6 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></a>');

    $('.up-link').click(function(e) {
        $('html, body').animate({'scrollTop': 0});
        e.preventDefault();
    });

    $('.nav_trailers-link').click(function(e) {
        $('html').toggleClass('mobile-submenu-open');
        e.preventDefault();
    });

    $('#cat_listing .item:not(.extra_equip)').each(function() {
        var curItem = $(this);
        curItem.prepend('<div class="cat_listing-title-mobile"><a href="' + curItem.find('.title').attr('href') + '">' + curItem.find('.title').html() + '</a></div>');
    });

});

$(window).on('load resize scroll', function() {
    var windowScroll = $(window).scrollTop();
    $('body').append('<div id="body-test-height" style="position:fixed; left:0; top:0; right:0; bottom:0; z-index:-1"></div>');
    var windowHeight = $('#body-test-height').height();
    $('#body-test-height').remove();

    if (windowScroll > 0) {
        $('#header').addClass('fixed');
    } else {
        $('#header').removeClass('fixed');
    }

    if ($('.up-link').length == 1) {
        if (windowScroll > windowHeight) {
            $('.up-link').addClass('visible');
        } else {
            $('.up-link').removeClass('visible');
        }

        if (windowScroll + windowHeight > $('#footer').offset().top) {
            $('.up-link').css({'margin-bottom': (windowScroll + windowHeight) - $('#footer').offset().top});
        } else {
            $('.up-link').css({'margin-bottom': 0});
        }
    }
});