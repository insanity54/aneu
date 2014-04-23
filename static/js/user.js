// turn on x-editable inline mode
$.fn.editable.defaults.mode = 'inline';

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


    // activate the first keeper tab nav
    $('.tabbable a:first').tab('show');

    var dropzones = [];  // array for all the dropzones

    // get list of keepers on page
    $('form[id^="keeper"][id$="-image"]').each(function() {
        var kid = this.id.replace( /\D+/g, ''); 
        
        console.log(this.id + ' and the kid:' + kid);
        console.dir(this);

        // activate the dropzone        
        dropzones.push(new Dropzone(this, {
            url: "/api/keeper/upload/",
            params: { pika: "chuuu" },
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


    // get this keeper's image
    
    // add keeper image to "mockfile"
    // display keeper image
    //var //ccc

    var mockFile = { name: "terd", size: 12345 };
    dropzones.forEach(function(dropzone) {

        dropzone.emit("addedfile", mockFile);
        dropzone.emit("thumbnail", mockFile, "/uploads/keeper2.png");

        var existingFileCount = 0;
        dropzone.options.maxFiles = dropzone.options.maxFiles - existingFileCount;    
    });
        
    



    // if keeper tab n is visible
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        console.log('activated tab: ' + e.target);
        console.log('  previous   : ' + e.relatedTarget);
    });
        
    


    // @todo //ccc keeper images need to be added programmamatically
    // @todo when we add multiple keepers per user page
    //       create dropzones programmatically
    //       http://www.dropzonejs.com/#toc_8

//    myDropzone.on("addedfile", function(file) {
//        alert("ey there that's a nice file you got there");
//    });
        
//    myDropzone.on("success", function(file, response) {
//        console.log("ey there, successful upload. file: " + file.name +
//                     " res: " + response);

    dropzones.forEach(function(zone) {

        zone.on("sending", function(file, xhr, formData) {

            
            console.log("ey there, \'ere we go \'bout tu send. checkout ma formdata: " + formData);
            formData.append("pika", "CHUUU!");
            console.dir(formData);
            $(".dz-success-mark").css({'color': 'green'});
        });
    });
});

