/*
    Fonts are loaded through @font-face rules in the CSS whenever an element references them.
    FontFaceObserver creates a referencing element to trigger the font request, and lsisten for font load events.
    When all 3 fonts are loaded, we enable them by adding a class to the html element
*/
(function webfontController ( w ){
    // if the class is already set, we're good.
    if( w.document.documentElement.className.indexOf( "fonts-loaded" ) > -1 ){
        return;
    }
    var fontAObserver = new w.FontFaceObserver( "Comfortaa", {});
    w.Promise
        .all([fontAObserver.check()])
        .then(function webfontPromise (){
            w.document.documentElement.className += " fonts-loaded";
            // set cookie so that for this session the cached fonts are immediately available
            document.cookie = "fonts-loaded=1; path=/";
        });
}( this ));
