/*!
	photobox v1
	(c) 2012 Yair Even Or <http://dropthebit.com>
	
	based (~15%) on Picbox v2.2 from:
	(c) 2010 Ben Kay <http://bunnyfire.co.uk>

	which is by itself based on code from Slimbox v1.7 - The ultimate lightweight Lightbox clone
	(c) 2007-2009 Christophe Beyls <http://www.digitalia.be>

	MIT-style license.
*/

(function($, doc){
	var win = $(window), options, images=[], thumbs, imageLinks, activeImage = -1, activeURL, prevImage, nextImage, middleX, middleY, docElm, imageTitle='',
		transitionend = "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
		transformOrigin, thumbsContainerWidth, thumbsTotalWidth, activeThumb = $(),

	// Preload images
	preload = {}, preloadPrev = new Image(), preloadNext = new Image(),
	// DOM elements
	overlay, closeBtn, image, prevBtn, nextBtn, caption,
	
	defaults = {
		loop: true,						// Allows to navigate between first and last images
		thumbs: true,					// Show gallery thumbnails below the presented photo
		counter: true,					// Counter text. Use {x} for current image and {y} for total e.g. Image {x} of {y}
		title: true,					// show the original alt or title attribute of the image's thumbnail
		hideFlash: true,				// Hides flash elements on the page when photobox is activated. NOTE: flash elements must have wmode parameter set to "opaque" or "transparent" if this is set to false
		keys: {
            close: '27, 88, 67',		// keycodes to close Picbox, default: Esc (27), 'x' (88), 'c' (67)
            prev:  '37, 80',            // keycodes to navigate to the previous image, default: Left arrow (37), 'p' (80)
            next:  '39, 78'             // keycodes to navigate to the next image, default: Right arrow (39), 'n' (78)
		}
	}
	/*
		Initialization
	*/
	$(doc).ready(function(){
		$(doc.body).prepend(
			$([
				overlay = $('<div id="pbOverlay">').hide().on('click', close).append(
					imageWrap = $('<div class="pbLoader"><b></b><b></b><b></b></div>'),
					prevBtn = $('<div id="pbPrevBtn" class="prevNext"><b></b></div>').on('click', next_prev),
					nextBtn = $('<div id="pbNextBtn" class="prevNext"><b></b></div>').on('click', next_prev),
					imageWrap = $('<div class="imageWrap">').append(
						image = $('<img>')[0]
					)[0],
					closeBtn = $('<div id="pbCloseBtn">').append('<b>×</b>').on('click', close)[0],
					caption = $('<div id="pbCaption">').append('<div class="title">').append('<div class="counter">')
				)[0],
			])
		);
		
		transformOrigin = getPrefixed('transformOrigin');
	});
	
	$.photobox = function(startImage, _options){
		options = $.extend(defaults, _options || {});

		jQuery.browser.msie && $(overlay).addClass('msie');
		
		setup(1);
		
		// remove the counter if there are no images to count...
		if( images.length < 2 )
			caption.find('.counter').remove();

		// options.loop = options.loop && (images.length > 1);
			
		return changeImage(startImage, true);
	}

	$.fn.photobox = function(_options, linkMapper){
		imageLinks = this; // all links
		
		imageLinks.each(function(i){
			var link = this;
			images[i] = [link.href, link.firstChild.getAttribute('alt') || link.firstChild.getAttribute('title')];
		});
		
		// generate gallery thumbnails
		if( defaults.thumbs || _options.thumbs )
			generateThumbs(imageLinks);
		
		// removed in favor of event delegation
		//$(imageLinks).off('click').on('click', onClick );

		$(doc).on('click', this.selector, onClick);
		
		function onClick(e){
			e.preventDefault();

			// check if next and prev arrows should be activated
			if( images.length < 2 )
				$([prevBtn, nextBtn]).remove();
			
			// need this for later:
			docElm = doc.documentElement;
			return $.photobox( $.inArray(this, imageLinks), _options);
		};

		return this;
	}
	
	function generateThumbs(imageLinks){
		thumbs = $('<div>').addClass('pbThumbs');
		var thumbsList = $('<ul>').appendTo(thumbs);
		thumbs.appendTo(caption);
		imageLinks.each(function(){
			$('<li>').append( $(this).clone() ).appendTo(thumbsList);
		});
		
		$(overlay).addClass('thumbs');
		thumbs.on('click', 'a', onClick_thumbs).data('a', thumbs.find('a'));
	}
	
	function onClick_thumbs(e){
		e.preventDefault();
		
		activeThumb.removeClass('active');
		activeThumb = $(this).parent().addClass('active');
			
		var imageIndex = $.inArray(this, $(e.delegateTarget).data('a'));
		return changeImage(imageIndex, 0, 1);
	}
	
	function getPrefixed(prop){
		var i, s = doc.body.style, v = ['ms','O','Moz','Webkit'];
		if( s[prop] == '' ) return prop;
		prop = prop[0].toUpperCase() + prop.slice(1);
		for( i = v.length; i--; )
			if( s[v[i] + prop] == '' )
				return (v[i] + prop);
	}
	
	function setup(open){
		// a hack to change the image src to nothing, because you can't do that in CHROME
		image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
		$(image).css({'transition':'0s'}).removeAttr('style'); // reset any transition that might be on the element

		$(overlay).show().addClass('show');

		// cancel prppogation up to the overlay container so it won't close
		$(overlay).on('click', 'img', function(e){
			e.stopPropagation();
		});
		
		// change the image css transition by addding a class "zoomable"
		$(overlay).on(transitionend, function(){
			$(image).addClass('zoomable');
			$(overlay).off(transitionend).addClass('on');
		});
		
		if( jQuery.browser.msie )
			$(overlay).trigger('MSTransitionEnd');

 		if( options.hideFlash ){
			$.each(["object", "embed"], function(i, val){
				$(val).each(function(){
					// jQuery 1.4 doesn't allow .data() on object tags
					if (open) this._picbox = this.style.visibility;
					this.style.visibility = open ? "hidden" : this._picbox;
				});
			});
		}
		
		var fn = open ? "on" : "off";
		$(doc)[fn]({ "keydown.photobox": keyDown, "mousewheel.photobox": scrollZoom });
		
		if( options.thumbs ){
			activeThumb.removeAttr('class');
			$(win).on('resize.photobox', thumbsWindowResize);
			thumbsWindowResize(); // initiate the function for the first time without any window resize
		}
	}
	
	function thumbsWindowResize(){
		thumbsContainerWidth = thumbs[0].clientWidth;
		thumbsTotalWidth = thumbs[0].firstChild.clientWidth;

		var state = thumbsTotalWidth > thumbsContainerWidth ? 'on' : 'off';
		thumbs[state]('mousemove', thumbsMove);
	}
	
	function thumbsMove(e){
		var ratio = thumbsTotalWidth / thumbsContainerWidth;
		thumbs[0].scrollLeft = e.pageX * ratio - 500;
	}
	
	function keyDown(event){
		var code = event.keyCode, ok = options.keys, result;
		// Prevent default keyboard action (like navigating inside the page)
		return ok.close.indexOf(code) >= 0 && close() ||
               ok.next.indexOf(code) >= 0 && next_prev('next') ||
               ok.prev.indexOf(code) >= 0 && next_prev('prev') || true;
	}
	
	function next_prev(direction){
		// don't get crazy when user clicks next or prev buttons rapidly
		if( $(pbOverlay).hasClass('hide') )
			return false;
		var img = (this.id == 'pbPrevBtn' || direction == 'prev') ? prevImage : nextImage,
			mouseOverThumbs = thumbs.css('clear') == 'both';
		
		return changeImage(img, 0, mouseOverThumbs);
	}
	
	function changeImage(imageIndex, firstTime, thumbClick){
		if( imageIndex >= 0 ){
			activeImage = imageIndex;
			activeURL = images[imageIndex][0];
			prevImage = (activeImage || (options.loop ? images.length : 0)) - 1;
			nextImage = ((activeImage + 1) % images.length) || (options.loop ? 0 : -1);

			stop();
			
			$(overlay).addClass("pbLoading");

			//$(number).html( (((images.length > 1) && options.counterText) || "").replace(/{x}/, activeImage + 1).replace(/{y}/, images.length) );
			
			!options.loop && imageIndex == images.length-1 ? nextBtn.addClass('hide') : nextBtn.removeClass('hide');
			!options.loop && imageIndex == 0 ? prevBtn.addClass('hide') : prevBtn.removeClass('hide');
			
			if( options.thumbs ){
				changeActiveThumb(imageIndex, firstTime, thumbClick);
			}
			
			if( prevImage >= 0 ) preloadPrev.src = images[prevImage][0]; 
			if( nextImage >= 0 ) preloadNext.src = images[nextImage][0]; 

			
			options.counter && caption.find('.counter').text('( ' + (activeImage + 1) + ' / ' + images.length + ' )');
			options.title && caption.find('.title').text( images[imageIndex][1] );
			
			preload = new Image();
			preload.onload = function(){ showImage(firstTime) };  // vsync
			preload.src = activeURL;
		}

		return false;
	}
	
	function changeActiveThumb(index, delay, thumbClick){
		activeThumb.removeClass('active');
		activeThumb = thumbs.find('li').eq(index).addClass('active');
		if( thumbClick ) return;
		// set the scrollLeft position of the thumbs list to show the active thumb
		var pos = activeThumb[0].offsetLeft + activeThumb[0].clientWidth/2 - docElm.clientWidth/2;
		
		delay && thumbs.delay(800);
		!delay && thumbs.stop();
		thumbs.animate({scrollLeft: pos},500, 'swing');
		//thumbs[0].scrollLeft = pos;
	}
	
	function showImage(firstTime){
		if( !firstTime ){
			$(image).on(transitionend, show);
			$(overlay).addClass('hide');
			jQuery.browser.msie && show();
		}
		else
			show();
		
		function show(){
			$(image).css({'transition':'0s'}).attr('class','prepare').hide().off(transitionend);
			
			$(overlay).removeClass('hide');
			$(image).attr("src", activeURL);
			
			// filthy hack but cannot work without it:
			setTimeout(function(){ 
				$(image).removeAttr('style');
				setTimeout(function(){ image.className = '' }, 0);
			}, 0);
		}
	
		$(overlay).removeClass("pbLoading");
	}
	
	function scrollZoom(e, delta){
		var zoomLevel = $(image).data('zoom') || 1,
			getSize = image.getBoundingClientRect();
		
		zoomLevel = zoomLevel + (delta / 10);

		if( zoomLevel < 0.1 )
			zoomLevel = 0.1;
		
		$(image).data('zoom', zoomLevel).css({'transform':'scale('+ zoomLevel +')'});
		
		// check if dragging should take effect (if image is larger than the window
		if( getSize.height > docElm.clientHeight || getSize.width > docElm.clientWidth )
			$(doc).on('mousemove.photobox', imageReposition);
		else{
			$(doc).off('mousemove.photobox');
			image.style[transformOrigin] = '50% 50%';
		}
		
		return false;
	}
	
	function imageReposition(e){
		var y = (e.pageY / docElm.clientHeight) * (docElm.clientHeight + 200) - 100, // extend the range of the Y axis by 100 each side
			yDelta = y / docElm.clientHeight * 100,
			xDelta = e.pageX / docElm.clientWidth * 100,
			origin = xDelta+'% ' + yDelta +'%';

		image.style[transformOrigin] = origin;
	}

	function stop(){
		preload.onload = function(){};
		preload.src = preloadPrev.src = preloadNext.src = activeURL;
	}

	function close(){
			stop();
			activeImage = prevImage = nextImage = -1;
			$(document).off('mousemove');
			setup();
			
			$(overlay).addClass('hide');

			$(image).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", hide);
			jQuery.browser.msie && hide();

			function hide(){
				$(overlay).removeClass('show hide on');
				$(image).removeAttr('class').removeAttr('src').removeAttr('style').off().data('zoom',1);
			}
			
			// fallback if the 'transitionend' method didn't catch
			setTimeout(hide, 500);

		return false;
	}

})(jQuery, document);