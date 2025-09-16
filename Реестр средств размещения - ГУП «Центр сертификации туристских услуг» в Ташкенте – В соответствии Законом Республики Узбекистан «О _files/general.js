getRandomInt = function(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}

ShowOverlay = function(){
	$('<div class="jqmOverlay waiting"></div>').appendTo('body');
}

window.addEventListener('popstate', function(event) {
	if(typeof(startActions) == 'function') {
		setTimeout(startActions, 500);
	}
});

HideOverlay = function(){
	$('.jqmOverlay').detach();
	CloseMobilePhone();
}

CheckTopMenuDotted = function(){
	var menu = $('nav.mega-menu.sliced');
	/*if(isMobile)
		return;*/

	if(window.matchMedia('(max-width:991px)').matches)
		return;

	if(menu.length)
	{
		menu.each(function(){
			var menuMoreItem = $(this).find('td.js-dropdown');
			if($(this).parents('.collapse').css('display') == 'none'){
				return false;
			}

			var block_w = $(this).closest('div').actual('width');
			var	menu_w = $(this).find('table').actual('outerWidth');
			var afterHide = false;

			while(menu_w > block_w) {
				menuItemOldSave = $(this).find('td').not('.nosave').last();
				if(menuItemOldSave.length){
					menuMoreItem.show();
					menuItemNewSave = '<li class="' + (menuItemOldSave.hasClass('dropdown') ? 'dropdown-submenu ' : '') + (menuItemOldSave.hasClass('active') ? 'active ' : '') + '" data-hidewidth="' + menu_w + '">' + menuItemOldSave.find('.wrap').html() + '</li>';
					menuItemOldSave.remove();
					menuMoreItem.find('> .wrap > .dropdown-menu').prepend(menuItemNewSave);
					menu_w = $(this).find('table').actual('outerWidth');
					afterHide = true;
				}
				//menu.find('.nosave').css('display', 'table-cell');
				else{
					break;
				}
			}

			if(!afterHide) {
				do {
					var menuItemOldSaveCnt = menuMoreItem.find('.dropdown-menu').find('li').length;
					menuItemOldSave = menuMoreItem.find('.dropdown-menu').find('li').first();
					if(!menuItemOldSave.length) {
						menuMoreItem.hide();
						break;
					}
					else {
						var hideWidth = menuItemOldSave.attr('data-hidewidth');
						if(hideWidth > block_w) {
							break
						}
						else {
							menuItemNewSave = '<td class="' + (menuItemOldSave.hasClass('dropdown-submenu') ? 'dropdown ' : '') + (menuItemOldSave.hasClass('active') ? 'active ' : '') + '" data-hidewidth="' + block_w + '"><div class="wrap">' + menuItemOldSave.html() + '</div></td>';
							menuItemOldSave.remove();
							$(menuItemNewSave).insertBefore($(this).find('td.js-dropdown'));
							if(!menuItemOldSaveCnt) {
								menuMoreItem.hide();
								break;
							}
						}
					}
					menu_w = $(this).find('table').actual('outerWidth');
				}
				while(menu_w <= block_w);
			}
			$(this).find('td').css('visibility', 'visible');
			$(this).find('td').removeClass('unvisible');
		})
	}
	return false;
}

CheckTopVisibleMenu = function(that) {
	var dropdownMenu = $('.dropdown-menu:visible').last();

	if(dropdownMenu.length){
		dropdownMenu.find('a').css('white-space', '');
		dropdownMenu.css('left', '');
		dropdownMenu.css('right', '');
		dropdownMenu.removeClass('toright');

		var dropdownMenu_left = dropdownMenu.offset().left;
		if(typeof(dropdownMenu_left) != 'undefined'){
			var menu = dropdownMenu.parents('.mega-menu');
			if(!menu.length)
				menu = dropdownMenu.closest('.logo-row');
			var menu_width = menu.outerWidth();
			var menu_left = menu.offset().left;
			var menu_right = menu_left + menu_width;
			var isToRight = dropdownMenu.parents('.toright').length > 0;
			var parentsDropdownMenus = dropdownMenu.parents('.dropdown-menu');
			var isHasParentDropdownMenu = parentsDropdownMenus.length > 0;
			if(isHasParentDropdownMenu){
				var parentDropdownMenu_width = parentsDropdownMenus.first().outerWidth();
				var parentDropdownMenu_left = parentsDropdownMenus.first().offset().left;
				var parentDropdownMenu_right = parentDropdownMenu_width + parentDropdownMenu_left;
			}

			if(parentDropdownMenu_right + dropdownMenu.outerWidth() > menu_right){
				dropdownMenu.find('a').css('white-space', 'normal');
			}

			var dropdownMenu_width = dropdownMenu.outerWidth();
			var dropdownMenu_right = dropdownMenu_left + dropdownMenu_width;

			if(dropdownMenu_right > menu_right || isToRight){
				var addleft = 0;
				addleft = menu_right - dropdownMenu_right;
				if(isHasParentDropdownMenu || isToRight){
					dropdownMenu.css('left', 'auto');
					dropdownMenu.css('right', '100%');
					dropdownMenu.addClass('toright');
				}
				else{
					var dropdownMenu_curLeft = parseInt(dropdownMenu.css('left'));
					dropdownMenu.css('left', (dropdownMenu_curLeft + addleft) + 'px');
				}
			}
		}
	}
}

MegaMenuFixed = function(){
	var animationTime = 150;

	$('.logo_and_menu-row .burger').on('click', function(){
		$('.mega_fixed_menu').fadeIn(animationTime);
	});

	$('.mega_fixed_menu .svg.svg-close').on('click', function(){
		$(this).closest('.mega_fixed_menu').fadeOut(animationTime);
	});

	$('.mega_fixed_menu .dropdown-menu .arrow').on('click', function(e){
		e.preventDefault();
		e.stopPropagation();
		$(this).closest('.dropdown-submenu').find('.dropdown-menu').slideToggle(animationTime);
		$(this).closest('.dropdown-submenu').addClass('opened');
	});
}

CheckPopupTop = function(){
	var popup = $('.jqmWindow.show');
	if(popup.length){
		var documentScollTop = $(document).scrollTop();
		var windowHeight = $(window).height();
		var popupTop = parseInt(popup.css('top'));
		var popupHeight = popup.height();

		if(windowHeight >= popupHeight){
			// center
			popupTop = (windowHeight - popupHeight) / 2;
		}
		else{
			if(documentScollTop > documentScrollTopLast){
				// up
				popupTop -= documentScollTop - documentScrollTopLast;
			}
			else if(documentScollTop < documentScrollTopLast){
				// down
				popupTop += documentScrollTopLast - documentScollTop;
			}

			if(popupTop + popupHeight < windowHeight){
				// bottom
				popupTop = windowHeight - popupHeight;
			}
			else if(popupTop > 0){
				// top
				popupTop = 0;
			}
		}
		popup.css('top', popupTop + 'px');
	}
}

CheckMainBannerSliderVText = function(slider){
	/*if(slider.parents('.banners-big').length){
		var sh = slider.height();
		slider.find('.item').each(function() {
			var curSlideTextInner = $(this).find('.text .inner');
			if(curSlideTextInner.length){
				var ith = curSlideTextInner.actual('height');
				var p = (ith >= sh ? 0 : Math.floor((sh - ith) / 2));
				curSlideTextInner.css('padding-top', p + 'px');
			}
		});
	}*/
}

CheckStickyFooter = function() {
	BX.addCustomEvent('onWindowResize', function(eventdata){
		if(!isMobile)
		{
			try{
				var footerHeight = $('footer').outerHeight();
				ignoreResize.push(true);
				$('footer').css('margin-top', '-' + footerHeight + 'px');
				$('.body').css('margin-bottom', '-' + footerHeight + 'px');
				$('.main').css('padding-bottom', footerHeight + 0 + 'px');
				ignoreResize.pop();
			}
			catch(e){}
		}
	});
}

verticalAlign = function(class_name){
	if(typeof class_name == "undefined")
		class_name = 'auto_align';
    if($('.'+class_name).length)
    {
	    maxHeight = 0;
	    $('.'+class_name).each(function(){
	        if ($(this).height()> maxHeight){
	            maxHeight = $(this).height();
	        };
	    });
	    $('.'+class_name).each(function(){

	            delta = Math.round((maxHeight - $(this).height())/2);
	            $(this).css({'padding-top': delta+'px', 'padding-bottom': delta+'px'});
	    });
	}
}

getGridSize = function(counts, custom_counts) {
	var z = parseInt($('.body_media').css('top'));
	if(typeof(custom_counts) != 'undefined')
	{
		if(window.matchMedia('(max-width: 700px)').matches)
			return (counts[3] ? counts[3] : counts[2]);
		else if(window.matchMedia('(max-width: 850px)').matches)
			return counts[2];
		else if(window.matchMedia('(max-width: 1100px)').matches)
			return counts[1];
		else
			return counts[0];
	}
	else
	{
		if(window.matchMedia('(max-width: 600px)').matches)
		{
			return (counts[3] ? counts[3] : counts[2]);
		}
		else
			return (z == 2 ? counts[0] : z == 1 ? counts[1] : counts[2]);
	}
}

CheckFlexSlider = function(){
	$('.flexslider:not(.thmb):visible').each(function(){
		var slider = $(this);
		slider.resize();
		var counts = slider.data('flexslider').vars.counts,
			slide_counts = slider.data('flexslider').vars.slide_counts;
		if(typeof(counts) != 'undefined'){
			var cnt = getGridSize(counts, slider.data('flexslider').vars.customGrid);
			var to0 = (cnt != slider.data('flexslider').vars.minItems || cnt != slider.data('flexslider').vars.maxItems || cnt != slider.data('flexslider').vars.move);
			if(to0){
				slider.data('flexslider').vars.minItems = cnt;
				slider.data('flexslider').vars.maxItems = cnt;
				if(typeof(slide_counts) != 'undefined')
					slider.data('flexslider').vars.move = slide_counts;
				else
					slider.data('flexslider').vars.move = cnt;

				slider.flexslider(0);
				slider.resize();
				slider.resize(); // twise!
			}
		}
	});
}

CheckHeaderFixed = function(){
	var header_fixed = $('#headerfixed');
		header = $('header').first();
	if(header_fixed.length){
		if(header.length)
		{
			var isHeaderFixed = false,
				headerCanFix = true,
				headerFixedHeight = header_fixed.actual('outerHeight'),
				headerNormalHeight = header.actual('outerHeight'),
				headerDiffHeight = headerNormalHeight - headerFixedHeight,
				mobileBtnMenu = $('.btn.btn-responsive-nav'),
				headerTop = $('#panel:visible').actual('outerHeight');
				topBlock = $('.TOP_HEADER').first();

			if(headerDiffHeight <= 0)
				headerDiffHeight = 0;
			if(topBlock.length)
				headerTop += topBlock.actual('outerHeight');

			$(window).scroll(function(){
				/*if(!isMobile && window.matchMedia('(min-width: 992px)').matches)
				{*/
					var scrollTop = $(window).scrollTop();
					headerCanFix = !mobileBtnMenu.is(':visible')/* && !$('.dropdown-menu:visible').length*/;

					var current_is = $('.search-wrapper .search-input:visible'),
						title_search_result = $('.title-search-result.'+current_is.attr('id')),
						pos, pos_input;

					if(!isHeaderFixed)
					{
						if((scrollTop > headerNormalHeight + headerTop) && headerCanFix)
						{
							isHeaderFixed = true;
							header_fixed.css('top', '-' + headerNormalHeight + 'px');
							header_fixed.addClass('fixed');
							// header_fixed.stop(0).animate({top: '0'}, 300);

							header_fixed.animate({top: '0'}, {duration:300, complete:
								function(){}
							});
							CheckTopMenuDotted();
						}
					}
					else if(isHeaderFixed || !headerCanFix)
					{
						if((scrollTop <= headerDiffHeight + headerTop) || !headerCanFix)
						{
							isHeaderFixed = false;
							header_fixed.removeClass('fixed');
						}
					}
				// }
			});
		}
	}

	//mobile fixed
	var mfixed = $('body.mfixed_Y #mobileheader, body.mfixed_Y #mobileheadersimple');
	if(mfixed.length && isMobile)
	{
		var isMHeaderFixed = false,
			mheaderCanFix = true,
			//mheaderFixedHeight = mfixed.actual('outerHeight'),
			mheaderFixedHeight = 0,
			mheaderTop = $('#panel:visible').actual('outerHeight');
		$(window).scroll(function(){
			var scrollTop = $(window).scrollTop();
			if(window.matchMedia('(max-width:991px)').matches)
			{
				if($('body.mfixed_Y.mfixed_view_scroll_top #mobileheader').length || $('body.mfixed_Y.mfixed_view_scroll_top #mobileheadersimple').length)
				{

					if(scrollTop > startScroll)
					{
						$('body.mfixed_Y.mfixed_view_scroll_top #mobileheader').removeClass('fixed');
						$('body.mfixed_Y.mfixed_view_scroll_top #mobileheadersimple').removeClass('fixed');
					}
					else if(scrollTop > mheaderFixedHeight + mheaderTop){
						$('body.mfixed_Y.mfixed_view_scroll_top #mobileheader').addClass('fixed');
						$('body.mfixed_Y.mfixed_view_scroll_top #mobileheadersimple').addClass('fixed');
					}
					else if(scrollTop <= mheaderFixedHeight + mheaderTop){
						$('body.mfixed_Y.mfixed_view_scroll_top #mobileheader').removeClass('fixed');
						$('body.mfixed_Y.mfixed_view_scroll_top #mobileheadersimple').removeClass('fixed');
					}
					startScroll = scrollTop;

				}
				else
				{
					if(!isMHeaderFixed)
					{
						if((scrollTop > mheaderFixedHeight + mheaderTop))
						{
							isMHeaderFixed = true;
							mfixed.addClass('fixed');
						}
					}
					else if(isMHeaderFixed)
					{
						if((scrollTop <= mheaderFixedHeight + mheaderTop))
						{
							isMHeaderFixed = false;
							mfixed.removeClass('fixed');
						}
					}
				}
			}
			else
				mfixed.removeClass('fixed');
		})
	}
}

CheckObjectsSizes = function() {
	$('.container iframe,.container object,.container video').each(function() {
		var height_attr = $(this).attr('height');
		var width_attr = $(this).attr('width');
		if (height_attr && width_attr) {
			$(this).css('height', $(this).outerWidth() * height_attr / width_attr);
		}
	});
}

scrollToTop = function(){
	if(arAllcorp2Options['THEME']['SCROLLTOTOP_TYPE'] !== 'NONE'){
		scrollToTopAnimateClassIn = arAllcorp2Options.THEME.SCROLLTOTOP_TYPE.indexOf('ROUND') !== -1 ? 'rotateIn' : 'rubberBand';
		scrollToTopAnimateClassOut = arAllcorp2Options.THEME.SCROLLTOTOP_TYPE.indexOf('ROUND') !== -1 ? 'rotateOut' : 'flipOutX';
		if(BX.browser.IsMac())
		{
			scrollToTopAnimateClassIn = scrollToTopAnimateClassOut = '';
		}
		var _isScrolling = false;
		// Append Button
		$('body').append($('<a />').addClass('scroll-to-top ' + arAllcorp2Options['THEME']['SCROLLTOTOP_TYPE'] + ' ' + arAllcorp2Options['THEME']['SCROLLTOTOP_POSITION']).attr({'href': '#', 'id': 'scrollToTop'}));
		$scrolltotop = $('#scrollToTop');

		if(arAllcorp2Options.THEME.SCROLLTOTOP_POSITION_RIGHT)
			$scrolltotop.css({'right': arAllcorp2Options.THEME.SCROLLTOTOP_POSITION_RIGHT+'px', 'left': 'auto'});

		$scrolltotop.click(function(e){
			e.preventDefault();
			$('body, html').animate({scrollTop : 0}, 500);
			return false;
		});
		// Show/Hide Button on Window Scroll event.
		$(window).scroll(function(){
			if(!_isScrolling) {
				_isScrolling = true;

				var bottom = 23,
					scrollVal = $(window).scrollTop(),
					windowHeight = $(window).height();

				if(arAllcorp2Options.THEME.SCROLLTOTOP_POSITION_BOTTOM) {
					bottom = arAllcorp2Options.THEME.SCROLLTOTOP_POSITION_BOTTOM;
					$scrolltotop.css('bottom', bottom+'px');
				}

				var footerOffset = 0;
				if ($('footer').get(0)) {
					footerOffset = $('footer').offset().top;
				}
				if(scrollVal > 150){
					$('#scrollToTop').stop(true, true).addClass('visible');
					_isScrolling = false;
				}
				else{
					$('#scrollToTop').stop(true, true).removeClass('visible');
					_isScrolling = false;
				}
				CheckScrollToTop();
			}
		});
	}
}

CheckScrollToTop = function(){
	if(arAllcorp2Options["THEME"]["SCROLLTOTOP_TYPE"] !== "NONE" && $scrolltotop.length != undefined)
	{
		if(documentScrollTop > 150){
			$scrolltotop.stop(true, true).addClass('visible').addClass('animated');
			if(scrollToTopAnimateClassOut){
				$scrolltotop.removeClass(scrollToTopAnimateClassOut);
			}
			if(scrollToTopAnimateClassIn){
				$scrolltotop.addClass(scrollToTopAnimateClassIn);
			}
		}
		else{
			$scrolltotop.stop(true, true).removeClass('visible');
			if(scrollToTopAnimateClassIn){
				$scrolltotop.removeClass(scrollToTopAnimateClassIn);
			}
			if(scrollToTopAnimateClassOut){
				$scrolltotop.addClass(scrollToTopAnimateClassOut);
			}
		}
	}
	var bottom = 23,
		scrollVal = $(window).scrollTop(),
		windowHeight = $(window).height();

	if(arAllcorp2Options.THEME.SCROLLTOTOP_POSITION_BOTTOM) {
		bottom = arAllcorp2Options.THEME.SCROLLTOTOP_POSITION_BOTTOM;
		$scrolltotop.css('bottom', bottom+'px');
	}

	if($('footer').length)
		var footerOffset = $('footer').offset().top;

	if(scrollVal + windowHeight > footerOffset){
		$('#scrollToTop').css('bottom', bottom + scrollVal + windowHeight - footerOffset);
	}
	else if(parseInt($('#scrollToTop').css('bottom')) > bottom){
		$('#scrollToTop').css('bottom', bottom);
	}
}

var isMobile = jQuery.browser.mobile;
var players = {};

if(isMobile){
	document.documentElement.className += ' mobile';
}

var timerScroll = false, ignoreScroll = [], documentScrollTopLast = $(document).scrollTop(), startScroll = 0;

function pauseMainBanner(){
	$('.banners-big .flexslider').flexslider('pause');
}

function playMainBanner(){
	$('.banners-big .flexslider').flexslider('play');
}

