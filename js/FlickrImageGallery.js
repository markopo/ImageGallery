var FlickrImageGallery = (function() {
    var priv = {};
    priv.application = "#flickr-application";
    priv.url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key={api_key}&text={text}&per_page={per_page}&page={page}&format=json";
    priv.script = null;
    priv.scriptId = "flickr-search-script";
    priv.isComplete = false;
    priv.Photos = null;
    priv.numPhotosShow = 15;
    priv.perpage = 15;
    priv.page = 1;
    priv.text = null;
    priv.carouselIndex = 0;

    /* DOM helper */
    var $ = function(elem){
        return document.querySelector(elem);
    };

    var $$one = function(elem){
       return document.querySelector(priv.application + " " + elem);
    };

    var $$list = function(elem) {
        return document.querySelectorAll(priv.application + " " + elem);
    }

    var application = function() {
        return $(priv.application);
    };

    var imageGallery = function(){
       return $$one(".image-gallery");
    };

    var mainCarousel = function() {
        return $$one(".main-carousel");
    };
    /* end DOM helper */

    /* Private methods */

    priv.makeFlickrUrl = function() {
        priv.url = priv.url.replace("{api_key}", priv.settings.api_key);
        priv.url = priv.url.replace("{text}", priv.text);
        priv.url = priv.url.replace("{per_page}", priv.perpage);
        priv.url = priv.url.replace("{page}", priv.page);
    };

    priv.loadjsonFlickrApi = function() {

        window.jsonFlickrApi = function (rsp) {
            window.FlickrPhotos = rsp;
        };

    };

    priv.createScript = function() {
        priv.script = document.createElement("script");
        priv.script.id = priv.scriptId;
        priv.script.src = priv.url;
        document.getElementsByTagName("body")[0].appendChild(priv.script);

        priv.script.onload = function() {

            priv.isComplete = true;
        };
    };

    priv.search = function() {
        var flickrScript = document.getElementById(priv.scriptId);

        if(flickrScript != null|undefined|""){
            document.getElementsByTagName("body")[0].removeChild(flickrScript);
        }

        priv.createScript();
    };

    priv.makeUrl = function(photo, size) {
        var url = "https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_{size}.jpg";
        return url.replace("{farm-id}", photo.farm)
            .replace("{server-id}", photo.server)
            .replace("{id}", photo.id)
            .replace("{secret}", photo.secret)
            .replace("{size}", size);
    };

    priv.makeSmallUrl = function(photo){
        // q - large square 150x150
        return priv.makeUrl(photo, "q");
    };

    priv.makeBigUrl = function(photo){
       // b - large, 1024 on longest side
       return priv.makeUrl(photo, "b");
    };

    priv.replaceSmallToBigUrl = function(src){
        return src.replace("_q.jpg", "_b.jpg");
    };
    /* End private methods */

    /* dom-writing methods */
    priv.makePhoto = function(photo){
        var html = [];
        try {
            html.push("<div class='square' id='square-" + photo.id + "' title='" + photo.title + "' >");
            html.push("<img class='photo' alt='" + photo.title + "' id='photo-" + photo.id + "' src='" + priv.makeSmallUrl(photo) + "' />");
            html.push("</div>");
        }
        catch(ex){
         // alert("Failed to load image: " + ex.message);
        }
        return html.join('');
    };

    priv.buildGallerySkeleton = function() {
        var html = [];
        html.push("<div class=\"navigation\">");
        html.push("<div class='navigation-container'>");
        html.push("<h2>Photos</h2>");
        html.push("<input type=\"text\" id=\"search\" name=\"search\" class=\"search\" placeholder='Search' value=\"\" />");
        html.push("</div>");
        html.push("</div>");
        html.push("<div class=\"main-carousel\">");
        html.push("</div>");
        html.push("<div class=\"image-gallery\"></div>");
        html.push("<br style='clear:both;' />");
        html.push("<div class='image-gallery-paging'></div>");
        return html.join('');
    };
    
    priv.makeCarousel = function () {
        var html = [];
        html.push("<div class='brown-background'></div>");
        html.push("<div class='carousel-image-container' ></div>");
        html.push("<span class='carousel-left-arrow'><img src='images/back.png' /></span><span class='carousel-right-arrow'><img src='images/forward.png' /></span>");
        html.push("<div class='carousel-text'><h4></h4><div class='carousel-share'>share <span class='social'><img class='social-arrow-down' src='images/arrow-down.png' /></span></div></div>");
        return html.join('');
    };

    priv.setFirstImageCarousel = function(index) {
        if(priv.Photos != null && priv.Photos.photo.length > 0) {
            try {
                var firstPhoto = priv.Photos.photo[index];
                var url = priv.makeBigUrl(firstPhoto);
                return "<img class='carousel-photo' alt='" + firstPhoto.title + "' id='carousel-photo-" + firstPhoto.id + "' src='" + url + "'  />";
            }
            catch(ex){
              //  alert("Failed to load image: " + ex.message);
            }
        }
        return null;
    };

    priv.writeImageGallery = function() {
        var html = [];
        if(priv.Photos != null){
            try {
                var photos = priv.Photos.photo;
                var photosLen = photos.length;

                if(photosLen > 0) {
                    for (var i = 0; i < priv.numPhotosShow; i++) {
                        var photo = photos[i];
                        if(photo != null || photo != undefined) {
                            html.push(priv.makePhoto(photo));
                        }
                    }
                }
                else {
                    alert("Search didn't find any photos! Try again, please!");
                }
            }
            catch(ex){
                alert("Failed loading images from Flickr: " + ex.message);
            }
        }
        return html.join('');
    };

    priv.writeImageGalleryDummy = function() {
        var html = [];
        for(var i=0;i<priv.numPhotosShow;i++){
            html.push("<div class='square'><div class='dummy-photo'></div></div>");
        }
        return html.join('');
    };

    priv.fillDummyBoxes = function() {

        mainCarousel().innerHTML = "<div class='dummy-carousel'></div>";
        imageGallery().innerHTML = priv.writeImageGalleryDummy();

    };

    priv.writePaging = function() {
        var html = [];
        if(priv.Photos != null && priv.Photos.photo.length > 0) {
            try {
                html.push("<div class='paging-container' data-pages='" + priv.Photos.pages + "' data-total='" + priv.Photos.total + "' data-page='" + priv.Photos.page + "' >");
                html.push("<span class='paging' id='flickr-application-gallery-paging-first'> << </span>");
                html.push("<span class='paging' id='flickr-application-gallery-paging-minus'> < </span>");

                var pages = (priv.Photos.pages < 6) ? priv.Photos.pages : 6;
                var page = priv.page;
                var total = page+pages;

                for(var i=page;i<total;i++) {
                    var disabled = (i > priv.Photos.pages) ? "disabled" : "";
                    html.push("<span class='paging " + disabled  + "' id='flickr-application-gallery-paging-" + i + "' > " + i + " </span>");
                }

                html.push("<span class='paging' id='flickr-application-gallery-paging-plus'> > </span>");
                html.push("<span class='paging' id='flickr-application-gallery-paging-last'> >> </span>");
                html.push("</div>");
            }
            catch(ex){
                // console.log(ex.message);
            }
        }
        return html.join('');
    };

    priv.writeCarousel = function() {
        var firstCarouselImage = priv.setFirstImageCarousel(priv.carouselIndex);
        if(firstCarouselImage != null) {
            $$one(".carousel-image-container").innerHTML = firstCarouselImage;
            $$one(".main-carousel .carousel-text h4").innerHTML = priv.Photos.photo[priv.carouselIndex].title;

        }
    };

    priv.writeToUI = function() {
        if(priv.Photos != null) {
            imageGallery().innerHTML = priv.writeImageGallery();
            mainCarousel().innerHTML = priv.makeCarousel();
            priv.writeCarousel();
            $$one(".image-gallery-paging").innerHTML = priv.writePaging();
        }
    };

    priv.loadData = function() {
        var interval = setInterval(function () {
            if(priv.isComplete){
                clearInterval(interval);
                priv.Photos = window.FlickrPhotos.photos;
                priv.writeToUI();
                priv.setupGalleryEvents();
            }
        }, 100);
    };

    /* End dom-writing methods */

    /* Event handlers */
    priv.setUpSearchEvents = function() {
        $$one("input.search").onblur = function(){
            var that = this;
            var text = that.value;

            if(text.length > 2) {
                priv.searchAgain(text);
            }
        };
    };


    priv.setupGalleryEvents = function () {

        // Carousel
        $$one(".main-carousel .carousel-left-arrow").onclick = function() {
                if(priv.carouselIndex > 0) {
                    priv.carouselIndex -= 1;
                    priv.writeCarousel();
                }
        };

        $$one(".main-carousel .carousel-right-arrow").onclick = function() {
                if(priv.carouselIndex < priv.numPhotosShow){
                    priv.carouselIndex += 1;
                    priv.writeCarousel();
                }
        };


        // Imagegallery images eventhandlers
        var imagePhotos =  $$list("img.photo");

        for(var i=0;i<imagePhotos.length;i++){

            imagePhotos[i].onclick = function() {
                var that = this;
                var id = that.id;
                var src = that.src;
                var alt = that.alt;

                var carouselPicture = $$one(".carousel-photo");
                carouselPicture.id = id;
                carouselPicture.src = priv.replaceSmallToBigUrl(src);
                carouselPicture.alt = alt;

                $$one(".main-carousel .carousel-text h4").innerHTML = alt;
            };


        }
        // End image eventhandlers


        // Paging
        var pagingList = $$list(".image-gallery-paging span.paging");
        for(var p=0;p<pagingList.length;p++){
            pagingList[p].onclick = function () {
                var that = this;
                var id = that.id.replace("flickr-application-gallery-paging-", "");
                var oldpage = priv.page;
                var isDisabled = that.className.indexOf("disabled") > -1;

                if(priv.Photos != null && priv.Photos.photo.length > 0 && !isDisabled) {
                    try {
                        var page = priv.Photos.page;
                        var pages = priv.Photos.pages;
                    }
                    catch(ex){
                        alert(ex.message);
                    }

                    switch (id) {
                        case "first":
                            priv.page = 1;
                            break;
                        case "minus":
                            if (page > 1) {
                                priv.page -= 1;
                            }
                            break;
                        case "1":
                            if (pages >= 1) {
                                priv.page = 1;
                            }
                            break;
                        case "2":
                            if (pages >= 2) {
                                priv.page = 2;
                            }
                            break;
                        case "3":
                            if (pages >= 3) {
                                priv.page = 3;
                            }
                            break;
                        case "4":
                            if (pages >= 4) {
                                priv.page = 4;
                            }
                            break;
                        case "5":
                            if (pages >= 5) {
                                priv.page = 5;
                            }
                            break;
                        case "6":
                            if (pages >= 6) {
                                priv.page = 6;
                            }
                            break;
                        case "plus":
                            if (page < pages) {
                                priv.page += 1;
                            }
                            break;
                        case "last":
                            priv.page = pages;
                            break;
                    }

                    priv.url = priv.url.replace("&page=" + oldpage.toString() + "", "&page=" + priv.page.toString());

                    priv.searchAgain(priv.text);

                }


            };
        }
        // End Paging


    };
    /* End Event handlers */

    /**** MAIN METHODS *** /
    /* Module onload method */
    priv.onload = function() {

        /* check hash */
        if ("onhashchange" in window) {
            var hash = window.location.hash.toString().replace("#", "");
            priv.text = hash;
        }

        /* build UI */
        if($$one(".navigation") == undefined) {
            application().setAttribute("role", "application");
            application().innerHTML = priv.buildGallerySkeleton();
            priv.setUpSearchEvents();
        }

        /* fetch data & load to UI */
        priv.makeFlickrUrl();
        priv.isComplete = false;
        if(priv.text != null) {
            priv.loadjsonFlickrApi();
            priv.search();
            priv.loadData();
        }
        else {
            // fill dummy boxes
            priv.fillDummyBoxes();
        }

        window.scrollTo(0, 0);
        $$one("input.search").focus();

    };
    /* End Module load */

    /* Search method */
    priv.searchAgain = function(text){

        priv.isComplete = false;
        priv.url = priv.url.replace(priv.text, text);
        priv.text = text;
        priv.loadjsonFlickrApi();
        priv.search();
        priv.loadData();

    };
    /* End search method */


    /* hash change */
    if ("onhashchange" in window) {
        window.onhashchange = function() {
            var text = window.location.hash.toString().replace("#", "");
            priv.searchAgain(text);
        };
    }
    /* end hashchange */


    /*** END MAIN METHODS ***/

    return {
        init: function(settings) {
            priv.settings = settings;
            priv.onload();
        }
    };
});