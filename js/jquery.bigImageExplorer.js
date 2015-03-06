/*!
 * jQuery Big Image Explorer
 * Author:    Nepomuk Leutschacher [http://nepomuc.com]
 * License:   MIT
 * Version:   1.0 (2015-03-06)
 * Origin:    https://github.com/nepomuc/big-image-explorer
 */

// Wrap IIFE around code
(function($, viewport){
    
    $.fn.bigImageExplorer = function( options ) {
    
        // Settings...
        var settings = $.extend({
            // These are the defaults.
            zoomedImageContainers: $('.zoomedImageContainer'),
            zoomDuration: 350,
            zoomEasing: 'swing',
            zoomBtn: '<button class="btn btn-primary btn-lg">Zoom</button>'
        }, options );

        
        
        //How Modernizr detects touch devices
        function isTouchDevice() {  
          try {  
            document.createEvent("TouchEvent");  
            return true;  
          } catch (e) {  
            return false;  
          }
        }

        //trying to exclude new notebooks with touch-displays
        function isTabletOrSmartphone() {
            return ((ResponsiveBootstrapToolkit.is('xs') || ResponsiveBootstrapToolkit.is('sm')) && isTouchDevice());
        }

        function getRealImageDimensions(url) {
            var dimensions = {};
            var img = new Image();
            img.src = url;
            dimensions.height = img.height,
            dimensions.width = img.width;
            return dimensions;
        }

        var mousePosition = {};
        settings.zoomedImageContainers.mousedown(function(e) {
            $(this).data('bie-last-pageX', e.pageX);
        });

        function calcImageCssLeft(containerObj,pageX,imgWidth) {
            if(typeof containerObj === 'object') {
                if(typeof imgWidth === 'undefined') {
                    var imgWidth = $(containerObj).find('img').outerWidth();
                }
                //variables for better readability. They can be combined for better performance @ live stage.
                var containerOffset = $(containerObj).offset();
                var left = pageX-containerOffset.left;
                var leftRelative = left / $(containerObj).outerWidth();
                var overflow = imgWidth - $(containerObj).outerWidth();
                return String(overflow*leftRelative * -1)+'px';
            }
            else {
                return '0px';
            }
        }

        function refreshImage(containerObj, breakpoint) {
            if(typeof breakpoint === 'undefined') {
                var breakpoint = viewport.current();
            }
            var img = $(containerObj).find('img');
            var realImageDimensions = getRealImageDimensions(img.attr('src'));
            var imgState = $(containerObj).data('bie-state'); //== 'init' OR 'zoom'
            var imgSize = $(containerObj).data('bie-'+imgState+'-'+breakpoint);
            var imgWidthProcessed = '100%';
            var imgWidthProcessedFloat = 100;
            if(imgSize == 'fit') {
                imgWidthProcessedFloat = (100 * $(containerObj).outerWidth())/100;
                imgWidthProcessed = '100%';
            }
            else {
                imgWidthProcessedFloat = (imgSize * realImageDimensions.width)/100;
                imgWidthProcessed = String(imgWidthProcessedFloat)+'px';
            }
            imgLeftProcessed = ($('body').hasClass('bie-is-touch')) ? ('0px') : (calcImageCssLeft(containerObj,$(containerObj).data('bie-last-pageX'),imgWidthProcessedFloat));
            $(containerObj).unbind("mousemove");
            if($(containerObj).data('bie-is-virgin')) {
                $(img).css({width:imgWidthProcessed, left:imgLeftProcessed});
                $(containerObj).removeData('bie-is-virgin');
            }
            else {
                $(img).animate({
                    width: imgWidthProcessed,
                    left: imgLeftProcessed
                }, settings.zoomDuration, settings.zoomEasing, function() {
                    bindMouseMove();
                });
            }
        }

        function refreshImages() {
            //caching breakpoint/viewport-val in var for performance
            var breakpoint = viewport.current();
            $.each(settings.zoomedImageContainers, function (k,el) {
                $(el).data('bie-last-pageX', 0 + $(el).offset().left);
                $(el).data('bie-is-virgin', 1);
                refreshImage(el,breakpoint);
            });
        }

        function bindMouseMove() {
            if(isTabletOrSmartphone()) {
                $('body').addClass('bie-is-touch');
            }
            else {
                settings.zoomedImageContainers.mousemove(function(e) {
                    $(this).find('img').css({'left': calcImageCssLeft(this,e.pageX)});
                });
            }
        }
        
        bindMouseMove();

        //applying styles for containers & images
        settings.zoomedImageContainers.addClass('bie-container');
        settings.zoomedImageContainers.find('img').wrap('<div class="bie-image-container"></div>');
        //adding the zoom-button
        settings.zoomBtn.addClass('bie-zoom-btn');
        settings.zoomedImageContainers.append(settings.zoomBtn);
        //init
        refreshImages();

        settings.zoomedImageContainers.click(function(e) {
            if($(this).data('bie-state') == 'init') {
                $(this).data('bie-state','zoom');
                $(this).find('.bie-zoom-btn').fadeOut();
            }
            else {
                $(this).data('bie-state','init');
                $(this).find('.bie-zoom-btn').fadeIn();
            }
            refreshImage(this);
        });

        // Execute code each time window size changes
        $(window).bind('resize', function() {
            viewport.changed(function(){
                refreshImages();
            });
        });
        
    };

})(jQuery, ResponsiveBootstrapToolkit);