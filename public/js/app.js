require.config({
	paths: {
		jquery:              '../components/jquery/dist/jquery',
		underscore:          '../components/underscore/underscore',
		bootstrapAffix:      '../components/sass-bootstrap/js/affix',
		bootstrapAlert:      '../components/sass-bootstrap/js/alert',
		bootstrapButton:     '../components/sass-bootstrap/js/button',
		bootstrapCarousel:   '../components/sass-bootstrap/js/carousel',
		bootstrapCollapse:   '../components/sass-bootstrap/js/collapse',
		bootstrapDropdown:   '../components/sass-bootstrap/js/dropdown',
		bootstrapModal:      '../components/sass-bootstrap/js/modal',
		bootstrapPopover:    '../components/sass-bootstrap/js/popover',
		bootstrapScrollspy:  '../components/sass-bootstrap/js/scrollspy',
		bootstrapTab:        '../components/sass-bootstrap/js/tab',
		bootstrapTooltip:    '../components/sass-bootstrap/js/tooltip',
		bootstrapTransition: '../components/sass-bootstrap/js/transition',
		jqueryVimeoEmbed:    '../components/jquery-smart-vimeo-embed/jquery-smartvimeoembed'
	},
	shim: {
		bootstrapAffix: {
			deps: [
				'jquery'
			]
		},
		bootstrapAlert: {
			deps: [
				'jquery'
			]
		},
		bootstrapButton: {
			deps: [
				'jquery'
			]
		},
		bootstrapCarousel: {
			deps: [
				'jquery'
			]
		},
		bootstrapCollapse: {
			deps: [
				'jquery',
				'bootstrapTransition'
			]
		},
		bootstrapDropdown: {
			deps: [
				'jquery'
			]
		},
		bootstrapPopover: {
			deps: [
				'jquery'
			]
		},
		bootstrapScrollspy: {
			deps: [
				'jquery'
			]
		},
		bootstrapTab: {
			deps: [
				'jquery'
			]
		},
		bootstrapTooltip: {
			deps: [
				'jquery'
			]
		},
		bootstrapTransition: {
			deps: [
				'jquery'
			]
		},
		jqueryVimeoEmbed: {
			deps: [
				'jquery'
			]
		}
	}
});

require(['jquery', 'underscore', 'bootstrapTransition', 'bootstrapCollapse', 'searchMode', 'bootstrapTab', 'bootstrapCarousel', 'jqueryVimeoEmbed' ], function ( $, _ ) {
	'use strict';

	$('.vimeo-thumb').each(function() {
		$(this).smartVimeoEmbed(_({
			width: $( this ).data('width')
		}).defaults({width: 640}));
	});

	var screenWidth = function() {
		return ( window.innerWidth > 0 ) ? window.innerWidth : screen.width;
	};

	$( window ).on('resize', _.debounce(function() {
		if (screenWidth() > 991) {
			$('#readable-navbar-collapse')
				.removeAttr('style')
				.removeClass('in');
		}
	}, 500));
});
