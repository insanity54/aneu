// turn on x-editable inline mode
//$.fn.editable.defaults.mode = 'inline';


Dropzone.autoDiscover = false; // because creating dropzones programmatically

// pageload
$(document).ready(function() {

    // find number of keepers user has
    //   create a tab for each keeper
    //     - needs keeper number

    // if keeper tab n is visible
    //   if no keeper dropzone exists
    //     create new keeper dropzone with keeper's ID
    //       - has keeper ID in hidden formData https://developer.mozilla.org/en-US/docs/Web/API/FormData


    $('.tabbable a:first').tab('show');

    var dropzones = [];  // array for all the dropzones

    // get list of keepers on page
    $('form[id^="keeper"][id$="-image"]').each(function() {
        var kid = this.id.replace( /\D+/g, ''); 
        

        // activate the dropzone
        dropzones.push(new Dropzone(this, {
            url: "/api/keeper/upload/",
            params: { "kid": kid },
            paramName: "keeperImage",
            maxFilesize: 20,
            thumbnailWidth: 100,
            thumbnailHeight: 100,
            maxFiles: 1,
            acceptedFiles: "image/*",
            addRemoveLinks: "true",
            dictDefaultMessage: "Drop image here to upload"
        }));
    });



    // activate the x-editable fields
    // for each keeper on the page, activate the user editable fields
    $('div.tab-content').each(function() {

       //$(this).css({ 'border': '5px solid red' });
    
        $('.name').editable({
            name: 'keepername',
            type: 'text',
            pk: '/api/keeper/name',
            url: '/api/keeper/name', // url to process submitted data       
            title: 'Enter keeper name'
        });

        $('.bio').editable({
            name: 'keeperbio',
            type: 'textarea',
            pk: '/api/keeper/bio',
            url: '/api/keeper/bio',
            title: 'Enter keeper biography'
        });

        $('.').editable({
            name: 'keeperbio',
            type: 'textarea',
            pk: '/api/keeper/bio',
            url: '/api/keeper/bio',
            title: 'Enter keeper biography'
        });

       
            
   });




    // get this keeper's image
    // add keeper image to "mockfile"
    // display keeper image

    var mockFile = { name: "terd", size: 12345 };
    dropzones.forEach(function(dropzone) {

        dropzone.emit("addedfile", mockFile);
        dropzone.emit("thumbnail", mockFile, "/uploads/keeper2.png"); //+ keepers[1].image);

        var existingFileCount = 0;
        dropzone.options.maxFiles = dropzone.options.maxFiles - existingFileCount;    
    });
        
    



    // if keeper tab n is visible
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        console.log('activated tab: ' + e.target);
        console.log('  previous   : ' + e.relatedTarget);
    });
        
});  
