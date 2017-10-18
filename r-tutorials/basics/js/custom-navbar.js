
/*----------------------------------------------------------------------------------
   Author: Simon Ejdemyr
   License: Creative Commons Attribution-ShareAlike 4.0 International License
   Description: This code, when coupled with minimal html and css
     markup, ensures that a navbar affixes to the top of the screen
     when the user scrolls below the summary of the tutorial. The
     navbar is automatically populated with section 1 headings.
   Acknowledgements: developers of jquery, bootstrap, and r markdown
----------------------------------------------------------------------------------*/ 


// Affix navbar	
$('#nav').affix({
    offset: {
	top: $('header').height()
    }
});


// Show and hide the navbar when certain conditions are met 
var scrollTarget = $('#summary').offset().top + $('#summary').innerHeight() + 50; 
var widthTarget = 768; 


$( document ).ready(function() {
    // Ensure the navbar doesn't show when loading the page
    $('#nav').removeClass('hidden').hide();

    // Automatically populate the navbar with section headings 
    $.when( $('.level1').each(function() {
	var elemid = '#' + this.id;
	var heading = this.id.replaceAll('-', ' ');
	heading = heading.charAt(0).toUpperCase() + heading.slice(1);
	$('#nav-content').append('<li><a href="' + elemid + '">' + heading + '</a></li>');
	$('#this-tutorial > span').append('<a href="' + elemid + '">' + heading + '</a>');
    })).then( $('body').scrollspy({ target: '.navbar', offset: 50}) ); //callback executed once navbar-nav populated
    
    // Position the elements within the table of contents nav
    var mrg = $("#content").offset().left;
    $("#nav-content").css('margin-left', mrg+'px');

    // Remove '##' from R output
    $('pre:not(.r)').each(function() {
	$(this).html($(this).html().replace(/\#/g, ''));
    }); 
    
});


$(window).scroll(function () {
    if ($(window).scrollTop() >= scrollTarget && $(window).width() >= widthTarget) {
	$("#nav").slideDown(200);
    } else if ($(window).scrollTop() < scrollTarget) {
	$("#nav").fadeOut(10);
    } 

});

$(window).resize(function() {

    if ($(window).scrollTop() >= scrollTarget && $(window).width() >= widthTarget) {
	$("#nav").show(200);
    } else if ($(window).width() < widthTarget) {
	$("#nav").fadeOut(10);
    } 

    var mrg = $("#content").offset().left;
    $("#nav-content").css('margin-left', mrg+'px');
        
});


// Function for replacing all occurences of a character in a string 
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 