function startMainBannerSlideVideo($slide){
	var slideActiveIndex = $slide.attr('data-slide_index')
	var $slides = $slide.closest('.items').find('.item[data-slide_index="'+ slideActiveIndex +'"]') // current slide & cloned
	var videoSource = $slide.attr('data-video_source')
	if(videoSource){
		$slides.addClass('loading')
		pauseMainBanner()

		var videoPlayerSrc = $slide.attr('data-video_src')
		var videoSoundDisabled = $slide.attr('data-video_disable_sound')
		var bVideoSoundDisabled = videoSoundDisabled == 1
		var videoLoop = $slide.attr('data-video_loop')
		var bVideoLoop = videoLoop == 1
		var videoCover = $slide.attr('data-video_cover')
		var bVideoCover = videoCover == 1 && !isMobile
		var videoUnderText = $slide.attr('data-video_under_text')
		var bVideoUnderText = videoUnderText == 1
		var videoPlayer = $slide.attr('data-video_player')
		var bVideoPlayerYoutube = videoPlayer === 'YOUTUBE'
		var bVideoPlayerVimeo = videoPlayer === 'VIMEO'
		var bVideoPlayerRutube = videoPlayer === 'RUTUBE'
		var bVideoPlayerHtml5 = videoPlayer === 'HTML5'

		if(videoPlayerSrc && !$slide.find('.video').length){

			var InitPlayer = function(){
				$slides.each(function(i, node){
					var $_slide = $(node);
					var videoID = getRandomInt(100, 1000);
					var bClone = $_slide.hasClass('clone'),
						tmp_class = $_slide.attr('id');
					if(!$_slide.find('.video.'+tmp_class).length)
					{

						if(bVideoPlayerYoutube){
							$_slide.prepend('<iframe id="player_' + videoID + '" class="video ' + tmp_class + (bVideoCover ? ' cover' : '') + '" src="'+ videoPlayerSrc +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
						}
						else if(bVideoPlayerVimeo){
							$_slide.prepend('<iframe id="player_' + videoID + '" class="video ' + tmp_class + (bVideoCover ? ' cover' : '') + '" src="'+ videoPlayerSrc +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
						}
						else if(bVideoPlayerRutube){
							videoPlayerSrc = videoPlayerSrc + '&playerid=' + videoID;
							$_slide.prepend('<iframe id="player_' + videoID + '" class="video ' + tmp_class + (bVideoCover ? ' cover' : '') + '" src="'+ videoPlayerSrc +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
						}
						else if(bVideoPlayerHtml5){
							$_slide.prepend('<video playsinline id="player_' + videoID + '" class="video ' + tmp_class + (bVideoCover ? ' cover' : '') + '"' + (bVideoLoop ? ' loop ' : '') + (bVideoSoundDisabled || bClone ? ' muted ' : '') + '><source src="'+ videoPlayerSrc +'" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p></iframe>');
						}
					}

					if(typeof(players) !== 'undefined' && players){
						players[videoID] = {
							id: 'player_' + videoID,
							mute: bVideoSoundDisabled || bClone,
							loop: bVideoLoop,
							cover: bVideoCover,
							videoPlayer: videoPlayer,
							slideIndex: slideActiveIndex,
							clone: bClone,
							playing: false
						};

						if(bVideoPlayerYoutube){
							window[players[videoID].id] = new YT.Player(
								players[videoID].id, {
									events: {
										'onReady': onYoutubePlayerReady,
										'onStateChange': onYoutubePlayerStateChange
									}
								}
							);
						}
						else if(bVideoPlayerVimeo){
						    window[players[videoID].id] = new Vimeo.Player(document.getElementById(players[videoID].id), {autopause: false, byline: false, loop: false, title: false});
						    window[players[videoID].id].on('loaded', onVimeoPlayerReady)
						    window[players[videoID].id].on('play', onVimeoPlayerStateChange)
						    window[players[videoID].id].on('pause', onVimeoPlayerStateChange)
						    window[players[videoID].id].on('ended', onVimeoPlayerStateChange)
						}
						else if(bVideoPlayerRutube){
							document.getElementById(players[videoID].id).onload = function(e){
								var videoID = this.id.replace('player_', '')
								players[videoID].contentWindow = this.contentWindow
								onRutubePlayerReady(videoID)
							}
						}
						else if(bVideoPlayerHtml5){
							document.getElementById(players[videoID].id).addEventListener('loadeddata', onHtml5PlayerReady)
							document.getElementById(players[videoID].id).addEventListener('play', onHtml5PlayerStateChange)
							document.getElementById(players[videoID].id).addEventListener('pause', onHtml5PlayerStateChange)
							document.getElementById(players[videoID].id).addEventListener('ended', onHtml5PlayerStateChange)
						}
					}
				});
			}

			if(!bVideoPlayerHtml5){
				var obPlayerVariable = ''
				var fnPlayerVariable = ''
				if(typeof window['YoutubePlayerScriptLoaded'] === 'undefined'){
					window['YoutubePlayerScriptLoaded'] = false
				}
				if(typeof window['VimeoPlayerScriptLoaded'] === 'undefined'){
					window['VimeoPlayerScriptLoaded'] = false
				}
				if(typeof window['RutubePlayerListnersAdded'] === 'undefined'){
					window['RutubePlayerListnersAdded'] = false
				}

				// load script
				if(bVideoPlayerYoutube){
					obPlayerVariable = 'YT'
					fnPlayerVariable = 'Player'
					if(!window['YoutubePlayerScriptLoaded']){
						var script = document.createElement('script');
						script.src = "https://www.youtube.com/iframe_api";
						var firstScriptTag = document.getElementsByTagName('script')[0];
						firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
						window['YoutubePlayerScriptLoaded'] = true;
					}
				}
				else if(bVideoPlayerVimeo){
					obPlayerVariable = 'Vimeo'
					if(!window['VimeoPlayerScriptLoaded']){
						var script = document.createElement('script');
						script.src = 'https://player.vimeo.com/api/player.js';
						(document.head || document.documentElement).appendChild(script);
						window['VimeoPlayerScriptLoaded'] = true
					}
				}
				else if(bVideoPlayerRutube){
					if(!window['RutubePlayerListnersAdded']){
						window.addEventListener('message', function(e){
							if(e.origin.indexOf('rutube.ru') !== -1){
							    var message = JSON.parse(e.data)
							    if(typeof message === 'object' && message){
							    	if(typeof message.type !== 'undefined' && message.type){
							    		var videoID = false

							    		for(var j in players){
									    	if(typeof players[j].contentWindow !== 'undefined'){
									    		if(players[j].contentWindow == e.source){
									    			videoID = j
									    			break
									    		}
									    	}
									    }

									    if(videoID){
										    switch (message.type) {
										        case 'player:changeState':
										            onRutubePlayerStateChange(videoID, message.data.state)
										            break
										        case 'player:currentTime':
										            onRutubePlayerCurrentTime(videoID, message.data.time)
										            break
										    }
										}
									}
							    }
							}
						});
					}
				}

				if(!obPlayerVariable.length){
					InitPlayer()
				}
				else{
					// wait player class
					if(typeof window[obPlayerVariable] === 'object'){
						if(!fnPlayerVariable.length || (fnPlayerVariable.length && typeof window[obPlayerVariable][fnPlayerVariable] === 'function')){

							InitPlayer()
						}
					}
					else{
						var waitPlayerInterval = setInterval(function(){
							if(typeof window[obPlayerVariable] === 'object'){
								if(!fnPlayerVariable.length || (fnPlayerVariable.length && typeof window[obPlayerVariable][fnPlayerVariable] === 'function')){

									clearInterval(waitPlayerInterval)

									InitPlayer()
								}
							}
						}, 50)
					}
				}

			}
			else{
				InitPlayer()
			}
		}
		else
		{
			// pause play video
			if(typeof(players) !== 'undefined' && players){
				for(var j in players){
					if(/*players[j].playing &&*/ !players[j].clone/* && (players[j].slideIndex != curSlideIndex)*/){
						if((typeof window[players[j].id] == 'object')){
							if(players[j].playing)
							{
								if(players[j].videoPlayer === 'YOUTUBE'){
									window[players[j].id].pauseVideo()
								}
								else if(players[j].videoPlayer === 'VIMEO'){
									window[players[j].id].pause()
								}
								else if(players[j].videoPlayer === 'RUTUBE'){
									document.getElementById(players[j].id).contentWindow.postMessage(JSON.stringify({
									    type: 'player:pause',
									    data: {}
									}), '*')
								}
								else if(players[j].videoPlayer === 'HTML5'){
									document.getElementById(players[j].id).pause()
								}
							}
							else if(players[j].slideIndex == slideActiveIndex)
							{
								if(players[j].videoPlayer === 'YOUTUBE'){
									window[players[j].id].playVideo()
								}
								else if(players[j].videoPlayer === 'VIMEO'){
									window[players[j].id].play()
								}
								else if(players[j].videoPlayer === 'RUTUBE'){
									document.getElementById(players[j].id).contentWindow.postMessage(JSON.stringify({
									    type: 'player:play',
									    data: {}
									}), '*')
								}
								else if(players[j].videoPlayer === 'HTML5'){
									document.getElementById(players[j].id).play()
								}
							}
						}
					}
				}
			}
		}
	}
}

var CoverPlayer = function(){
	var $videoCover = $('.video.cover')
	if($videoCover.length){
		var bannersHeight = $('.banners-big').height()
		var bannersWidth = $('.banners-big').width()
		var windowWidth = $(window).width()
		var height = windowWidth * 9 / 16
		$videoCover.css({'height': height + 'px', 'margin-top': ((bannersHeight - height) / 2) + 'px'})
	}
}

function onYoutubePlayerReady(e) {
	var videoID = e.target.a.id.replace('player_', '')
	if(videoID){
		var mute = players[videoID].mute
		var cover = players[videoID].cover
    	var clone = players[videoID].clone

    	// mute sound
		if(mute || clone){
			window[players[videoID].id].mute()
		}

    	// cover video
		if(cover){
	    	CoverPlayer()
	    }

    	// not start clone video playing
    	if(clone){
    		setTimeout(function(){
				e.target.pauseVideo()
    		}, 100)
    	}
    	else{
		    // stop slider
			pauseMainBanner()
			e.target.playVideo();

		    // e.target.playVideo();
		    // e.target.playVideo();
    	}

    	// update slide class
		var $slide = $('#player_' + videoID).closest('.item')
		$slide.addClass('started')
		// $slide.removeClass('loading')
    }
}

function onYoutubePlayerStateChange(e){
	var videoID = e.target.a.id.replace('player_', '')
    if(videoID){
    	var clone = players[videoID].clone
		var loop = players[videoID].loop
    	var slideIndex = players[videoID].slideIndex
    	if(!clone){
			if(e.data === YT.PlayerState.PLAYING){
				players[videoID].playing = true

				$('#player_'+videoID).closest('.item').find('.maxwidth-theme').addClass('loading');
				$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').addClass('loading');

				// stop slider
				pauseMainBanner()

				e.target.playVideo()
			}
			else if(e.data === YT.PlayerState.PAUSED){
		    	players[videoID].playing = false

		    	// sync time in cloned players & pause
	    		var time = Math.floor(window[players[videoID].id].getCurrentTime() * 10) / 10

				$('#player_'+videoID).closest('.item').find('.maxwidth-theme').removeClass('loading');
				$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').removeClass('loading');

				window[players[videoID].id].seekTo(time, true)
				for(var j in players){
					if(players[j].slideIndex == slideIndex && players[j].clone){

						if('getCurrentTime' in window[players[j].id])
						{
							window[players[j].id].pauseVideo()
							window[players[j].id].seekTo(time, true)
						}
					}
				}
			}
			else if(e.data === YT.PlayerState.ENDED){
				players[videoID].playing = false
		    	if(loop){
		    		e.target.playVideo()
		    	}
		    	else{
		    		// play slider
					playMainBanner()
		    	}
			}
		}
	}
}

function onVimeoPlayerReady(e){
	var videoID = this.element.id.replace('player_', '')
	if(videoID){
		var mute = players[videoID].mute
		var cover = players[videoID].cover
    	var clone = players[videoID].clone

    	// mute sound
		if(mute || clone){
			window[players[videoID].id].setVolume(0)
		}

    	// cover video
		if(cover){
	    	CoverPlayer()
	    }

    	// not start clone video playing
    	if(clone){
    		setTimeout(function(){
				window[players[videoID].id].pause()
    		}, 100)
    	}
    	else{
		    // stop slider
			pauseMainBanner()

		    window[players[videoID].id].play()
    	}

    	// update slide class
		var $slide = $('#player_' + videoID).closest('.item')
		$slide.addClass('started')
		// $slide.removeClass('loading')
    }
}

function onVimeoPlayerStateChange(e){
	var videoID = this.element.id.replace('player_', '')
	if(videoID){
		var cover = players[videoID].cover
    	var clone = players[videoID].clone
		var loop = players[videoID].loop
    	var slideIndex = players[videoID].slideIndex

    	if(!clone){
    		window[players[videoID].id].getPaused().then(function(paused){
    			if(paused){
			    	players[videoID].playing = false

			    	$('#player_'+videoID).closest('.item').find('.maxwidth-theme').removeClass('loading');
					$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').removeClass('loading');

			    	// sync time in cloned players & pause
			    	window[players[videoID].id].getCurrentTime().then(function(seconds){
			    		var time = Math.floor(seconds * 10) / 10
			    		window[players[videoID].id].setCurrentTime(time).then(function(seconds){
							for(var j in players){
								if(players[j].slideIndex == slideIndex && players[j].clone){
									window[players[j].id].pause()
									window[players[j].id].setCurrentTime(time).then(function(seconds){})
								}
							}
			    		})
			    	})
    			}
    			else{
    				$('#player_'+videoID).closest('.item').find('.maxwidth-theme').addClass('loading');
					$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').addClass('loading');
		    		window[players[videoID].id].getEnded().then(function(ended){
		    			if(ended){
							players[videoID].playing = false
					    	if(loop){
					    		window[players[videoID].id].play()
					    	}
					    	else{
					    		// play slider
								playMainBanner()
					    	}
		    			}
		    			else{
		    				players[videoID].playing = true


		    				// stop slider
							pauseMainBanner()
		    			}
		    		})
    			}
    		})
		}
	}
}

function onRutubePlayerReady(videoID){
	if(videoID){
		var mute = players[videoID].mute
		var cover = players[videoID].cover
    	var clone = players[videoID].clone
    	var player = document.getElementById(players[videoID].id)

    	// mute sound
		if(mute || clone){
			player.contentWindow.postMessage(JSON.stringify({
			    type: 'player:mute',
			    data: {}
			}), '*')
		}

    	// cover video
		if(cover){
	    	CoverPlayer()
	    }

    	// not start clone video playing
    	if(clone){
    		setTimeout(function(){
				player.contentWindow.postMessage(JSON.stringify({
				    type: 'player:pause',
				    data: {}
				}), '*')
    		}, 100)
    	}
    	else{
		    // stop slider
			pauseMainBanner()

		    player.contentWindow.postMessage(JSON.stringify({
			    type: 'player:play',
			    data: {}
			}), '*')
    	}

    	// update slide class
		var $slide = $('#player_' + videoID).closest('.item')
		$slide.addClass('started')
		// $slide.removeClass('loading')
    }
}

function onRutubePlayerCurrentTime(videoID, time){
	if(videoID){
		players[videoID].time = time
	}
}

function onRutubePlayerStateChange(videoID, state){
	if(videoID){
    	var clone = players[videoID].clone
		var loop = players[videoID].loop
    	var slideIndex = players[videoID].slideIndex
    	var player = document.getElementById(players[videoID].id)

    	if(!clone){
			if(state === 'playing'){
				$('#'+videoID).closest('.item').find('.maxwidth-theme').addClass('loading');
				$('#'+videoID).closest('.item').find('.maxwidth-theme .btn-video').addClass('loading');

				players[videoID].playing = true

				// stop slider
				pauseMainBanner()
			}
			else if(state === 'paused'){
				$('#'+videoID).closest('.item').find('.maxwidth-theme').removeClass('loading');
				$('#'+videoID).closest('.item').find('.maxwidth-theme .btn-video').removeClass('loading');

		    	players[videoID].playing = false

		    	// sync time in cloned players & pause
	    		var time = Math.floor(players[videoID].time * 10) / 10
				player.contentWindow.postMessage(JSON.stringify({
				    type: 'player:setCurrentTime',
				    data: {time: time}
				}), '*')
				for(var j in players){
					if(players[j].slideIndex == slideIndex && players[j].clone){
						document.getElementById(players[j].id).contentWindow.postMessage(JSON.stringify({
						    type: 'player:pause',
						    data: {}
						}), '*')
						document.getElementById(players[j].id).contentWindow.postMessage(JSON.stringify({
						    type: 'player:setCurrentTime',
						    data: {time: time}
						}), '*')
					}
				}
			}
			else if(state === 'stopped'){
				$('#'+videoID).closest('.item').find('.maxwidth-theme').removeClass('loading');
				$('#'+videoID).closest('.item').find('.maxwidth-theme .btn-video').removeClass('loading');

				players[videoID].playing = false
		    	if(loop){
		    		player.contentWindow.postMessage(JSON.stringify({
					    type: 'player:play',
					    data: {}
					}), '*')
		    	}
		    	else{
		    		// play slider
					playMainBanner()
		    	}
			}
		}
	}
}

function onHtml5PlayerReady(e){
	var videoID = e.target.id.replace('player_', '')
	if(videoID){
		var mute = players[videoID].mute
		var cover = players[videoID].cover
    	var clone = players[videoID].clone

    	// mute sound
		if(mute || clone){
			$('#' + players[videoID].id).prop('muted', true);
		}

    	// cover video
		if(cover){
	    	CoverPlayer()
	    }

    	// not start clone video playing
    	if(clone){
    		e.target.pause()
    	}
    	else{
		    // stop slider
			pauseMainBanner()

		    e.target.play()
    	}

    	// update slide class
		var $slide = $('#player_' + videoID).closest('.item')
		$slide.addClass('started')
		// $slide.removeClass('loading')
    }
}

function onHtml5PlayerStateChange(e){
	var videoID = e.target.id.replace('player_', '')
	if(videoID){
    	var cover = players[videoID].cover
    	var clone = players[videoID].clone
		var loop = players[videoID].loop
    	var slideIndex = players[videoID].slideIndex

    	if(!clone){
			if(e.target.paused){
		    	players[videoID].playing = false

		    	$('#player_'+videoID).closest('.item').find('.maxwidth-theme').removeClass('loading');
				$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').removeClass('loading');

		    	// sync time in cloned players & pause
	    		var time = Math.floor(e.target.currentTime * 10) / 10
				e.target.currentTime = time
				for(var j in players){
					if(players[j].slideIndex == slideIndex && players[j].clone){
						document.getElementById(players[j].id).pause()
						document.getElementById(players[j].id).currentTime = time
					}
				}
			}
			else if(e.target.ended){
				players[videoID].playing = false
		    	if(loop){
		    		$('#player_'+videoID).closest('.item').find('.maxwidth-theme').addClass('loading');
					$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').addClass('loading');

		    		e.target.play()
		    	}
		    	else{
		    		// play slider
					playMainBanner()
		    	}
			}
			else{
				players[videoID].playing = true

				$('#player_'+videoID).closest('.item').find('.maxwidth-theme').addClass('loading');
				$('#player_'+videoID).closest('.item').find('.maxwidth-theme .btn-video').addClass('loading');
				// stop slider
				pauseMainBanner()
			}
		}
	}
}

$.fn.equalizeHeights = function( outer, classNull, minHeight, autoHeightBlock ){
	var maxHeight = this.map( function( i, e ){
		var minus_height=0,
			calc_height=0;
		if(classNull !== false && $(e).find(classNull).is(':visible'))
			minus_height=parseInt($(e).find(classNull).actual('outerHeight'));
		if(minus_height)
			minus_height+=15;
		$(e).css('height', '');
		if(autoHeightBlock !== false)
		{
			var height_tmp = $(e).find(autoHeightBlock).css('height');
			$(e).find(autoHeightBlock).css('height', '');
		}
		if( outer == true ){
			calc_height=$(e).actual('outerHeight')-minus_height;
		}else{
			calc_height=$(e).actual('height')-minus_height;
		}

		if(autoHeightBlock !== false)
		{
			$(e).find(autoHeightBlock).css('height', height_tmp);
		}
		if(minHeight!==false){
			if(calc_height<minHeight){
				calc_height+=(minHeight-calc_height);
			}
			if(window.matchMedia('(max-width: 520px)').matches){
				calc_height=300;
			}
			if(window.matchMedia('(max-width: 400px)').matches){
				calc_height=200;
			}
		}
		return calc_height;
	}).get();

	for(var i = 0, c = maxHeight.length; i < c; ++i){
		if(maxHeight[i] % 2){
			--maxHeight[i];
		}
	}

	return this.height( Math.max.apply( this, maxHeight ) );
}

$.fn.getFloatWidth = function(){
	var width = 0

	if($(this).length){
		var rect = $(this)[0].getBoundingClientRect()
		if(!(width = rect.width)){
			width = rect.right - rect.left
		}
	}

	return width
}

$.fn.sliceHeight = function( options ){
	function _slice(el){
		el.each(function() {
			$(this).css('line-height', '');
			$(this).css('height', '');
		});
		if(typeof(options.autoslicecount) == 'undefined' || options.autoslicecount !== false){
			var elsw=(typeof(options.row) !== 'undefined' && options.row.length) ?  el.first().parents(options.row).getFloatWidth() : el.first().parents('.items').getFloatWidth(),
				elw=(typeof(options.item) !== 'undefined' && options.item.length) ? $(options.item).first().getFloatWidth() : (el.first().hasClass('item') ? el.first().getFloatWidth() : el.first().parents('.item').getFloatWidth());

			if(!elsw){
				elsw = el.first().parents('.row').getFloatWidth();
			}
			if(elw && options.fixWidth)
				elw -= options.fixWidth;

			if(elsw && elw){
				options.slice = Math.floor(elsw / elw);
			}
		}
		if(typeof(options.typeResize) == 'undefined' || options.typeResize == false)
		{
			if(options.sliceEqualLength && el.closest('.flexslider').length)
				options.slice = el.length;
			if(options.slice){
				for(var i = 0; i < el.length; i += options.slice){
					$(el.slice(i, i + options.slice)).equalizeHeights(options.outer, options.classNull, options.minHeight, options.autoHeightBlock);
				}
			}
			if(options.lineheight){
				var lineheightAdd = parseInt(options.lineheight);
				if(isNaN(lineheightAdd)){
					lineheightAdd = 0;
				}
				el.each(function() {
					$(this).css('line-height', ($(this).actual('height') + lineheightAdd) + 'px');
				});
			}
		}

		if(typeof options.callback == 'function')
			options.callback(el);
	}
	var options = $.extend({
		slice: null,
		outer: false,
		lineheight: false,
		autoslicecount: true,
		classNull: false,
		minHeight: false,
		row:false,
		item:false,
		typeResize:false,
		resize:true,
		typeValue:false,
		sliceEqualLength:false,
		fixWidth:0,
		callback:false,
		autoHeightBlock:false,
	}, options);

	var el = $(this);
	ignoreResize.push(true);
	_slice(el);
	ignoreResize.pop();

	if(options.resize != false)
	{
		BX.addCustomEvent('onWindowResize', function(eventdata) {
			ignoreResize.push(true);
			_slice(el);
			ignoreResize.pop();
		});
	}
}

waitingExists = function(selector, delay, callback){
	if(typeof(callback) !== 'undefined' && selector.length && delay > 0){
		delay = parseInt(delay);
		delay = (delay < 0 ? 0 : delay);

		if(!$(selector).length){
			setTimeout(function(){
				waitingExists(selector, delay, callback);
			}, delay);
		}
		else{
			callback();
		}
	}
}

waitingNotExists = function(selectorExists, selectorNotExists, delay, callback){
	if(typeof(callback) !== 'undefined' && selectorExists.length && selectorNotExists.length && delay > 0){
		delay = parseInt(delay);
		delay = (delay < 0 ? 0 : delay);

		setTimeout(function(){
			if(selectorExists.length && !$(selectorNotExists).length){
				callback();
			}
		}, delay);
	}
}

function onLoadjqm(hash){
	var name = $(hash.t).data('name'),
		top = (($(window).height() > hash.w.height()) ? Math.floor(($(window).height() - hash.w.height()) / 2) : 0) + 'px';
	$.each($(hash.t).get(0).attributes, function(index, attr){
		if(/^data\-autoload\-(.+)$/.test(attr.nodeName)){
			var key = attr.nodeName.match(/^data\-autoload\-(.+)$/)[1];
			var el = $('input[name="'+key.toUpperCase()+'"]');
			if(!el.length) //is form block
				el = $('input[data-sid="'+key.toUpperCase()+'"]');

			var value = $(hash.t).data('autoload-'+key);
			value = value.replace(/%99/g, '\\'); // replace symbol \

			el.val(BX.util.htmlspecialcharsback(value)).attr('readonly', 'readonly');
			el.closest('.form-group').addClass('input-filed');
			el.attr('title', el.val());
		}
	});

	var eventdata = {action:'loadForm'};
	BX.onCustomEvent('onCompleteAction', [eventdata, $(hash.t)[0]]);

	if($(hash.t).data('autohide')){
		$(hash.w).data('autohide', $(hash.t).data('autohide'));
	}
	if(name == 'order_product'){
		if($(hash.t).data('product')) {
			$('input[name="PRODUCT"]').closest('.form-group').addClass('input-filed');
			$('input[name="PRODUCT"]').val($(hash.t).data('product')).attr('readonly', 'readonly').attr('title', $('input[name="PRODUCT"]').val());
		}
	}
	if(name == 'question'){
		if($(hash.t).data('product')) {
			$('input[name="NEED_PRODUCT"]').closest('.form-group').addClass('input-filed');
			$('input[name="NEED_PRODUCT"]').val($(hash.t).data('product')).attr('readonly', 'readonly').attr('title', $('input[name="NEED_PRODUCT"]').val());
		}
	}

	if(arAllcorp2Options['THEME']['REGIONALITY_SEARCH_ROW'] == 'Y' && (hash.w.hasClass('city_chooser_frame ') || hash.w.hasClass('city_chooser_small_frame')))
		hash.w.addClass('small_popup_regions')

	hash.w.addClass('show').css({'margin-left': '-' + Math.floor(hash.w.width() / 2) + 'px', 'top': top, 'opacity': 1});
}

function onHide(hash){
	if($(hash.w).data('autohide')){
		eval($(hash.w).data('autohide'));
	}
	// hash.w.css('opacity', 0).hide();
	hash.w.animate({'opacity': 0}, 200, function(){
		hash.w.hide();
		hash.w.empty();
		hash.o.remove();
		hash.w.removeClass('show');
	});
}

function parseUrlQuery() {
	var data = {};
	if(location.search) {
		var pair = (location.search.substr(1)).split('&');
		for(var i = 0; i < pair.length; i ++) {
			var param = pair[i].split('=');
			data[param[0]] = param[1];
		}
	}
	return data;
}

function scroll_block(block){
	if(block.length)
	{
		var topPos = block.offset().top,
			headerH = $('header').outerHeight(true,true);
		if($(".stores_tab").length){
			$(".stores_tab").addClass("active").siblings().removeClass("active");
		}else{
			$(".prices_tab").addClass("active").siblings().removeClass("active");
			if($(".prices_tab .opener").length && !$(".prices_tab .opener .opened").length){
				var item = $(".prices_tab .opener").first();
				item.find(".opener_icon").addClass("opened");
				item.parents("tr").addClass("nb")
				item.parents("tr").next(".offer_stores").find(".stores_block_wrap").slideDown(200);
			}
		}
		$('html,body').animate({'scrollTop':topPos-80},150);
	}
}

$.fn.jqmEx = function(){
	$(this).each(function(){
		var _this = $(this);
		var name = _this.data('name');

		if(name.length){
			var script = arAllcorp2Options['SITE_DIR'] + 'ajax/form.php';
			var paramsStr = ''; var trigger = ''; var arTriggerAttrs = {};
			$.each(_this.get(0).attributes, function(index, attr){
				var attrName = attr.nodeName;
				var attrValue = _this.attr(attrName);
				trigger += '[' + attrName + '=\"' + attrValue + '\"]';
				arTriggerAttrs[attrName] = attrValue;
				if(/^data\-param\-(.+)$/.test(attrName)){
					var key = attrName.match(/^data\-param\-(.+)$/)[1];
					paramsStr += key + '=' + attrValue + '&';
				}
			});
			var triggerAttrs = JSON.stringify(arTriggerAttrs);
			var encTriggerAttrs = encodeURIComponent(triggerAttrs);
			if(name == 'auth')
				script += '?' + paramsStr + 'auth=Y';
			else
				script += '?' + paramsStr + 'data-trigger=' + encTriggerAttrs;

			if(!$('.' + name + '_frame[data-trigger="' + encTriggerAttrs + '"]').length){
				if(_this.attr('disabled') != 'disabled'){
					$('body').find('.' + name + '_frame[data-trigger="' + encTriggerAttrs + '"]').remove();
					$('body').append('<div class="' + name + '_frame jqmWindow" style="width:500px" data-trigger="' + encTriggerAttrs + '"></div>');
					$('.' + name + '_frame[data-trigger="' + encTriggerAttrs + '"]').jqm({trigger: trigger, onLoad: function(hash){onLoadjqm(hash);}, onHide: function(hash){onHide(hash);}, ajax:script});
				}
			}
		}
		return;
	});
}

InitFlexSlider = function() {
	$('.flexslider:not(.thmb):not(.flexslider-init):visible').each(function(){
		var slider = $(this);
		var options;
		var defaults = {
			animationLoop: false,
			controlNav: false,
			directionNav: true,
			animation: "slide"
		}
		var config = $.extend({}, defaults, options, slider.data('plugin-options'));
		if(typeof(config.counts) != 'undefined' && config.direction !== 'vertical'){
			var slide_counts = '';
			if(typeof(slider.data('plugin-options')) != 'undefined')
			{
				if('slide_counts' in slider.data('plugin-options'))
					slide_counts = slider.data('plugin-options').slide_counts;
			}
			config.maxItems =  getGridSize(config.counts);
			config.minItems = getGridSize(config.counts);

			if(slide_counts)
				config.move = slide_counts;
			else
				config.move = getGridSize(config.counts);

			config.itemWidth = 200;
		}

		// custom direction nav
		if(typeof(config.customDirection) != 'undefined')
			config.customDirectionNav = $(config.customDirection);

		config.prevText = BX.message("FANCY_PREV"),           //String: Set the text for the "previous" directionNav item
		config.nextText = BX.message("FANCY_NEXT"),

		config.after = config.start = function(slider){
			var eventdata = {slider: slider};
			BX.onCustomEvent('onSlide', [eventdata]);
		}

		config.before = function(slider){
			var eventdata = {slider: slider};
			BX.onCustomEvent('onSlideBefore', [eventdata]);
		}

		config.end = function(slider){
			var eventdata = {slider: slider};
			BX.onCustomEvent('onSlideEnd', [eventdata]);
		}

		/*if(typeof(config.nav) == 'undefined')
			slider.addClass('dark-nav');*/
		slider.flexslider(config).addClass('flexslider-init');
		if(config.controlNav)
			slider.addClass('flexslider-control-nav');
		if(config.directionNav)
			slider.addClass('flexslider-direction-nav');
	});
}

InitFlexSliderClass = function(class_name) {
	//$('.flexslider:not(.thmb):not(.flexslider-init)').each(function(){

		var slider = $(class_name);
		var options;
		var defaults = {
			animationLoop: false,
			controlNav: false,
			directionNav: true,
			animation: "slide"
		}
		var config = $.extend({}, defaults, options, slider.data('plugin-options'));

		var slide_counts = '';
		if(typeof(slider.data('plugin-options')) != 'undefined')
		{
			if('slide_counts' in slider.data('plugin-options'))
				slide_counts = slider.data('plugin-options').slide_counts;
		}

		if(typeof(config.counts) != 'undefined' && config.direction !== 'vertical'){
			config.maxItems =  getGridSize(config.counts);
			config.minItems = getGridSize(config.counts);
			config.move = getGridSize(config.counts);

			config.itemWidth = 200;
		}
		if(slide_counts)
			config.move = slide_counts;

		// custom direction nav
		if(typeof(config.customDirection) != 'undefined')
			config.customDirectionNav = $(config.customDirection);

		config.prevText = BX.message("FANCY_PREV"),           //String: Set the text for the "previous" directionNav item
		config.nextText = BX.message("FANCY_NEXT"),

		config.after = config.start = function(slider){
			var eventdata = {slider: slider};
			BX.onCustomEvent('onSlide', [eventdata]);
		}

		config.before = function(slider){
			var eventdata = {slider: slider};
			BX.onCustomEvent('onSlideBefore', [eventdata]);
		}

		config.end = function(slider){
			var eventdata = {slider: slider};
			BX.onCustomEvent('onSlideEnd', [eventdata]);
		}

		slider.flexslider(config).addClass('flexslider-init');
		if(config.controlNav)
			slider.addClass('flexslider-control-nav');
		if(config.directionNav)
			slider.addClass('flexslider-direction-nav');
	//});
}

InitFlexSliderMin = function() {
    $(".bxSlider.top-small").on('mousedown', '.slides li', function(){
            var index = $(this).data('slide_key');
            $(this).siblings().removeClass('flex-active-slide');
            $(this).addClass('flex-active-slide');
            $(this).siblings('[data-slide_key="'+index+'"]').addClass('flex-active-slide');
            $('.top-bigs').data('flexslider').flexAnimate(index);
    })
}

SliceHeightBlocks = function(){
	$('*[data-slice="Y"]').each(function(){
		var slice_els = $(this).find('*[data-slice-block="Y"]');
		if(slice_els.length)
		{
			var slice_params = {};
			if(slice_els.data('slice-params'))
				slice_params = slice_els.data('slice-params');
			slice_els.sliceHeight(slice_params);
		}
	})
}

createTableCompare = function(originalTable, appendDiv, cloneTable){
	try{
		if($('.tarifs .head-block:visible').length){
			var clone = originalTable.clone().addClass('clone');
			if(cloneTable.length){
				cloneTable.remove();
				appendDiv.html('');
				appendDiv.html(clone);
			}else{
				appendDiv.append(clone);
			}
		}
	}
	catch(e){}
	finally{}
}


InitTopestMenuGummi = function(){
	if(!isOnceInited){
		function _init(){
			var arItems = $menuTopest.find('>li:not(.more)');
			var cntItems = arItems.length;
			if(cntItems){
				var itemsWidth = 0;
				for(var i = 0; i < cntItems; ++i){
					var item = arItems.eq(i);
					var itemWidth = item.actual('outerWidth',{includeMargin: true});
					arItemsHideWidth[i] = (itemsWidth += itemWidth) + (i !== (cntItems - 1) ? moreWidth : 0);
				}
			}
		}

		function _gummi(){
			var rowWidth = $menuTopest.actual('innerWidth');
			var arItems = $menuTopest.find('>li:not(.more),li.more>.dropdown>li');
			var cntItems = arItems.length;
			if(cntItems){
				var bMore = false;
				for(var i = cntItems - 1; i >= 0; --i){
					var item = arItems.eq(i);
					var bInMore = item.parents('.more').length > 0;
					if(!bInMore){
						if(arItemsHideWidth[i] > rowWidth){
							if(!bMore){
								bMore = true;
								more.removeClass('hidden');
							}
							var clone = item.clone();
							clone.find('>a').addClass('dark_font');
							clone.prependTo(moreDropdown);
							item.addClass('cloned');
						}
					}
				}
				for(var i = 0; i < cntItems; ++i){
					var item = arItems.eq(i);
					var bInMore = item.parents('.more').length > 0;
					if(bInMore){
						if(arItemsHideWidth[i] <= rowWidth){
							if(i === (cntItems - 1)){
								bMore = false;
								more.addClass('hidden');
							}
							var clone = item.clone();
							clone.find('>a').removeClass('dark_font');
							clone.insertBefore(more);
							item.addClass('cloned');
						}
					}
				}
				$menuTopest.find('li.cloned').remove();
			}
		}

		var $menuTopest = $('.menu.topest');
		if($menuTopest.length)
		{
			var more = $menuTopest.find('>.more');
			var moreDropdown = more.find('>.dropdown');
			var moreWidth = more.actual('outerWidth',{includeMargin: true});
			var arItemsHideWidth = [];

			ignoreResize.push(true);
			_init();
			_gummi();
			ignoreResize.pop();

			BX.addCustomEvent('onWindowResize', function(eventdata) {
				try{
					ignoreResize.push(true);
					_gummi();
				}
				catch(e){}
				finally{
					ignoreResize.pop();
				}
			});
		}
	}
}

CheckHeaderFixedMenu = function(){
	if(arAllcorp2Options['THEME']['HEADER_FIXED'] == 2 && $('#headerfixed .js-nav').length && window.matchMedia('(min-width: 992px)').matches)
	{
		$('#headerfixed .js-nav').css('width','0');
		var all_width = 0,
			cont_width = $('#headerfixed .maxwidth-theme').actual('width'),
			padding_menu = $('#headerfixed .logo-row.v2 .menu-block').actual('outerWidth')-$('#headerfixed .logo-row.v2 .menu-block').actual('width');
		$('#headerfixed .logo-row.v2 > .inner-table-block').each(function(){
			if(!$(this).hasClass('menu-block'))
				all_width += $(this).actual('outerWidth');
		})
		$('#headerfixed .js-nav').width(cont_width-all_width-padding_menu);
	}
}

CheckTopMenuPadding = function(){
	if($('.logo_and_menu-row .right-icons .wrap_icon').length && $('.logo_and_menu-row .menu-row').length){
		var menuPosition = $('.menu-row .menu-only').position().left,
			maxWidth = $('.logo_and_menu-row .maxwidth-theme').width() - 32,
			leftPadding = 0,
			rightPadding = 0;

		$('.logo_and_menu-row .menu-row>div').each(function(indx){
			if(!$(this).hasClass('menu-only')){
				var elementPosition = $(this).position().left,
					elementWidth = $(this).outerWidth();

				if(elementPosition > menuPosition){
					rightPadding += elementWidth;
				}else{
					leftPadding += elementWidth;
				}
			}
		}).promise().done(function(){
			$('.logo_and_menu-row .menu-only').css({'padding-left': leftPadding, 'padding-right': rightPadding+1});
		});
	}
}

CheckTopMenuOncePadding = function(){
	if($('.menu-row.sliced .right-icons .wrap_icon').length){
		var menuPosition = $('.menu-row .menu-only').position().left,
			maxWidth = $('.logo_and_menu-row .maxwidth-theme').width() - 32,
			leftPadding = 0,
			rightPadding = 0;

		$('.menu-row.sliced .maxwidth-theme>div>div').each(function(indx){
			if(!$(this).hasClass('menu-only')){
				var elementPosition = $(this).position().left,
					elementWidth = $(this).outerWidth();

				if(elementPosition > menuPosition){
					rightPadding += elementWidth;
				}else{
					leftPadding += elementWidth;
				}
			}
		}).promise().done(function(){
			$('.menu-row.sliced .menu-only').css({'padding-left': leftPadding, 'padding-right': rightPadding+1});
		});
	}
}

CheckSearchWidth = function(){
	if($('.logo_and_menu-row .search_wrap').length){
		var searchPosition = $('.logo_and_menu-row .search_wrap').position().left,
			maxWidth = $('.logo_and_menu-row .maxwidth-theme').width() - 32;
			width = 0;

		$('.logo_and_menu-row .maxwidth-theme>div').each(function(){
			if(!$(this).hasClass('search_wrap')){
				var elementWidth = $(this).outerWidth();

				width = (width ? width - elementWidth : maxWidth - elementWidth);
			}
		}).promise().done(function(){
			$('.logo_and_menu-row .search_wrap').outerWidth(width).css({'opacity': 1, 'visibility': 'visible'});
		});
	}
}

waitCounter = function(idCounter, delay, callback){
	var obCounter = window['yaCounter' + idCounter];
	if(typeof obCounter == 'object')
	{
		if(typeof callback == 'function')
			callback();

	}
	else
	{
		setTimeout(function(){
			waitCounter(idCounter, delay, callback);
		}, delay);
	}
}

var waitReCaptcha = function(delay, callback){
	if(typeof grecaptcha == 'object'){
		if(typeof callback == 'function'){
			callback();
		}
	}
	else{
		setTimeout(function(){
			waitReCaptcha(delay, callback);
		}, delay);
	}
}

var reCaptchaRender = function(response){
	if($('.g-recaptcha:not(.rendered)').length){
		waitReCaptcha(50, function(){
			$('.g-recaptcha:not(.rendered)').each(function(){
				$this = $(this);
				$this.addClass('rendered')
				var id = grecaptcha.render($this[0], {
					sitekey: $this.attr('data-sitekey'),
					theme: $this.attr('data-theme'),
					size: $this.attr('data-size'),
					callback: $this.attr('data-callback'),
				});
				$this.attr('data-widgetid', id);
			});
		});
	}
}

var reCaptchaVerify = function(response){
	$('.g-recaptcha.rendered').each(function(){
		var id = $(this).attr('data-widgetid');
		if(typeof(id) !== 'undefined'){
			if(grecaptcha.getResponse(id) != ''){
				$(this).closest('form').find('.recaptcha').valid();
			}
		}
	});
}

var reCaptchaVerifyHidden = function(response){
	$('.g-recaptcha.rendered:last').each(function(){
		var id = $(this).attr('data-widgetid');
		if(typeof(id) !== 'undefined' && response){
			if(!$(this).closest('form').find('.g-recaptcha-response').val())
				$(this).closest('form').find('.g-recaptcha-response').val(response)
			$(this).closest('form').submit();
		}
	});
}

waitYTPlayer = function(delay, callback){
	if((typeof YT !== "undefined") && YT && YT.Player)
	{
		if(typeof callback == 'function')
			callback();
	}
	else
	{
		setTimeout(function(){
			waitYTPlayer(delay, callback);
		}, delay);
	}
}

var scrollToTopAnimateClassIn = false;
var scrollToTopAnimateClassOut = false;

var $body = {}
var $scrolltotop = {}
var isOnceInited = false;

if(navigator.userAgent.indexOf("Edge") != -1)
	document.documentElement.className += ' edge';

initFull = function(){
	checkMobileRegion();
}

var isFrameDataReceived = false;
if (typeof window.frameCacheVars !== "undefined"){
	BX.addCustomEvent("onFrameDataReceived", function (json){
		initFull();

		isFrameDataReceived = true;
	});
}else{
	$( document ).ready(initFull);
}


checkMobileRegion = function(){
	if($('.confirm_region').length)
	{
		if(!$('.top_mobile_region').length)
			$('<div class="top_mobile_region"><div class="confirm_region"></div><div class="close_popup"></div></div>').insertBefore($('#mobileheader'));
		$('.top_mobile_region .confirm_region').html($('.confirm_region').html());

		$('.top_mobile_region .close_popup').click(function(){
			$(this).remove();
			$('.confirm_region').remove();
		})
	}
}

$(document).ready(function(){
	scrollToTop();
	CheckStickyFooter();

	if(!jQuery.browser.safari){
		CheckTopMenuPadding();
		CheckTopMenuOncePadding();
		CheckHeaderFixed();
		CheckTopMenuDotted();
		MegaMenuFixed();
		CheckSearchWidth();
		InitTopestMenuGummi();
		isOnceInited = true;

		setTimeout(function() {
			$(window).resize(); // need to check resize flexslider & menu
		}, 350);

		setTimeout(function() {$(window).scroll();}, 250); // need to check position fixed ask block
	}
	else{
		setTimeout(function() {
			$(window).resize(); // need to check resize flexslider & menu
			setTimeout(function(){
				CheckTopMenuPadding();
				CheckTopMenuOncePadding();
				CheckHeaderFixed();
				CheckTopMenuDotted();
				MegaMenuFixed();
				CheckSearchWidth();
				InitTopestMenuGummi();
				isOnceInited = true;
				setTimeout(function(){
					$(window).scroll();
				}, 50);
			}, 50);
		}, 350);
	}

	if(arAllcorp2Options['THEME']['USE_DEBUG_GOALS'] === 'Y'){
		$.cookie('_ym_debug', '1');
	}
	else{
		$.cookie('_ym_debug', null);
	}

	/*  --- Bind mobile menu  --- */
	var $mobileMenu = $("#mobilemenu")
	if($mobileMenu.length){
		$mobileMenu.isLeftSide = $mobileMenu.hasClass('leftside')
		$mobileMenu.isOpen = $mobileMenu.hasClass('show')
		$mobileMenu.isDowndrop = $mobileMenu.find('>.scroller').hasClass('downdrop')

		$('#mobileheader .burger').click(function(){
			SwipeMobileMenu();
			CloseMobilePhone();
		})

		if($mobileMenu.isLeftSide){
			$mobileMenu.parent().append('<div id="mobilemenu-overlay"></div>')
			var $mobileMenuOverlay = $('#mobilemenu-overlay')

			$mobileMenuOverlay.click(function(){
				if($mobileMenu.isOpen){
					CloseMobileMenu()
				}
			});

			$(document).swiperight(function(e) {
				if(!$(e.target).closest('.flexslider').length && !$(e.target).closest('.swipeignore').length){
					OpenMobileMenu()
				}
			});

			$(document).swipeleft(function(e) {
				if(!$(e.target).closest('.flexslider').length && !$(e.target).closest('.swipeignore').length){
					CloseMobileMenu()
				}
			});
		}
		else{
			$('#mobileheader').click(function(e){
				if(!$(e.target).closest('#mobilemenu').length && !$(e.target).closest('.burger').length && $mobileMenu.isOpen){
					CloseMobileMenu()
				}
			});
		}

		$('#mobilemenu .menu a,#mobilemenu .social-icons a').click(function(e){
			var $this = $(this)
			if($this.hasClass('parent')){
				e.preventDefault()

				if(!$mobileMenu.isDowndrop){
					$this.closest('li').addClass('expanded')
					MoveMobileMenuWrapNext()
				}
				else{
					if(!$this.closest('li').hasClass('expanded')){
						$this.closest('li').addClass('expanded')
					}
					else{
						$this.closest('li').removeClass('expanded')
					}
				}
			}
			else{
				if($this.closest('li').hasClass('counters')){
					var href = $this.attr('href')
					if(typeof href !== 'undefined'){
						window.location.href = href
						window.location.reload()
					}
				}

				if(!$this.closest('.menu_back').length){
					CloseMobileMenu()
				}
			}
		})

		$('#mobilemenu .dropdown .menu_back').click(function(e){
			e.preventDefault()
			var $this = $(this)
			MoveMobileMenuWrapPrev()
			setTimeout(function(){
				$this.closest('.expanded').removeClass('expanded')
			}, 400)
		})

		OpenMobileMenu = function(){
			if(!$mobileMenu.isOpen){
				// hide styleswitcher
				if($('.style-switcher').hasClass('active')){
					$('.style-switcher .switch').trigger('click')
				}
				$('.style-switcher .switch').hide();
				$('.style-switcher .switch_presets').hide();

				if($mobileMenu.isLeftSide){
					// show overlay
					setTimeout(function(){
						$mobileMenuOverlay.fadeIn('fast')
					}, 100)
				}
				else{
					// scroll body to top & set fixed
					$('body').scrollTop(0).css({position: 'fixed'})

					// set menu top = bottom of header
					$mobileMenu.css({top: + ($('#mobileheader').height() + $('#mobileheader').offset().top) + 'px'})

					// change burger icon
					$('#mobileheader .burger').addClass('c')
				}

				// show menu
				$mobileMenu.addClass('show')
				$mobileMenu.isOpen = true

				if(!$mobileMenu.isDowndrop){
					var $wrap = $mobileMenu.find('.wrap').first()
					var params =  $wrap.data('params')
					if(typeof params === 'undefined'){
						params = {
							depth: 0,
							scroll: {},
							height: {}
						}
					}
					$wrap.data('params', params)
				}
			}
		}

		CloseMobileMenu = function(){
			if($mobileMenu.isOpen){
				// hide menu
				$mobileMenu.removeClass('show')
				$mobileMenu.isOpen = false

				// show styleswitcher
				$('.style-switcher .switch').show();
				$('.style-switcher .switch_presets').show();

				if($mobileMenu.isLeftSide){
					// hide overlay
					setTimeout(function(){
						$mobileMenuOverlay.fadeOut('fast')
					}, 100)
				}
				else{
					// change burger icon
					$('#mobileheader .burger').removeClass('c')

					// body unset fixed
					$('body').css({position: ''})
				}

				if(!$mobileMenu.isDowndrop){
					setTimeout(function(){
						var $scroller = $mobileMenu.find('.scroller').first()
						var $wrap = $mobileMenu.find('.wrap').first()
						var params =  $wrap.data('params')
						params.depth = 0
						$wrap.data('params', params).attr('style', '')
						$mobileMenu.scrollTop(0)
						$scroller.css('height', '')
					}, 400)
				}
			}
		}

		SwipeMobileMenu = function(){
			if($mobileMenu.isOpen){
				CloseMobileMenu()
			}
			else{
				OpenMobileMenu()
			}
		}

		function MoveMobileMenuWrapNext(){
			if(!$mobileMenu.isDowndrop){
				var $scroller = $mobileMenu.find('.scroller').first()
				var $wrap = $mobileMenu.find('.wrap').first()
				if($wrap.length){
					var params =  $wrap.data('params')
					var $dropdownNext = $mobileMenu.find('.expanded>.dropdown').eq(params.depth)
					if($dropdownNext.length){
						// save scroll position
						params.scroll[params.depth] = parseInt($mobileMenu.scrollTop())

						// height while move animating
						params.height[params.depth + 1] = Math.max($dropdownNext.height(), (!params.depth ? $wrap.height() : $mobileMenu.find('.expanded>.dropdown').eq(params.depth - 1).height()))
						$scroller.css('height', params.height[params.depth + 1] + 'px')

						// inc depth
						++params.depth

						// translateX for move
						$wrap.css('transform', 'translateX(' + -100 * params.depth + '%)')

						// scroll to top
						setTimeout(function() {
							$mobileMenu.animate({scrollTop : 0}, 200);
						}, 100)

						// height on enimating end
						var h = $dropdownNext.height()
						setTimeout(function() {
							if(h){
								$scroller.css('height', h + 'px')
							}
							else{
								$scroller.css('height', '')
							}
						}, 200)
					}

					$wrap.data('params', params)
				}
			}
		}

		function MoveMobileMenuWrapPrev(){
			if(!$mobileMenu.isDowndrop){
				var $scroller = $mobileMenu.find('.scroller').first()
				var $wrap = $mobileMenu.find('.wrap').first()
				if($wrap.length){
					var params =  $wrap.data('params')
					if(params.depth > 0){
						var $dropdown = $mobileMenu.find('.expanded>.dropdown').eq(params.depth - 1)
						if($dropdown.length){
							// height while move animating
							$scroller.css('height', params.height[params.depth] + 'px')

							// dec depth
							--params.depth

							// translateX for move
							$wrap.css('transform', 'translateX(' + -100 * params.depth + '%)')

							// restore scroll position
							setTimeout(function() {
								$mobileMenu.animate({scrollTop : params.scroll[params.depth]}, 200);
							}, 100)

							// height on enimating end
							var h = (!params.depth ? false : $mobileMenu.find('.expanded>.dropdown').eq(params.depth - 1).height())
							setTimeout(function() {
								if(h){
									$scroller.css('height', h + 'px')
								}
								else{
									$scroller.css('height', '')
								}
							}, 200)
						}
					}

					$wrap.data('params', params)
				}
			}
		}
	}
	/*  --- END Bind mobile menu  --- */

	/*  --- Bind mobile phone  --- */
    var $mobileHeader = $("#mobileheader, #mobileheadersimple");
    var $mobilePhone = $("#mobilePhone");
    $mobilePhone.isOpen = false;

    if($mobilePhone.length){

        $mobilePhone.isOpen = $mobilePhone.hasClass('show');

        $(document).on('click', '.wrap_phones > .svg', function(e){
            SwipeMobilePhone();
            e.stopPropagation();
        });

        $(document).on('click', '.wrap_phones .more_phone.title svg', function(e){
            CloseMobilePhone();
            e.stopPropagation();
        });
        $(document).on('click', '.wrap_phones .more_phone.title svg', function(e){
            CloseMobilePhone();
            e.stopPropagation();
        });
    }

    SwipeMobilePhone = function(){
        if($mobilePhone.isOpen){
            CloseMobilePhone();
        }
        else{
            OpenMobilePhone();
        }
    }

    OpenMobilePhone = function(){
        if(!$mobilePhone.isOpen){
            CloseMobileMenu();

            // show overlay
            $('<div class="jqmOverlay mobp" style="top:'+($mobileHeader.position().top+$mobileHeader.height())+'px;"></div>').appendTo('body');
            // toggle phones
            setTimeout(function(){
                $mobilePhone.slideDown('fast', function(){
                    $mobilePhone.addClass('show');
                    $mobilePhone.isOpen = true;
                });
            }, 100);
        }
    }

    CloseMobilePhone = function(){
        if($mobilePhone.isOpen){
        	// toggle phones
            setTimeout(function(){
                $mobilePhone.slideUp('fast', function(){
                    $mobilePhone.removeClass('show');
                    $mobilePhone.isOpen = false;

		        	// hide overlay
		            $('.jqmOverlay.mobp').remove();
                });
            }, 100);
        }
    }

    checkMobilePhone = function(){
        if((!window.matchMedia('(max-width: 991px)').matches)){
            CloseMobilePhone();
		}
    }
    /*  --- END Bind mobile phone  --- */

	/* change type2 menu for fixed */
	if($('#headerfixed .js-nav').length)
	{
		if(arAllcorp2Options['THEME']['HEADER_FIXED'] == 2)
			CheckHeaderFixedMenu();

		setTimeout(function(){
			$('#headerfixed .js-nav').addClass('opacity1');
		},350);
	}

	/* close search block */
	$("html, body").on('mousedown', function(e){
		if(typeof e.target.className == 'string' && e.target.className.indexOf('adm') < 0)
		{
			e.stopPropagation();
			var search_target = $(e.target).closest('.bx_searche');
			if(!$(e.target).hasClass('inline-search-block') && !$(e.target).hasClass('svg') && !search_target.length)
			{
				$('.inline-search-block').removeClass('show');
				$('.title-search-result').hide();
				if(arAllcorp2Options['THEME']['TYPE_SEARCH'] == 'fixed')
					$('.jqmOverlay.search').detach();
			}

			if(isMobile)
			{
				if(search_target.length)
					location.href = search_target.attr('href');
			}
			var class_name = $(e.target).attr('class');
			if(typeof(class_name) == 'undefined' || class_name.indexOf('tooltip') < 0) //tooltip link
				$('.tooltip-link').tooltip('hide');
		}
	});
	$('.inline-search-block').find('*').on('mousedown', function(e){
		e.stopPropagation();
	});

	$('.filter-action').on('click', function(){
		$(this).toggleClass('active');
		$(this).find('.svg').toggleClass('white');
		if($('.introtext').length)
		{
			var top_pos = $('.filters-wrap').position();
			$('.bx_filter').css({'top':top_pos.top+40});
		}
		$('.bx_filter').slideToggle();
	})

	waitingNotExists('#bx-composite-banner .bx-composite-btn', '#footer .col-sm-3.hidden-md.hidden-lg #bx-composite-banner .bx-composite-btn', 500, function() {
		$('#footer .col-sm-3.hidden-md.hidden-lg #bx-composite-banner').html($('#bx-composite-banner .bx-composite-btn').parent().html());
	});

	$.extend( $.validator.messages, {
		required: BX.message('JS_REQUIRED'),
		email: BX.message('JS_FORMAT'),
		equalTo: BX.message('JS_PASSWORD_COPY'),
		minlength: BX.message('JS_PASSWORD_LENGTH'),
		remote: BX.message('JS_ERROR')
	});

	$.validator.addMethod(
		'regexp', function( value, element, regexp ){
			var re = new RegExp( regexp );
			return this.optional( element ) || re.test( value );
		},
		BX.message('JS_FORMAT')
	);

	$.validator.addMethod(
		'filesize', function( value, element, param ){
			return this.optional( element ) || ( element.files[0].size <= param )
		},
		BX.message('JS_FILE_SIZE')
	);

	$.validator.addMethod(
		'date', function( value, element, param ) {
			var status = false;
			if(!value || value.length <= 0){
				status = true;
			}
			else{
				var re = new RegExp('^([0-9]{2})(.)([0-9]{2})(.)([0-9]{4})$');
				var matches = re.exec(value);
				if(matches){
					var composedDate = new Date(matches[5], (matches[3] - 1), matches[1]);
					status = ((composedDate.getMonth() == (matches[3] - 1)) && (composedDate.getDate() == matches[1]) && (composedDate.getFullYear() == matches[5]));
				}
			}
			return status;
		}, BX.message('JS_DATE')
	);

	$.validator.addMethod(
		'datetime', function( value, element, param ) {
			var status = false;
			if(!value || value.length <= 0){
				status = true;
			}
			else{
				var re = new RegExp('^([0-9]{2})(.)([0-9]{2})(.)([0-9]{4}) ([0-9]{1,2}):([0-9]{1,2})$');
				var matches = re.exec(value);
				if(matches){
					var composedDate = new Date(matches[5], (matches[3] - 1), matches[1], matches[6], matches[7]);
					status = ((composedDate.getMonth() == (matches[3] - 1)) && (composedDate.getDate() == matches[1]) && (composedDate.getFullYear() == matches[5]) && (composedDate.getHours() == matches[6]) && (composedDate.getMinutes() == matches[7]));
				}
			}
			return status;
		}, BX.message('JS_DATETIME')
	);

	$.validator.addMethod(
		'extension', function(value, element, param){
			param = typeof param === 'string' ? param.replace(/,/g, '|') : 'png|jpe?g|gif';
			return this.optional(element) || value.match(new RegExp('.(' + param + ')$', 'i'));
		}, BX.message('JS_FILE_EXT')
	);

	$.validator.addMethod(
		'captcha', function( value, element, params ){
			return $.validator.methods.remote.call(this, value, element,{
				url: arAllcorp2Options['SITE_DIR'] + 'ajax/check-captcha.php',
				type: 'post',
				data:{
					captcha_word: value,
					captcha_sid: function(){
						return $(element).closest('form').find('input[name="captcha_sid"]').val();
					}
				}
			});
		},
		BX.message('JS_ERROR')
    );

    $.validator.addMethod(
		'recaptcha', function(value, element, param){
			var id = $(element).closest('form').find('.g-recaptcha').attr('data-widgetid');
			if(typeof id !== 'undefined'){
				return grecaptcha.getResponse(id) != '';
			}
			else{
				return true;
			}
		}, BX.message('JS_RECAPTCHA_ERROR')
	);

	/*reload captcha*/
	$('body').on( 'click', '.refresh', function(e){
		e.preventDefault();
		$.ajax({
			url: arAllcorp2Options['SITE_DIR'] + 'ajax/captcha.php'
		}).done(function(text){
			if($('.captcha_sid').length)
			{
				$('.captcha_sid').val(text);
				$('.captcha_img').attr('src', '/bitrix/tools/captcha.php?captcha_sid=' + text);
			}
		});
	});

	$.validator.addClassRules({
		'phone':{
			regexp: arAllcorp2Options['THEME']['VALIDATE_PHONE_MASK']
		},
		'confirm_password':{
			equalTo: 'input.password',
			minlength: 6
		},
		'password':{
			minlength: 6
		},
		'inputfile':{
			extension: arAllcorp2Options['THEME']['VALIDATE_FILE_EXT'],
			filesize: 50000000
		},
		'datetime':{
			datetime: ''
		},
		'captcha':{
			captcha: ''
		},
		'recaptcha':{
			recaptcha: ''
		}
	});

	$.validator.setDefaults({
	   highlight: function( element ){
			$(element).parent().addClass('error');
		},
		unhighlight: function( element ){
			$(element).parent().removeClass('error');
		}
	});

	$(".video_link").fancybox({
			type: "iframe",
            maxWidth    : 800,
            maxHeight   : 600,
            fitToView   : false,
            width       : '70%',
            height      : '70%',
            autoSize    : false,
            closeClick  : false,
        });

	/*city*/
	$('select.region').on('change', function(){
		var val = parseInt($(this).val());
		if($('select.city').length)
		{
			if(val)
			{
				$('select.city option').hide();
				$('select.city option').prop('disabled', 'disabled');
				$('select.city option[data-parent_section='+val+']').prop('disabled', '');
				$('select.city option:eq(0)').prop('disabled', '');
				// $('select.city').ikSelect('reset');
				$('select.city option[data-parent_section='+val+']').show();
			}
			else
				$('select.city option').prop('disabled', 'disabled');
				$('select.city option:eq(0)').prop('disabled', '');
				// $('select.city').ikSelect('reset');
		}
	})

	$('select.city, select.region').on('change', function(){
		var _this = $(this),
			val = parseInt(_this.val());
		if(_this.hasClass('region'))
		{
			$('select.city option:eq(0)').show();
			$('select.city').val(0);
		}

		if((_this.hasClass('region') && !val) || _this.hasClass('city'))
		{
			$.ajax({
				type: 'POST',
				data: {ID: val},
			}).success(function(html){
				var ob = BX.processHTML(html);
				$('.ajax_items')[0].innerHTML = ob.HTML;
				BX.ajax.processScripts(ob.SCRIPT);
			})
		}
	})

	$('.mobile_regions .city_item').on('click', function(e){
    	e.preventDefault();
    	var _this = $(this);
    	$.removeCookie('current_region');

		if(arAllcorp2Options['SITE_ADDRESS'].indexOf(',') != '-1')
		{
			var arDomains = arAllcorp2Options['SITE_ADDRESS'].split(',');
			if(arDomains)
			{
				for(var i in arDomains)
				{
					var domain_name = arDomains[i].replace("\n", "");
						domain_name = arDomains[i].replace("'", "");
					$.cookie('current_region', _this.data('id'), {path: '/',domain: domain_name});
				}
			}
		}
		else
			$.cookie('current_region', _this.data('id'), {path: '/',domain: arAllcorp2Options['SITE_ADDRESS']});

		location.href = _this.attr('href');
    })

	InitFlexSlider();
        InitFlexSliderMin();

	// for check flexslider bug in composite mode
	waitingNotExists('.detail .galery #slider', '.detail .galery #slider .flex-viewport', 1000, function() {
		InitFlexSlider();
		setTimeout(function() {
			$(window).resize();
		}, 350);
	});

	/* change view type catalog */
	$('.view-button').on('click', function(){
		$(this).siblings().removeClass('cur');
		$(this).addClass('cur');
	})

	// -- escape close popup form
	$(document).on('keydown', function(e){
		if(e.keyCode == 27)
		{
			if($('.jqmWindow.show').length)
				$('.jqmWindow.show .jqmClose').click();
			if($('.inline-search-block.fixed.show').length)
				$('.inline-search-block.fixed .inline-search-hide').click();
		}
	});

	/*check mobile device*/
	if(isMobile){
		$('.hint span').remove();

		$(document).on('click', '*[data-event="jqm"]', function(e){
			e.preventDefault();
			var _this = $(this);
			var name = _this.data('name');

			if(window.matchMedia('(min-width:992px)').matches)
			{
				e.stopPropagation();
				$(this).jqmEx();
				$(this).trigger('click');
			}
			else if(name.length){
				var script = arAllcorp2Options['SITE_DIR'] + 'form/';
				var paramsStr = ''; var arTriggerAttrs = {};
				$.each(_this.get(0).attributes, function(index, attr){
					var attrName = attr.nodeName;
					var attrValue = _this.attr(attrName);
					attrValue = attrValue.replace(/%99/g, '\\'); // replace symbol \
					arTriggerAttrs[attrName] = attrValue;
					if(/^data\-param\-(.+)$/.test(attrName)){
						var key = attrName.match(/^data\-param\-(.+)$/)[1];
						paramsStr += key + '=' + attrValue + '&';
					}
				});
				var triggerAttrs = JSON.stringify(arTriggerAttrs);
				var encTriggerAttrs = encodeURIComponent(triggerAttrs);
				script += '?name=' + name + '&' + paramsStr + 'data-trigger=' + encTriggerAttrs;
				location.href = script;
			}
		});

		// $('.fancybox').removeClass('fancybox');
	}
	else{
		$(document).on('click', '*[data-event="jqm"]', function(e){
			e.preventDefault();
			e.stopPropagation();
			$(this).jqmEx();
			$(this).trigger('click');

		});
	}

	$('.animate-load').on('click', function(){
		$(this).parent().addClass('loadings');
	})

	BX.addCustomEvent('onCompleteAction', function(eventdata, _this){
		try{
			if(eventdata.action === 'loadForm')
			{
				$(_this).parent().removeClass('loadings');
			}
			else if(eventdata.action === 'loadBasket')
			{
				var basket_link = $('.basket-link');
				if(basket_link.length)
				{
					basket_link.attr('title', $(_this).find('a').attr('title'));
					if($(_this).find('a .count').length)
					{
						var count = basket_link.find('.count').length ? parseInt($(_this).find('.count').text()) : parseInt($(_this).find('.count').text());
						basket_link.find('.prices').text($(_this).find('.icon').data('summ'));
						if(basket_link.find('.count').length)
						{
							basket_link.find('.count').text(count);
							if(count)
								basket_link.addClass('basket-count');
							else
								basket_link.removeClass('basket-count');
						}
						else
						{
							basket_link.find('.js-basket-block').append($(_this).find('.count'));
							basket_link.addClass('basket-count');
							CheckHeaderFixedMenu();
						}

						$('#mobilemenu .menu .ready .count').text(count);
						if(count){
							$('#mobilemenu .menu .ready .count').removeClass('empted');
						}
						else{
							$('#mobilemenu .menu .ready .count').addClass('empted');
						}
					}
					else if($(_this).find('.opener').length)
					{
						var count = parseInt($(_this).find('.opener .count').text());

						if(basket_link.find('.count').length)
						{
							basket_link.find('.count').text(count);
							if(count)
								basket_link.addClass('basket-count');
							else
								basket_link.removeClass('basket-count');
							basket_link.attr('title', $(_this).find('.opener').attr('title'));
						}
						$('#mobilemenu .menu .ready .count').text(count);
						if(count){
							$('#mobilemenu .menu .ready .count').removeClass('empted');
						}
						else{
							$('#mobilemenu .menu .ready .count').addClass('empted');
						}
					}
					else
					{
						basket_link.find('.count').remove();
						basket_link.removeClass('basket-count');
						CheckHeaderFixedMenu();
					}
				}
			}
			else if(eventdata.action === 'loadRSS')
			{
			}
			else if(eventdata.action === 'ajaxContentLoaded')
			{
				if('type' in eventdata)
				{
					if(eventdata.type == 'table_block')
					{
						$('.catalog.item-views.table .item .title').sliceHeight();
						$('.catalog.item-views.table .item .cont').sliceHeight();
						// $('.catalog.item-views.table .item .slice_price').sliceHeight();
						$('.catalog.item-views.table .item').sliceHeight({classNull: '.footer-button'});
					}
					else if(eventdata.type == 'table_block2')
					{
						$('.catalog.item-views.table .item .title').sliceHeight();
						$('.catalog.item-views.table .item .cont').sliceHeight({autoHeightBlock: '.cont_inner', classNull: '.props_wrapper'});
						// $('.catalog.item-views.table .item .slice_price').sliceHeight();
						$('.catalog.item-views.table .item').sliceHeight({classNull: '.footer-button', autoHeightBlock: '.cont_inner', callback: setHoverHeight});
					}
				}
			}
		}
		catch(e){
			console.error(e)
		}
	})

	BX.addCustomEvent('onCounterGoals', function(eventdata){
		if(arAllcorp2Options['THEME']['YA_GOLAS'] == 'Y' && arAllcorp2Options['THEME']['YA_COUNTER_ID'])
		{
			var idCounter = arAllcorp2Options['THEME']['YA_COUNTER_ID'];
			idCounter = parseInt(idCounter);

			if(typeof eventdata != 'object')
				eventdata = {goal: 'undefined'};

			if(typeof eventdata.goal != 'string')
				eventdata.goal = 'undefined';

			if(idCounter)
			{
				try
				{
					waitCounter(idCounter, 50, function(){
						var obCounter = window['yaCounter' + idCounter];
						if(typeof obCounter == 'object'){
							obCounter.reachGoal(eventdata.goal);
						}
					});
				}
				catch(e)
				{
					console.error(e)
				}
			}
			else
			{
				console.info('Bad counter id!', idCounter);
			}
		}
	})

        BX.addCustomEvent(window, "onAjaxSuccess", function(e){
		if(e != 'OK')
		{
                        InitFlexSlider();
                        InitFlexSliderMin();
		}
	});

	/* show print */
	if(arAllcorp2Options['THEME']['PRINT_BUTTON'] == 'Y')
	{
		setTimeout(function(){
			if($('.page-top .rss-block.top').length)
			{
				$('<div class="print-link"><i class="svg svg-print"></i></div>').insertBefore($('.page-top .rss-block.top .shares-block'));
			}
			else if($('.page-top .rss').length)
			{
				$('<div class="print-link"><i class="svg svg-print"></i></div>').insertAfter($('.page-top .rss'));
			}
			else if($('.page-top h1').length)
				$('<div class="print-link"><i class="svg svg-print"></i></div>').insertBefore($('.page-top h1'));
			// else
				// $('footer .print-block').html('<div class="print-link"><i class="svg svg-print"><svg id="Print.svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path class="cls-1" d="M1553,287h-2v3h-8v-3h-2a2,2,0,0,1-2-2v-5a2,2,0,0,1,2-2h2v-4h8v4h2a2,2,0,0,1,2,2v5A2,2,0,0,1,1553,287Zm-8,1h4v-4h-4v4Zm4-12h-4v2h4v-2Zm4,4h-12v5h2v-3h8v3h2v-5Z" transform="translate(-1539 -274)"/></svg></i></div>');
		},150);
	}

	$(document).on('click', '.print-link', function(){
		window.print();
	})

	$('.head-block .item-link').on('click', function(){
		var _this = $(this);
		_this.siblings().removeClass('active');
		_this.addClass('active');
	})

	$('table.table').each(function(){
		var _this = $(this),
			first_td = _this.find('thead tr th');
		if(!first_td.length)
			first_td = _this.find('thead tr td');
		if(first_td.length)
		{
			_this.find('tbody tr:not(.nomobile)').each(function(i){
				$(this).find('td').each(function(i){
					$('<div class="th-mobile">'+first_td[i].textContent+'</div>').appendTo($(this));
				});

			});
		}
	})

	$('a.fancybox').fancybox();

	/* flex pagination */
	$(document).on('mouseenter', '.flex-viewport .item', function(){
		$(this).closest('.flexslider').find('.flex-control-nav').toggleClass('noz');
		$(this).closest('.flexslider').find('.flex-control-nav').css('z-index','0');
	})
	$(document).on('mouseleave', '.flex-viewport .item', function(){
		$(this).closest('.flexslider').find('.flex-control-nav').toggleClass('noz');
		$(this).closest('.flexslider').find('.flex-control-nav').css('z-index','2');
	})

	/* ajax more items */
	$(document).on('click', '.ajax_load_btn', function(){
		var url=$(this).closest('.bottom_nav').find('.module-pagination .next a').attr('href'),
			th=$(this).find('.more_text_ajax'),
			_this = $(this),
			container = $(this).closest('.bottom_nav');
		if(!th.hasClass('loading'))
		{
			th.addClass('loading');
			var objUrl = parseUrlQuery(),
				add_url = '',
				obData = {"AJAX_REQUEST": "Y"};
			if('clear_cache' in objUrl)
			{
				if(objUrl.clear_cache == 'Y')
					add_url = '&clear_cache=Y';
			}
			if($('.banners-small.front').length)
			{
				obData.MD = $('.banners-small.front').find('.items').data('colmd');
				obData.SM = $('.banners-small.front').find('.items').data('colsm');
			}
			$.ajax({
				url: url+''+add_url,
				data: BX.ajax.prepareData(obData),
				success: function(html){

					var eventdata = {action:'ajaxContentLoaded', content: html};
					if($('.ajax_load').length)
					{
						th.removeClass('loading');
						if(_this.closest('.item-views.list').length){
							_this.closest('.item-views').find('.items').append(html);
						}else if(_this.closest('.item-views.table').length){
							_this.closest('.item-views').find('.items').append(html);
							// touchItemBlock('.catalog_item a');
							eventdata.type = 'table_block';
							if(arAllcorp2Options['THEME']['CATALOG_BLOCK_TYPE'] == 'catalog_table_2')
								eventdata.type = 'table_block2';
						}else if($('.module_products_list').length){
							$('.module_products_list > tbody').append(html);
						}
						$('.bottom_nav').html($(html).find('.bottom_nav').html());
					}
					else
					{
						if($('.banners-small.front').length)
						{
							$('.banners-small .items.row').append(html);
							$('.bottom_nav').html($('.banners-small .items.row .bottom_nav').html());
							$('.banners-small .items.row .bottom_nav').remove();
						}
						else if(container.hasClass('index_block') && container.data('class')) //index page
						{
							var class_block = th.closest('.drag-block').attr('class').replace('drag-block container', ''),
								html_content = '';
							class_block = class_block.replace(/\s/g, '');

							html_content = $(html).find('.'+class_block).find(container.data('class'));
							th.closest('.drag-block').find(container.data('class')).find(container.data('item')).append(html_content.find(container.data('item')).html());
							th.closest('.nav_wrapper').html(html_content.find('.nav_wrapper').html());
						}
						else
						{
							$(html).insertBefore($('.blog .bottom_nav'));
							$('.bottom_nav').html($('.blog .bottom_nav:hidden').html());
							$('.blog .bottom_nav:hidden').remove();
						}
					}


					setTimeout(function(){
						BX.onCustomEvent('onCompleteAction', [eventdata, th[0]]);
						$('.banners-small .item.normal-block').sliceHeight();
						th.removeClass('loading');
					}, 100);
				}
			})
		}
	})

	/* bug fix in ff*/
	$('img').removeAttr('draggable');

	clicked_tab = 0;

	$('.title-tab-heading').on('click', function(){
		var container = $(this).closest('.tab-pane'),
			nav = $(this).closest('.tabs').find('.nav'),
			slide_block = $(this).next();

		clicked_tab = container.index()+1;

		container.siblings().removeClass('active');
		container.siblings().find('.title-tab-heading + div').hide();

		$('.catalog.detail .nav.nav-tabs li').removeClass('active');
		nav.find('li').removeClass('active');

		if(container.hasClass('active'))
		{
			slide_block.slideUp(200, function(){

				container.removeClass('active');
				nav.find('li:eq('+container.index()+')').removeClass('active');
			});
		}
		else
		{
			container.addClass('active');
			scrollToBlock(container);
			nav.find('li:eq('+container.index()+')').addClass('active');
			slide_block.slideDown();
		}
	})

	// Responsive Menu Events
	var addActiveClass = false;
	$('#mainMenu li.dropdown > a > i, #mainMenu li.dropdown-submenu > a > i').on('click', function(e){
		e.preventDefault();
		if($(window).width() > 979) return;
		addActiveClass = $(this).closest('li').hasClass('resp-active');
		// $('#mainMenu').find('.resp-active').removeClass('resp-active');
		if(!addActiveClass){
			$(this).closest("li").addClass("resp-active");
		}else{
			$(this).closest("li").removeClass("resp-active");
		}
	});

	/*animate increment*/
	if($('.spincrement').length)
	{
		$('.spincrement').counterUp({
			delay: 80,
			time: 1000
		});
	}

	$('.bx_filter_input_container input[type=text]').numeric({allow:"."});

	$('.toggle .more_items').on('click', function(){
		$(this).closest('.toggle').find('.collapsed').fadeToggle();
		$(this).remove();
		if(typeof $(this).data('resize') !== 'undefined' && $(this).data('resize'))
			$(window).resize();
	})
	$('.toggle_menu .more_items').on('click', function(){
		$(this).closest('.toggle_menu').find('.collapsed').addClass('clicked_exp');
		$(this).remove();
	})

	/* search sync */
	$(document).on('keyup', '.search-input-div input', function(e){
		var inputValue = $(this).val();
		$('.search-input-div input').val(inputValue);

		if($(this).closest('#headerfixed').length)
		{
			if(e.keyCode == 13)
				$('.search form').submit();
		}
	});
	$(document).on('click', '.search-button-div button', function(e){
		if($(this).closest('#headerfixed').length)
			$('.search form').submit();
	});

	$('.inline-search-show, .inline-search-hide').on('click', function(e){
		if(window.matchMedia('(min-width: 600px)').matches)
		{
			if(typeof($(this).data('type_search')) != 'undefined' && $(this).data('type_search') == 'fixed')
				$('.inline-search-block').addClass('fixed');

			if(arAllcorp2Options['THEME']['TYPE_SEARCH'] != 'fixed')
			{
				var height_block = 0;

				height_block = $(this).closest('.maxwidth-theme').actual('outerHeight');
				if($(this).closest('header.long').length)
					height_block = $(this).closest('header.long').actual('outerHeight');
				if($('header > .top-block').length)
				{
					height_block += $('header > .top-block').actual('outerHeight');
					height_block -= 6;
				}
				if($('#bx-panel').length)
					height_block += $('#bx-panel').actual('outerHeight');
				$('.inline-search-block').css({
					'height': height_block,
					'line-height': height_block-4+'px',
					'top': -height_block
				})
			}

			$('.inline-search-block').toggleClass('show');
			if($('.top-block').length)
			{
				if($('.inline-search-block').hasClass('show'))
					$('.inline-search-block').css('background', $('.top-block').css('background-color'));
				else
					$('.inline-search-block').css('background', '#fff');
			}
			if(arAllcorp2Options['THEME']['TYPE_SEARCH'] == 'fixed')
			{
				if($('.inline-search-block').hasClass('show'))
					$('<div class="jqmOverlay search"></div>').appendTo('body');
				else
					$('.jqmOverlay').detach();
			}
		}
		else
			location.href = arAllcorp2Options['SITE_DIR'] + 'search/';
	})

	if($('.styled-block .row > div.col-md-3').length){
		BX.addCustomEvent('onWindowResize', function(eventdata) {
			try{
				ignoreResize.push(true);
				$('.styled-block .row > div.col-md-3').each(function() {
					$(this).css({'height': '', 'line-height': ''});
					var z = parseInt($('.body_media').css('top'));
					if(z > 0){
						var rowHeight = $(this).parents('.row').first().actual('outerHeight');
						$(this).css({'height': rowHeight + 'px', 'line-height' : rowHeight + 'px'});
					}
				});
			}
			catch(e){}
			finally{
				ignoreResize.pop();
			}
		});
	}

	if($('.order-block').length){
		BX.addCustomEvent('onWindowResize', function(eventdata) {
			try{
				ignoreResize.push(true);
				$('.order-block').each(function() {
					var cols = $(this).find('.row > div');
					if(cols.length){
						var colFirst = cols.first();
						var colLast = cols.last();
						var colText = colFirst.find('.text');
						var bText = colText.length;
						var bOnlyText = cols.length === 1 && bText;
						var bPrice = colFirst.find('.price').length;
						var z = parseInt($('.body_media').css('top'));

						cols.css({'height': '', 'padding-top': '', 'padding-bottom': ''});
						colText.css({'height': '', 'padding-top': '', 'padding-bottom': ''});
						if((!bPrice && z > 0) || (bPrice && z > 1)){
							var minHeight = 83;

							if(!bOnlyText){
								var colLast_height = colLast.outerHeight();
								colLast_height = colLast_height >= minHeight ? colLast_height : minHeight;
							}

							if(bText){
								var colFirst_height = colFirst.outerHeight();
								colFirst_height = colFirst_height >= minHeight ? colFirst_height : minHeight;
							}

							var colMax_height = (bText ? (!bOnlyText ? (colLast_height >= colFirst_height ? colLast_height : colFirst_height) : colLast_height) : colFirst_height);

							if(!bOnlyText){
								var textPadding = 41 + (colMax_height - colFirst.outerHeight()) / 2;
								colLast.find('.btns').css({'padding-top': textPadding + 'px', 'padding-bottom': textPadding + 'px', 'height': colMax_height + 'px'});
							}
							if(bText){
								colLast.css({'height': colMax_height + 'px'});
								var textPadding = 41 + (colMax_height - colText.outerHeight()) / 2;
								colText.css({'padding-top': textPadding + 'px', 'padding-bottom': textPadding + 'px', 'height': colMax_height + 'px'});
							}
						}
					}
				});
			}
			catch(e){}
			finally{
				ignoreResize.pop();
			}
		});
	}

	if($('.equal-padding').length)
	{
		BX.addCustomEvent('onWindowResize', function(eventdata){
			try{
				ignoreResize.push(true);
				$('.equal-padding').each(function() {
					$(this).find('.text').css({'padding-top': '0px', 'padding-bottom': '0px'});
					var equal_block = $(this).siblings('.equals'),
						height = $(this).actual('outerHeight');

					delta = Math.round((equal_block.actual('outerHeight') - height)/2);
					if(delta)
						$(this).find('.text').css({'padding-top': delta+'px', 'padding-bottom': delta+'px'});
				})
			}
			catch(e){}
			finally{
				ignoreResize.pop();
			}
		});
	}

	$(document).on('click', '.mega-menu .dropdown-menu', function(e){
		e.stopPropagation()
	});

	$(document).on('click', '.mega-menu .dropdown-toggle.more-items', function(e){
		e.preventDefault();
	});

	$('.table-menu .dropdown,.table-menu .dropdown-submenu,.table-menu .dropdown-toggle').on('mouseenter', function() {
		CheckTopVisibleMenu();
	});

	$('.mega-menu .search-item .search-icon, .menu-row #title-search .fa-close').on('click', function(e) {
		e.preventDefault();
		$('.menu-row #title-search').toggleClass('hide');
	});

	$('.mega-menu ul.nav .search input').on('keyup', function(e) {
		var inputValue = $(this).val();
		$('.menu-row > .search input').val(inputValue);
		if(e.keyCode == 13){
			$('.menu-row > .search form').submit();
		}
	});

	$('.menu-row > .search input').on('keyup', function(e) {
		var inputValue = $(this).val();
		$('.mega-menu ul.nav .search input').val(inputValue);
		if(e.keyCode == 13){
			$('.menu-row > .search form').submit();
		}
	});

	$('.mega-menu ul.nav .search button').on('click', function(e) {
		e.preventDefault();
		var inputValue = $(this).parents('.search').find('input').val();
		$('.menu-and-search .search input').val(inputValue);
		$('.menu-row > .search form').submit();
	});

	$('.filter .calendar').on('click', function() {
		var button = $(this).next();
		if(button.hasClass('calendar-icon')){
			button.trigger('click');
		}
	});

	/*sliceheights*/
	if($('.banners-small .item.normal-block').length)
		$('.banners-small .item.normal-block').sliceHeight();
	if($('.teasers .item').length)
		$('.teasers .item').sliceHeight();
	if($('.wrap-portfolio-front .row.items > div').length)
		$('.wrap-portfolio-front .row.items > div').sliceHeight({'row': '.row.items', 'item': '.item1'});

	SliceHeightBlocks();

	/* toggle */
	var $this = this,
		previewParClosedHeight = 25;

	$('section.toggle > label').prepend($('<i />').addClass('fa fa-plus'));
	$('section.toggle > label').prepend($('<i />').addClass('fa fa-minus'));
	$('section.toggle.active > p').addClass('preview-active');
	$('section.toggle.active > div.toggle-content').slideDown(350, function() {});

	$('section.toggle > label').click(function(e){
		var parentSection = $(this).parent(),
			parentWrapper = $(this).parents('div.toogle'),
			previewPar = false,
			isAccordion = parentWrapper.hasClass('toogle-accordion');

		if(isAccordion && typeof(e.originalEvent) != 'undefined') {
			parentWrapper.find('section.toggle.active > label').trigger('click');
		}

		parentSection.toggleClass('active');

		// Preview Paragraph
		if( parentSection.find('> p').get(0) ){
			previewPar = parentSection.find('> p');
			var previewParCurrentHeight = previewPar.css('height');
			previewPar.css('height', 'auto');
			var previewParAnimateHeight = previewPar.css('height');
			previewPar.css('height', previewParCurrentHeight);
		}

		// Content
		var toggleContent = parentSection.find('> div.toggle-content');

		if( parentSection.hasClass('active') ){
			$(previewPar).animate({
				height: previewParAnimateHeight
			}, 350, function() {
				$(this).addClass('preview-active');
			});
			toggleContent.slideDown(350, function() {});
		}
		else{
			$(previewPar).animate({
				height: previewParClosedHeight
			}, 350, function() {
				$(this).removeClass('preview-active');
			});
			toggleContent.slideUp(350, function() {});
		}
	});

	/* accordion */
	$('.accordion-head').on('click', function(e){
		e.preventDefault();
		if(!$(this).next().hasClass('collapsing')){
			$(this).toggleClass('accordion-open');
			$(this).toggleClass('accordion-close');
		}
	});

	/* progress bar */
	$('[data-appear-progress-animation]').each(function(){
		var $this = $(this);
		$this.appear(function(){
			var delay = ($this.attr('data-appear-animation-delay') ? $this.attr('data-appear-animation-delay') : 1);
			if( delay > 1 )
				$this.css('animation-delay', delay + 'ms');
			$this.addClass($this.attr('data-appear-animation'));

			setTimeout(function(){
				$this.animate({
					width: $this.attr('data-appear-progress-animation')
				}, 1500, 'easeOutQuad', function() {
					$this.find('.progress-bar-tooltip').animate({
						opacity: 1
					}, 500, 'easeOutQuad');
				});
			}, delay);
		}, {accX: 0, accY: -50});
	});

	/* portfolio item */
	$('.item.animated-block').appear(function(){
		var $this = $(this);

		$this.addClass($this.data('animation')).addClass('visible');

	}, {accX: 0, accY: 150})

	$('a[rel=tooltip]').tooltip();
	$('span[data-toggle=tooltip]').tooltip();

	$('select.sort').on('change', function(){
		location.href = $(this).val();
	});

	setTimeout(function(th){
		$('.catalog.group.list .item').each(function(){
			var th = $(this);
			if((tmp = th.find('.image').outerHeight() - th.find('.text_info').outerHeight()) > 0){
				th.find('.text_info .titles').height(th.find('.text_info .titles').outerHeight() + tmp);
			}
		})
	}, 50);

	/* ajax tabs*/

		/*tabs on front in mobile*/
	$('.items-link-mobile').each(function() {
	    var _this = $(this),
	        selectOption = _this.find('option'),
	        selectOptionLength = selectOption.length,
	        selectedOption = selectOption.filter(':selected'),
	        duration = 200; // ������������ ��������

	    _this.hide();
	    _this.wrap('<div class="select"></div>');
	    $('<div>', {
	        class: 'new-select',
	        text: _this.children('option:disabled').text()
	    }).insertAfter(_this);

	    var selectHead = _this.next('.new-select');
	    $('<div>', {
	        class: 'new-select__list'
	    }).insertAfter(selectHead);

	    var selectList = selectHead.next('.new-select__list');
	    for (var i = 1; i < selectOptionLength; i++) {
	        $('<div>', {
	            class: 'new-select__item',
	            html: $('<span>', {
	                text: selectOption.eq(i).text()
	            })
	        })
	        .attr('data-value', selectOption.eq(i).val())
	        .appendTo(selectList);
	    }

	    var selectItem = selectList.find('.new-select__item');
	    var selectItemFirst = selectList.find('.new-select__item:first-child');
	    selectList.slideUp();
	    selectHead.on('click', function() {
	        if ( !$(this).hasClass('on') ) {
	            $(this).addClass('on');
	            selectList.slideDown(duration);

				selectItemCur = selectList.find('.new-select__item.active');

				if (!selectItem.hasClass('active')){
					selectItemFirst.addClass('active');
					selectItemCur = selectItemFirst;
				}

	            selectItem.on('click', function() {
	                selectItemCur.removeClass('active');
	                var chooseItem = $(this).data('value');

	                $('select').val(chooseItem).attr('selected', 'selected');
	                selectHead.text( $(this).find('span').text() );
	                selectHead.attr('data-value', $(this).attr('data-value'));
	                $(this).addClass('active');
                	var _this = $(this);
	                selectList.slideUp(150, function() {
	                	selectHead.removeClass('on');

						var index = _this.index();
						var curHeadBlock = _this.closest('.head-block');
						var indexTab = curHeadBlock.find('.items-link .item-link.active');
						var indexActiveTab = indexTab.index();

						if(indexActiveTab != index){
							curHeadBlock.find('.items-link .item-link').eq(index).trigger('click');
						}
	                });




	            });

	        } else {
	            $(this).removeClass('on');
	            selectList.slideUp(duration);
	        }
	    });
	});

	// $('.items-link-mobile').on('change', function(){
	// 	var value = $(this).val();

	// 	var option = $(this).find('option[value='+value+']');

	// 	var index = option.index();

	// 	var curHeadBlock = $(this).closest('.head-block');
	// 	var indexTab = curHeadBlock.find('.item-link.active');
	// 	var indexActiveTab = indexTab.index();

	// 	if(indexActiveTab != index){
	// 		curHeadBlock.find('.items-link .item-link').eq(index).trigger('click');
	// 	}
	// });


		/*tabs on PC*/
	$('.head-block .item-link').on('click', function(){
		var index = $(this).index(),
			body_block = $(this).closest('.catalog').find('.body-block'),
			obQuery = parseUrlQuery(),
			url_post = arAllcorp2Options['SITE_DIR'] + 'include/mainpage/comp_catalog_ajax.php';
			// $hideItemsLink = $('.clicked').siblings('.hide_mobile');

		$(this).siblings().removeClass('active').addClass('hide_mobile');
		$(this).addClass('active').removeClass('hide_mobile');

		if('clear_cache' in obQuery)
			url_post += '?clear_cache='+obQuery.clear_cache;

		if(!$(this).hasClass('clicked'))
		{
			$.ajax({
				url: url_post,
				type: 'POST',
				data: {AJAX_POST: 'Y', AJAX_PARAMS: $(this).closest('.item-views.catalog').find('.request-data').data('value'), GLOBAL_FILTER: body_block.find('.item-block:eq('+index+')').data('filter')},
			}).success(function(html){
				body_block.find('.item-block:eq('+index+')').html(html);

				InitFlexSliderClass(body_block.find('.item-block:eq('+index+')').find('.flexslider')); //reinit flexslider

				body_block.css('height', body_block.find('.item-block.active').actual('outerHeight'));

				body_block.find('.item-block').removeClass('active').removeClass('opacity1').addClass('opacity0');
				body_block.find('.item-block:eq('+index+')').addClass('active');

				setTimeout(function(){
					body_block.css('height', 'auto');

					//recalculate height
					body_block.find('.item-block:eq('+index+') .catalog.item-views.table .item .title').sliceHeight({sliceEqualLength: true});
					body_block.find('.item-block:eq('+index+') .catalog.item-views.table .item .cont').sliceHeight({sliceEqualLength: true});
					body_block.find('.item-block:eq('+index+') .catalog.item-views.table .item .slice_price').sliceHeight({sliceEqualLength: true});
					body_block.find('.item-block:eq('+index+') .catalog.item-views.table .item').sliceHeight({sliceEqualLength: true});

					body_block.find('.item-block:eq('+index+')').removeClass('opacity0').addClass('opacity1');
					if(typeof setHoverHeight == "function")
						setHoverHeight();
				},100)

				setBasketItemsClasses();
			});
		}
		else
		{
			body_block.find('.item-block').removeClass('active').removeClass('opacity1').addClass('opacity0');
			body_block.find('.item-block:eq('+index+')').addClass('active').removeClass('opacity0').addClass('opacity1');

			if(!body_block.find('.item-block.active .flex-control-nav li').length)
			{
				$('.item-views.catalog .flex-direction-nav li a').addClass('flex-disabled');
			}
			else
			{
				$('.item-views.catalog .flex-direction-nav li a').removeClass('flex-disabled');
			}
			setBasketItemsClasses();
			if(typeof setHoverHeight == "function")
				setHoverHeight();

			// if ($hideItemsLink.hasClass('hide_mobile')) {
			//     $hideItemsLink.each(function(){
			//         $(this).removeClass("hide_mobile");
			//     });
			// }
		}
		$(this).addClass('clicked');
	})

	/*item galery*/
	$('.thumbs .item a').on('click', function(e){
		e.preventDefault();
		$('.thumbs .item').removeClass('current');
		$(this).closest('.item').toggleClass('current');
		$('.slides li' + $(this).attr('href')).addClass('current').siblings().removeClass('current');
	});

	$('header.fixed .btn-responsive-nav').on('click', function() {
		$('html, body').animate({scrollTop: 0}, 400);
	});

	$('body').on('click', '.form .refresh-page', function(){
		location.href = location.href;
	});

	// click on HTML5 video
	$(document).on('click', 'video.video', function(e){
		var videoID = e.target.id.replace('player_', '')
	    if(videoID){
	    	if(players[videoID].playing){
				e.target.pause()
	    	}
	    	else{
	    		e.target.play()
	    	}
	    }
	})

	// START VIDEO BUTTON
	/*$(document).on('click', '.banners-big .item .btn-video', function(){
		$(this).addClass('loading');
		startMainBannerSlideVideo($(this).closest('.item'));
	});*/

	$(document).on('click', '.basket.fly .opener', function(){
		if(window.matchMedia('(max-width: 767px)').matches)
			location.href = arAllcorp2Options['THEME']['URL_BASKET_SECTION'];
		else
			$(this).closest('.ajax_basket').toggleClass('opened');
	})

	$(document).on('click', '.basket.fly .close_block', function()
	{
		$('.basket.fly .opener').trigger('click');
	})

	/* show props */
	$(document).on('click', ".show_props", function(){
		$(this).prev(".props_list").stop().slideToggle(333);
		$(this).find(".char_title").toggleClass("opened");
	});

	/* animated labels */
	$(document).on("focus", ".animated-labels input,.animated-labels textarea", function(){
		$(this).closest(".animated-labels").addClass("input-filed");
	}).on("focusout", ".animated-labels input,.animated-labels textarea", function(){
		if("" != $(this).val())
			$(this).closest(".animated-labels").addClass("input-filed");
		else
			$(this).closest(".animated-labels").removeClass("input-filed");
	})

	/* accordion action*/
	$('.panel-collapse').on('hidden.bs.collapse', function(){
		$(this).parent().toggleClass('opened');
	})
	$('.panel-collapse').on('show.bs.collapse', function(){
		$(this).parent().toggleClass('opened');
	})

	// DIGITAL BASKET
	// - basket fly close
	$(document).on('click', function(){
		if($('.basket.fly').length && $('.ajax_basket').hasClass('opened')){
			$('.ajax_basket').removeClass('opened');
		}
	});

	$(document).on('click', '.basket.fly', function(e){
		e.stopPropagation();
	});

	// - COUNTER
	var timerBasketCounter = false;

	// -- keyup input
	$(document).on('keydown', '.count', function(e){
		// Allow: backspace, delete, tab, escape, enter and .
		if($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
			 // Allow: Ctrl+A, Command+A
			(e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
			 // Allow: home, end, left, right, down, up
			(e.keyCode >= 35 && e.keyCode <= 40)) {
				 // let it happen, don't do anything
				 return;
		}
		// Ensure that it is a number and stop the keypress
		if((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)){
			e.preventDefault();
		}
	});
	$(document).on('keyup', '.count', function(e){
		var $this = $(this),
			counterInputValueNew = $this.val(),
			price = $this.closest('.item').find('input[name=PRICE]').val();

		Summ($this, counterInputValueNew, price);
	});

	// -- scroll after apply option
	if($('.instagram_ajax').length)
	{
		BX.addCustomEvent('onCompleteAction', function(eventdata){
			if(eventdata.action === 'instagrammLoaded')
				scrollPreviewBlock();
		});
	}
	else
		scrollPreviewBlock();

	$('select.region').on('change', function(){
		var val = parseInt($(this).val());
		if($('select.city').length)
		{
			if(val)
			{
				$('select.city').removeAttr('disabled');
				$('select.city option').hide();
				$('select.city option[data-parent_section='+val+']').show();
			}
			else
				$('select.city').attr('disabled', 'disabled');
		}
	})

	$('select.city, select.region').on('change', function(){
		var _this = $(this),
			val = parseInt(_this.val());
		if(_this.hasClass('region'))
		{
			$('select.city option:eq(0)').show();
			$('select.city').val(0);
		}

		if((_this.hasClass('region') && !val) || _this.hasClass('city'))
		{
			$.ajax({
				type: 'POST',
				data: {ID: val},
			}).success(function(html){
				var ob = BX.processHTML(html);
				$('.ajax_items')[0].innerHTML = ob.HTML;
				BX.ajax.processScripts(ob.SCRIPT);
			})
		}
	})

	// -- blur input
	$(document).on('blur', '.count', function(){
		BasketCounter($(this));
	});

	// -- click minus, plus button
	$(document).on('click', '.minus, .plus', function(e){
		e.stopPropagation();
		BasketCounter($(this));
	});

	// - Add2Basket
	$(document).on('click', '.to_cart', function(e){
		e.stopPropagation();
		var item = $(this).closest('[data-item]'),
			_this = $(this),
			itemData = item.data('item'),
			buyBlock = item.find('.buy_block'),
			counter = buyBlock.find('.counter'),
			buttonToCart = buyBlock.find('.to_cart'),
			itemQuantity = parseFloat(buttonToCart.data('quantity')),
			countItem = ($('.basket').length ? parseInt($('.basket .count').text()) : parseInt($('.basket_top:visible .count').text()));

		if(typeof(arBasketItems) === 'object' && typeof(arBasketItems[itemData.ID]) !== 'object')
			arBasketItems[itemData.ID] = {'ID': itemData.ID};

		$('.basket_top .count').text(countItem + 1).removeClass('empted');
		$('.basket .count').text(countItem + 1).removeClass('empted');

		if(typeof(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) !== 'undefined')
		{
			if($.trim(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) === 'HEADER' && $('.basket_top').length)
				var bBasketTop = true;
			else if($('.basket.fly').length)
				var bBasketFly = true;
		}

		if(isNaN(itemQuantity) || itemQuantity <= 0){
			itemQuantity = 1;
		}

		if(!isNaN(itemData.ID) && parseInt(itemData.ID) > 0){
			buyBlock.addClass('in');

			$.ajax({
				url: arAllcorp2Options['SITE_DIR'] + 'include/footer/site-basket.php',
				type: 'POST',
				data: {itemData: itemData, quantity: itemQuantity},
			}).success(function(html){
				var eventdata = {action:'loadForm'};
				BX.onCustomEvent('onCompleteAction', [eventdata, _this[0]]);

				if(bBasketTop)
				{
					$('.ajax_basket').html(html);
				}

				if(bBasketFly)
				{
					if($('.basket.fly').length)
					{
						$('.ajax_basket').html(html);
						setTimeout(function(){
							if(!$('.ajax_basket').hasClass('opened')){
								$('.ajax_basket').addClass('opened');
							}
						}, 50);
					}
				}

				var eventdata = {action:'loadBasket'};
				BX.onCustomEvent('onCompleteAction', [eventdata, $('.ajax_basket')[0]]);

				if(arAllcorp2Options['THEME']['USE_SALE_GOALS'] != 'N')
				{
					var eventdata = {goal: 'goal_basket_add', params: {itemData: itemData, quantity: itemQuantity}};
					BX.onCustomEvent('onCounterGoals', [eventdata]);
				}
			});
		}
		else{
			return;
		}
	});

	// - Remove9Basket
	$(document).on('click', '.remove', function(){
		var item = $(this).closest('[data-item]'),
			itemData = item.data('item'),
			bRemove = 'Y',
			bRemoveAll = ($.trim($(this).closest('[data-remove_all]').data('remove_all')) === 'Y' ? 'Y' : false);
			getCurUri = $.trim($('input[name=getPageUri]').val()),
			countItem = ($('.basket').length ? parseInt($('.basket .item').length) : parseInt($('.basket_top:visible .item').length)),
			bOneItem = (countItem - 1 <= 0),
			scrollTop = ($('.basket.fly').length ? $('.basket.fly .items_wrap').scrollTop() : ($('.basket_top:visible').length ? $('.basket_top .items:visible').scrollTop() : ''));

		if(typeof(arBasketItems) === 'object' && itemData && typeof(arBasketItems[itemData.ID]) === 'object')
			delete arBasketItems[itemData.ID];

		var _ajax = function(){
			$.ajax({
				url: arAllcorp2Options['SITE_DIR'] + 'include/footer/site-basket.php',
				data: {itemData: itemData, remove: bRemove, removeAll: bRemoveAll},
			}).success(function(html){

				if(bBasketTop){
					$('.ajax_basket').html(html);
					$('.basket_top .items').scrollTop(scrollTop);
				}

				if(getCurUri){
					$.ajax({
						url: getCurUri,
						type: 'POST',
					}).success(function(html){
						if($('.basket.default').length){
							$('.basket.default').html(html);
						}
					});
				}

				if(bBasketFly){
					$('.ajax_basket').html(html);
					$('.ajax_basket').addClass('opened');
					$('.basket.fly .items_wrap').scrollTop(scrollTop);
				}

				var eventdata = {action:'loadBasket'};
				BX.onCustomEvent('onCompleteAction', [eventdata, $(html)]);

				if(arAllcorp2Options['THEME']['USE_SALE_GOALS'] != 'N')
				{
					var eventdata = {goal: 'goal_basket_remove', params: {itemData: itemData, remove: bRemove, removeAll: bRemoveAll}};
					BX.onCustomEvent('onCounterGoals', [eventdata]);
				}
			});
		}

		if(typeof(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) !== 'undefined')
		{
			if($.trim(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) === 'HEADER' && $('.basket_top').length)
				var bBasketTop = true;
			else if($('.basket.fly').length)
				var bBasketFly = true;
		}

		if(typeof(itemData) !== 'undefined' && (!isNaN(itemData.ID) && itemData.ID > 0) || bRemoveAll){
			if(bRemoveAll){
				$('.buy_block').removeClass('in');
				$('.basket .count').text(0).addClass('empted');
				$('.basket_top .count').text(0).addClass('empted');
				$('#mobilemenu .menu .ready .count').text(0).addClass('empted');
			}
			else{
				$('[data-item]').each(function(){
					if($(this).data('item').ID == itemData.ID){
						$(this).find('.buy_block').removeClass('in');
					}
				});
				if($('.basket').length){
					if($('.basket_top .count').length)
						$('.basket_top .count').text(parseFloat($('.basket_top:visible .count').text()) - 1);
					else
					{
						$('.basket .count').text(parseFloat($('.basket .count').text()) - 1);
						$('.basket_top .count').text(parseFloat($('.basket .count').text()) - 1);
					}
				}
				else{
					$('.basket_top .count').text(parseFloat($('.basket_top:visible .count').text()) - 1);
				}

				$('#mobilemenu .menu .ready .count').text(parseFloat($('#mobilemenu .menu .ready .count').text()) - 1);
			}

			if(bOneItem && !bRemoveAll){
				if(item.closest('.basket_top').length){
					item.closest('.dropdown').animate({opacity: 0}, 200, function(){
						_ajax();
					});
				}
				else{
					item.closest('.basket').find('.count').addClass('empted');
					item.closest('.basket_wrap').fadeOut(200, function(){
						item.closest('.basket').find('.basket_empty').fadeIn(200, function(){
							_ajax();
						});
					});
				}
			}
			else if(bRemoveAll){
				$('.basket_wrap').fadeOut(200, function(){
					$('.remove.all').remove();
					$('.basket').find('.basket_empty').fadeIn(200, function(){
						_ajax();
					});
				});
			}
			else if(!bOneItem){
				item.animate({opacity: 0}, 200).slideUp(200, function(){
					_ajax();
				});
			}
		}
		else{
			return;
		}
	});
	$(document).on('click', '.print', function(){
		window.print();
	});

	$('.choise').on('click', function(){
		var _this = $(this);
		if(typeof(_this.data('block')) != 'undefined')
		{
			scrollToBlock(_this.data('block'));
		}
	})

	/*touch event*/
	document.addEventListener('touchend', function(event) {
		if(!$(event.target).closest('.menu-item').length && !$(event.target).hasClass('menu-item')){
			$('.mega-menu .dropdown-menu').css({'display':'none','opacity':0});
			$('.menu-item').removeClass('hover');
			$('.bx-breadcrumb-item.drop').removeClass('hover');
		}
		if(!$(event.target).closest('.menu.topest').length){
			$('.menu.topest').css({'overflow': 'hidden'});
			$('.menu.topest > li').removeClass('hover');
		}
		if(!$(event.target).closest('.full.has-child').length){
			$('.menu_top_block.catalog_block li').removeClass('hover');
		}
		/*if(!$(event.target).closest('.basket_block').length){
			$('.basket_block .link').removeClass('hover');
			$('.basket_block .basket_popup_wrapp').slideUp();
		}
		if(!$(event.target).closest('.catalog_item').length){
			var tabsContentUnhoverHover = $('.tab:visible').attr('data-unhover') * 1;
			$('.tab:visible').stop().animate({'height': tabsContentUnhoverHover}, 100);
			$('.tab:visible').find('.catalog_item').removeClass('hover');
			$('.tab:visible').find('.catalog_item .buttons_block').stop().fadeOut(233);
			if($('.catalog_block').length){
				$('.catalog_block').find('.catalog_item_wrapp').removeClass('hover');
				$('.catalog_block').find('.catalog_item').removeClass('hover');
			}
		}*/

	}, false);

	touchMenu('.mega-menu .menu-item');
	touchTopMenu('.menu.topest li');
});

function touchMenu(selector){
	if(isMobile){
		if($(selector).length)
		{
			$(selector).each(function(){
				var th=$(this);
				th.on('touchend', function(e) {
					var _th = $(e.target).closest('.menu-item');

					$('.menu.topest > li').removeClass('hover');
					$('.menu_top_block.catalog_block li').removeClass('hover');
					$('.bx-breadcrumb-item.drop').removeClass('hover');

					if (_th.find('.dropdown-menu').length && !_th.hasClass('hover')) {
						e.preventDefault();
						e.stopPropagation();
						_th.siblings().removeClass('hover');
						_th.addClass('hover');
						$('.menu-row .dropdown-menu').css({'display':'none', 'opacity':0});
						if(_th.hasClass('menu-item'))
						{
							_th.closest('.dropdown-menu').css({'display':'block', 'opacity':1});
						}
						if(_th.find('> .wrap > .dropdown-menu'))
						{
							_th.find('> .wrap > .dropdown-menu').css({'display':'block', 'opacity':1});
						}
						else if(_th.find('> .dropdown-menu'))
						{
							_th.find('> .dropdown-menu').css({'display':'block', 'opacity':1});
						}
						CheckTopVisibleMenu();
					}
					else
					{
						var href = ($(e.target).attr('href') ? $(e.target).attr('href') : $(e.target).closest('a').attr('href'))
						if(href && href !== 'undefined')
							location.href = href;
					}
				})
			})
		}
	}else{
		$(selector).off();
	}
}

function touchTopMenu(selector){
	if(isMobile){
		if($(selector).length)
		{
			$(selector).each(function(){
				var th=$(this);
				th.on('touchend', function(e) {
					var _th = $(e.target).closest('li');

					$('.menu-item').removeClass('hover');
					$('.menu-item .dropdown-menu').css({'display':'none', 'opacity':0});
					$('.menu_top_block.catalog_block li').removeClass('hover');
					$('.bx-breadcrumb-item.drop').removeClass('hover');

					if (_th.hasClass('more') && !_th.hasClass('hover')) {
						e.preventDefault();
						e.stopPropagation();
						_th.siblings().removeClass('hover');
						_th.addClass('hover');
						$('.menu.topest').css({'overflow': 'visible'});
					}
					else
					{
						var href = ($(e.target).attr('href') ? $(e.target).attr('href') : $(e.target).closest('a').attr('href'))
						if(href && href !== 'undefined')
							location.href = href;
					}
				})
			})
		}
	}else{
		$(selector).off();
	}
}

scrollPreviewBlock = function(){
	if(typeof($.cookie('scoll_block')) != 'undefined' && $.cookie('scoll_block'))
	{
		var scoll_block = $($.cookie('scoll_block'));
		if(scoll_block.length)
		{
			$('body, html').animate({scrollTop: scoll_block.offset().top}, 500);
			$.cookie('scoll_block', null);
		}
	}
}

scrollToBlock = function(block){
	if($(block).length)
	{
		var offset = $(block).offset().top;
		if(typeof($(block).data('toggle')) != 'undefined')
			$(block).click();

		if(typeof($(block).data('offset')) != 'undefined')
			offset += $(block).data('offset');

		$('body, html').animate({scrollTop: offset}, 500);
	}
}

// START VIDEO BUTTON
$('.banners-big .maxwidth-banner .item.vvideo .maxwidth-theme').on('click', function(e){
	if(!$(e.target).hasClass('btn-video'))
	{
		if($(this).hasClass('loading'))
		{
			e.stopPropagation();
			$(this).find('.btn-video').trigger('click');
		}
	}
})

$(document).on('click', '.banners-big .item.current  .btn-video', function(e){
	e.stopPropagation();
	if(!$(this).hasClass('loading'))
	{
		$(this).addClass('loading');
		$(this).closest('.maxwidth-theme').addClass('loading');
	}
	else
	{
		$(this).removeClass('loading');
		$(this).closest('.maxwidth-theme').removeClass('loading');
	}

	startMainBannerSlideVideo($(this).closest('.item'));
});


//  BANNER GO TO LINK
$(document).on('click', '.banners-big.front .box .tablet_img', function(e){
	var wurl = $(this).closest('.box').hasClass('wurl');
	if(wurl){
		var href = $(this).closest('.box').find('.target').attr('href');
		console.log(href);
		if(href.length){
			var target = $(this).closest('.box').find('.target').attr('target');
			if(typeof target === 'undefined' || target === '_self'){
				location.href = href;
			}
			else{
				window.open(href);
			}
		}
	}
})

//DIGITAL BASKET
function number_format(number, decimals, dec_point, thousands_sep) {
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
	prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
	s = '',
	toFixedFix = function(n, prec){
		var k = Math.pow(10, prec);
		return '' + (Math.round(n*k)/k).toFixed(prec);
	};

	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');

	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}

	if ((s[1] || '')
		.length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}

	return s.join(dec);
}


setBasketItemsClasses = function(){
	if(typeof(arBasketItems) !== 'undefined' && typeof(arBasketItems) !== 'string'){
		if(Object.keys(arBasketItems).length){
			for(var key in arBasketItems){
				$('[data-item]').each(function(){
					if($(this).data('item').ID == key){
						$(this).find('.buy_block').addClass('in');
					}
				});
			}
		}
	}
}

function Summ(el, counterInputValueNew, price){
	if(counterInputValueNew <= 0){
		counterInputValueNew = 1;
	}

	var summ = number_format(counterInputValueNew*price, 0, '.', ' '),
		allSumm = 0;

	el.closest('.items').find('.item').each(function(){
		var $this = $(this),
			price = parseFloat($this.find('input[name=PRICE]').val()),
			count =  parseFloat($this.find('input.count').val());

		if(count <= 0){
			count = 1;
		}

		if(!isNaN(price) && !isNaN(count)){
			allSumm += count*price;
		}
	});

	allSumm = number_format(parseFloat(allSumm), 0, '.', ' ');

	el.closest('.item').find('.summ .price_val').text(summ);
	el.closest('.basket').find('.foot .total>span').text(allSumm);
}

var timerBasketUpdate = false;
// - COUNTER
BasketCounter = function(el){
	var elClass = $.trim(el.attr('class')),
		bClassMinus = (elClass.indexOf('minus') > -1),
		bClassPlus = (elClass.indexOf('plus') > -1),
		bClassCount = (elClass.indexOf('count') > -1),
		getCurUri = $.trim($('input[name=getPageUri]').val()),
		buyBlock = el.closest('.buy_block'),
		buttonToCart = buyBlock.find('.to_cart'),
		counterInput = el.closest('.counter').find('input.count'),
		counterInputValue = parseFloat($.trim(counterInput.val())),
		price = parseFloat(buyBlock.find('input[name=PRICE]').val()),
		counterInputMaxCount = Math.pow(10, parseInt(counterInput.attr('maxlength'))) - 1,
		bAjax = (el.closest('.basket').length ? true : false);

	// class minus button
	if(bClassMinus){
		var counterInputValueNew = counterInputValue - 1;

		if(counterInputValueNew <= 0){
			counterInputValueNew = 1;
		}

		counterInput.val(counterInputValueNew);

		if(bAjax){
			Summ(el, counterInputValueNew, price);

			if(timerBasketUpdate){
				clearTimeout(timerBasketUpdate);
				timerBasketUpdate = false;
			}

			timerBasketUpdate = setTimeout(function(){
				BasketUpdate(el, counterInputValueNew);
				timerBasketUpdate = false;
			}, 700);
		}
	}
	// class plus button
	else if(bClassPlus){
		var counterInputValueNew = counterInputValue + 1;

		if(counterInputValueNew > counterInputMaxCount){
			counterInputValueNew = counterInputMaxCount;
		}

		counterInput.val(counterInputValueNew);

		if(bAjax){
			Summ(el, counterInputValueNew, price);

			if(timerBasketUpdate){
				clearTimeout(timerBasketUpdate);
				timerBasketUpdate = false;
			}

			timerBasketUpdate = setTimeout(function(){
				BasketUpdate(el, counterInputValueNew);
				timerBasketUpdate = false;
			}, 700);
		}
	}
	// class input
	else if(bClassCount){
		var counterInputValueNew = counterInputValue;

		if(counterInputValueNew <= 0 || isNaN(counterInputValueNew)){
			counterInputValueNew = 1;
		}
		el.val(counterInputValueNew);

		if(bAjax){
			BasketUpdate(el, counterInputValueNew);
		}
	}

	if(!getCurUri && !el.closest('.basket.fly').length){
		buttonToCart.data('quantity', counterInputValueNew);
	}
}

BasketUpdate = function(el, counterInputValueNew){
	var	itemData = el.closest('[data-item]').data('item'),
		itemData = (typeof(arBasketItems) === 'object' && typeof(arBasketItems[itemData.ID]) === 'object' ? arBasketItems[itemData.ID] : itemData),
		buyBlock = el.closest('.buy_block'),
		buttonToCart = buyBlock.find('.to_cart'),
		getCurUri = $.trim($('input[name=getPageUri]').val())
		scrollTop = ($('.basket.fly').length ? $('.basket.fly .items_wrap').scrollTop() : ($('.basket_top:visible').length ? $('.basket_top .items:visible').scrollTop() : ''));

	if(typeof(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) !== 'undefined' && $.trim(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) === 'FLY' && $('.basket.fly').length){
		var bBasketFly = true;
	}

	if(typeof(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) !== 'undefined' && $.trim(arAllcorp2Options['THEME']['ORDER_BASKET_VIEW']) === 'HEADER' && $('.basket_top').length){
		var bBasketTop = true;
	}

	else{
		if(typeof(itemData) != 'undefined' && !isNaN(itemData.ID) && itemData.ID > 0){
			$.ajax({
				// url: arAllcorp2Options['SITE_DIR'] + 'ajax/basket_items.php',
				url: arAllcorp2Options['SITE_DIR'] + 'include/footer/site-basket.php',
				data: {itemData: itemData, quantity: counterInputValueNew},
			}).success(function(data){
				if(typeof(data) === 'object'){
					arBasketItems = data;
				}
				if(bBasketTop){
					$.ajax({
						url: arAllcorp2Options['SITE_DIR'] + 'include/footer/site-basket.php',
						type: 'POST',
						data: {'ajaxPost': 'Y'},
					}).success(function(html){
						buyBlock.removeClass('in');
						$('.ajax_basket').html(html);

						/*if(!getCurUri){
							setTimeout(function(){
								$('.basket_top .dropdown').addClass('expanded');
							}, 100);

							setTimeout(function(){
								$('.basket_top .dropdown').removeClass('expanded');
							}, 1000);
						}*/
					});
				}

				if(bBasketFly){
					$.ajax({
						url: arAllcorp2Options['SITE_DIR'] + 'include/footer/site-basket.php',
						type: 'POST',
						data: {'ajaxPost': 'Y'},
					}).success(function(html){
						if($('.basket.fly').length){
							$('.ajax_basket').html(html);
							$('.basket.fly .items_wrap').scrollTop(scrollTop);
						}
					});
				}

				var eventdata = {action:'loadBasket'};
				BX.onCustomEvent('onCompleteAction', [eventdata, $(data)]);

				if(getCurUri){
					$.ajax({
						url: getCurUri,
						type: 'POST',
					}).success(function(html){
						if($('.basket.default').length){
							$('.basket.default').html(html);
						}
					});
				}
			});
		}
		else{
			return;
		}
	}
}

showTopIcons = function(){
	$('h1').addClass('shares');
	$(document).ready(function(){
		if($('a.rss').length)
			$('a.rss').after($('.share.top'));
		else
			$('h1').before($('.share.top'));
	})
}

CheckTabActive = function(){
	if(typeof(clicked_tab) && clicked_tab)
	{
		/*if(window.matchMedia('(min-width: 768px)').matches)
		{
			clicked_tab--;
			$('.catalog.detail .nav.nav-tabs li:eq('+clicked_tab+')').addClass('active');
			$('.catalog.detail .tab-content .tab-pane:eq('+clicked_tab+')').addClass('active');
			$('.catalog.detail .tab-content .tab-pane .title-tab-heading').next().removeAttr('style');
			clicked_tab = 0;
		}*/
	}
}

/* parallax bg */
ParallaxBg = function(){
	if($('*[data-type=parallax-bg]').length)
	{
		var x = $(window).scrollTop()/$(document).height();
		x=parseInt(-x * 280);
		$('*[data-type=parallax-bg]').stop().animate({'background-position-y':  x + 'px'}, 400, 'swing');
	}
}
SetFixedAskBlock = function(){
	if($('.ask_a_question_wrapper').length)
	{
		var offset = $('.ask_a_question_wrapper').offset(),
			block = $('.ask_a_question_wrapper').find('.ask_a_question'),
			block_offset = BX.pos(block[0]),
			block_height = block_offset.bottom-block_offset.top,
			ask_block_offset = 130,
			diff_top_scroll = $('#headerfixed').height() + 20,
			footer_block = $('footer').offset().top;

		if(block_height+ask_block_offset < block.closest('.fixed_wrapper').height())
		{
			if(block_height+ask_block_offset > block.closest('.fixed_wrapper').height())
				block.addClass('nonfixed');
			else
				block.removeClass('nonfixed');

			if(block.closest('.fixed_wrapper').length)
				footer_block = BX.pos(block.closest('.fixed_wrapper')[0]).bottom;


			if(block_height+diff_top_scroll+documentScrollTopLast + 80 > footer_block)
			{
				block.removeClass('fixed').css({'top': 'auto', 'width': 'auto', 'bottom': 0}).addClass('normal');
				block.parent().css('position', 'static');
				block.parent().parent().css('position', 'static');
			}
			else
			{
				block.removeClass('normal');
				block.parent().removeAttr('style');
				block.parent().parent().removeAttr('style');

				if(documentScrollTopLast + diff_top_scroll-30 > offset.top)
					block.addClass('fixed').css({'top': diff_top_scroll, 'bottom': 'auto', 'width': $('.fixed_block_fix').width()});
				else
					block.removeClass('fixed').css({'top': 0, 'width': 'auto'});
			}
		}
	}
}


// Events
var timerScroll = false, ignoreScroll = [], documentScrollTopLast = $(document).scrollTop(), documentScrollTop = $(document).scrollTop();;
$(window).scroll(function(){
	documentScrollTop = $(document).scrollTop();
	CheckPopupTop();
	SetFixedAskBlock();
	if(!ignoreScroll.length){
		if(timerScroll){
			clearTimeout(timerScroll);
			timerScroll = false;
		}
		timerScroll = setTimeout(function(){
			BX.onCustomEvent('onWindowScroll', false);
		}, 100);
	}
	documentScrollTopLast = $(document).scrollTop();
});

var timerResize = false, ignoreResize = [];

$(window).resize(function(){
	documentScrollTop = $(document).scrollTop();

	var scrollTimer = setInterval(function(){
		if(typeof(arAllcorp2Options) !== 'undefined') {
			CheckPopupTop();
			CheckScrollToTop();
			clearInterval(scrollTimer);
		}
	});

	if(!ignoreResize.length){
		if(timerResize){
			clearTimeout(timerResize);
			timerResize = false;
		}
		timerResize = setTimeout(function(){
			BX.onCustomEvent('onWindowResize', false);
		}, 100);
	}
	documentScrollTopLast = $(document).scrollTop();

	if(arAllcorp2Options['THEME']['COMPACT_FOOTER_MOBILE'] == 'Y') {
	    if (window.matchMedia('(max-width:767px)').matches) {
			$('footer').addClass('mobile');
			$('.bottom-menu .items>.wrap_compact_mobile').addClass('accordion-body collapse');
			$('.bottom-menu .items>.item-link').attr('data-toggle','collapse');
	    } else {
	    	$('footer').removeClass('mobile');
	    	$('.bottom-menu .items>.wrap_compact_mobile').removeClass('accordion-body collapse');
	    	$('.bottom-menu .items>.item-link').removeAttr('data-toggle');
	    }
	}
});

BX.addCustomEvent('onWindowScroll', function(eventdata) {
	try{
		ignoreScroll.push(true);
		ParallaxBg();

		if(arAllcorp2Options['THEME']['TYPE_SEARCH'] != 'fixed')
		{
			if(!$('header > .top-block').length)
			{
				var height_block = 0,
					scrollVal = $(window).scrollTop();
				height_block = $('.logo_and_menu-row').actual('outerHeight');
				if(!scrollVal)
				{
					$('.inline-search-block').css({
						'height': height_block,
						'line-height': height_block-4+'px',
						'top': -height_block
					})
				}
			}
		}

	}
	catch(e){}
	finally{
		ignoreScroll.pop();
	}
});

BX.addCustomEvent('onWindowResize', function(eventdata) {
	try{
		ignoreResize.push(true);

		CheckHeaderFixedMenu();
		CheckTopMenuDotted();
		CheckTopVisibleMenu();
		CheckFlexSlider();
		CheckMainBannerSliderVText($('.banners-big .flexslider'));
		CheckObjectsSizes();
		CoverPlayer();
		verticalAlign();
		CheckTabActive();
		setTimeout(function(){
			createTableCompare($('.main-block .items .title-block:not(.clone) .item'), $('.prop_title_table'), $('.main-block .prop_title_table .item.clone'));
		}, 100);
		SliceHeightBlocks();
	}
	catch(e){}
	finally{
		ignoreResize.pop();
	}
});

BX.addCustomEvent('onSlide', function(eventdata) {
	try{
		ignoreResize.push(true);
		if(eventdata){
			var slider = eventdata.slider;
			if(slider){
				// add classes .curent & .shown to slide
				slider.find('.item').removeClass('current');
				var curSlide = slider.find('.item.flex-active-slide');
				var curSlideIndex = curSlide.attr('data-slide_index');

				curSlide.addClass('current');
				slider.find('.item[data-slide_index=' + curSlideIndex + ']').addClass('shown');
				slider.resize();

				if(typeof(curSlideIndex) !== 'undefined' && curSlideIndex.length){
					// set main banners text vertical center
					CheckMainBannerSliderVText(slider);

					if($('.item.vvideo'))
					{
						$('.item.vvideo .maxwidth-theme').removeClass('loading');
						$('.item.vvideo .maxwidth-theme .btn-video').removeClass('loading');
						$('.item.vvideo[data-video_autoplay=1] .maxwidth-theme').addClass('loading');
						$('.item.vvideo[data-video_autoplay=1] .maxwidth-theme .btn-video').addClass('loading');
					}

					// pause play video
					if(typeof(players) !== 'undefined' && players){
						for(var j in players){
							if(players[j].playing && !players[j].clone && (players[j].slideIndex != curSlideIndex)){
								if((typeof window[players[j].id] == 'object')){
									if(players[j].videoPlayer === 'YOUTUBE'){
										window[players[j].id].pauseVideo()
									}
									else if(players[j].videoPlayer === 'VIMEO'){
										window[players[j].id].pause()
									}
									else if(players[j].videoPlayer === 'RUTUBE'){
										document.getElementById(players[j].id).contentWindow.postMessage(JSON.stringify({
										    type: 'player:pause',
										    data: {}
										}), '*')
									}
									else if(players[j].videoPlayer === 'HTML5'){
										document.getElementById(players[j].id).pause()
									}
								}
							}
						}
					}
					// autoplay video
					var bVideoAutoPlay = curSlide.attr('data-video_autoplay') == 1
					if(bVideoAutoPlay){
						startMainBannerSlideVideo(curSlide)
					}
				}
				else
				{
					slider.find('.item').css('opacity', '1');
				}
				if(slider.closest('.blocks').length)
					slider.closest('.blocks').find('.flex-direction-nav li').addClass('initied');

				if(slider.closest('.wraps').length)
					slider.closest('.wraps').find('.flex-direction-nav li').addClass('initied');

				if(!slider.find('.flex-control-nav li').length && slider.hasClass('normal'))
				{
					slider.find('.flex-direction-nav li a').addClass('flex-disabled');
				}

				if(slider.closest('.banners-big').length)
				{
					// var curSlide = slider.find('.item.flex-active-slide');
					//logo src
					var bLogoImg = $('header .logo-block .logo img').length;
					if(bLogoImg)
						$('header .logo-block .logo img').attr('src', arAllcorp2Options.THEME.LOGO_IMAGE)

					//nav flex color
					slider.find('.flex-control-nav li').removeClass();

					//header color
					$('header').removeClass('light dark');
					if(typeof(curSlide.data('color')) != 'undefined')
					{
						slider.find('.flex-control-nav li').addClass(curSlide.data('color'));
						$('header').addClass(curSlide.data('color'));
						if(bLogoImg)
						{
							if(arAllcorp2Options.THEME.LOGO_IMAGE_LIGHT && curSlide.data('color') == 'light')
								$('header .logo-block .logo img').attr('src', arAllcorp2Options.THEME.LOGO_IMAGE_LIGHT)
						}
					}
				}

				if(!slider.hasClass('flexslider-init-slice') && slider.hasClass('nav-title') && $('.gallery-block').closest('.tab-pane').hasClass('active'))
				{
					slider.find('.item').sliceHeight({'lineheight': -3});
					slider.addClass('flexslider-init-slice');
				}

				if(slider.find('.flex-direction-nav').length){
					if(slider.find('.flex-direction-nav').find('a.flex-disabled').length)
						slider.find('.flex-direction-nav').removeClass('opacity1').addClass('opacity0');
					else
						slider.find('.flex-direction-nav').removeClass('opacity0').addClass('opacity1');
				}
			}
		}
	}
	catch(e){}
	finally{
		ignoreResize.pop();
	}
});

BX.addCustomEvent('onSlideBefore', function(eventdata) {
	try
	{
		ignoreResize.push(true);
		if(eventdata)
		{
			var slider = eventdata.slider;
			if(slider)
			{
				if(slider.closest('.banners-big').length)
				{
					setTimeout(function(){
						var curSlide = slider.find('.item.flex-active-slide');
						//logo src
						var bLogoImg = $('header .logo-block .logo img').length;
						if(bLogoImg)
							$('header .logo-block .logo img').attr('src', arAllcorp2Options.THEME.LOGO_IMAGE)

						//nav flex color
						slider.find('.flex-control-nav li').removeClass();

						//header color
						$('header').removeClass('light dark');
						if(typeof(curSlide.data('color')) != 'undefined')
						{
							slider.find('.flex-control-nav li').addClass(curSlide.data('color'));
							$('header').addClass(curSlide.data('color'));
							if(bLogoImg)
							{
								if(arAllcorp2Options.THEME.LOGO_IMAGE_LIGHT && curSlide.data('color') == 'light')
									$('header .logo-block .logo img').attr('src', arAllcorp2Options.THEME.LOGO_IMAGE_LIGHT)
							}
						}
					}, 100)
				}
				else if(slider.hasClass('top-bigs'))
				{
					setTimeout(function(){
						var index = slider.find('.item.flex-active-slide').data('slide_key');
						$('.bxSlider.top-small .slides').data('bxSlider').goToSlide(index);
						$('.bxSlider.top-small .slides li').removeClass('flex-active-slide');
						$('.bxSlider.top-small .slides li[data-slide_key="'+index+'"]').addClass('flex-active-slide');
					}, 100)
				}
			}
		}
	}
	catch(e){}
	finally{
		ignoreResize.pop();
	}
});

BX.addCustomEvent('onSlideEnd', function(eventdata) {
	try
	{
		ignoreResize.push(true);
		if(eventdata)
		{
			var slider = eventdata.slider;
			if(slider)
			{

			}
		}
	}
	catch(e){}
	finally{
		ignoreResize.pop();
	}
});

$(window).resize(function(){
	CheckTopMenuPadding();
	CheckTopMenuOncePadding();
	CheckSearchWidth();
});

var onCaptchaVerifyinvisible = function(response){
	$('.g-recaptcha:last').each(function(){
		var id = $(this).attr('data-widgetid');
		if(typeof(id) !== 'undefined' && response){
			if(!$(this).closest('form').find('.g-recaptcha-response').val())
				$(this).closest('form').find('.g-recaptcha-response').val(response)
			if($('iframe[src*=recaptcha]').length)
			{
				$('iframe[src*=recaptcha]').each(function(){
					var block = $(this).parent().parent();
					if(!block.hasClass('grecaptcha-badge'))
						block.css('width', '100%');
				})
			}
			if($(this).closest('form').attr('name') == 'form_comment')
				BX.submit(BX('form_comment'));
			else
				$(this).closest('form').submit();
		}
	})
}

var onCaptchaVerifynormal = function(response){
	$('.g-recaptcha').each(function(){
		var id = $(this).attr('data-widgetid');
		if(typeof(id) !== 'undefined'){
			if(grecaptcha.getResponse(id) != ''){
				$(this).closest('form').find('.recaptcha').valid();
			}
		}
	});
}

BX.addCustomEvent('onSubmitForm', function(eventdata){
	try{
		if(!window.renderRecaptchaById || !window.asproRecaptcha || !window.asproRecaptcha.key)
		{
			eventdata.form.submit();
			$(eventdata.form).closest('.form').addClass('sending');
			return true;
		}
		if(window.asproRecaptcha.params.recaptchaSize == 'invisible' && typeof grecaptcha != 'undefined')
		{
			if($(eventdata.form).find('.g-recaptcha-response').val())
			{
				eventdata.form.submit();
				$(eventdata.form).closest('.form').addClass('sending');
			}
			else
			{
				grecaptcha.execute($(eventdata.form).find('.g-recaptcha').data('widgetid'));
				return false;
			}
		}
		else
		{
			eventdata.form.submit();
			$(eventdata.form).closest('.form').addClass('sending');
		}

		return true;
	}catch (e){
		console.error(e);
		return true;
	}
});