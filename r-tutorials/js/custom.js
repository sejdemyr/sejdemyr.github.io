
$( document ).ready(function() {

    // Automatically populate content in 'this tutorial'
    $('.level1').each(function() {
	var elemid = '#' + this.id;
	var heading = this.id.replace(/\-/g, ' ');
	heading = heading.charAt(0).toUpperCase() + heading.slice(1);
	if (heading == "Running r") { heading = "Running R" }; 
	$('#toc').append('<a href="' + elemid + '">' + heading + '</a>');
    });
    
    // Remove '##' from R output
    $('pre:not(.r)').each(function() {
	$(this).html($(this).html().replace(/\#/g, ''));
    }); 

}); 
