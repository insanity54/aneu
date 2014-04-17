// turn on x-editable inline mode
$.fn.editable.defaults.mode = 'inline';


// pageload
$(document).ready(function() {

    // find number of keepers user has
    //   create a tab for each keeper
    //     - needs keeper number

    // if keeper tab n is visible
    //   if no keeper dropzone exists
    //     create new keeper dropzone with keeper's ID
    //       - has keeper ID in hidden formData https://developer.mozilla.org/en-US/docs/Web/API/FormData

    // if keeper tab n is visible
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        console.log('activated tab: ' + e.target);
        console.log('  previous   : ' + e.relatedTarget);
    });
        
    
    var myDropzone = new Dropzone("div#keeper-image", {
        url: "/upload",
        paramName: "keeperImage",
        maxFilesize: 20,
        thumbnailWidth: 100,
        thumbnailHeight: 100,
        maxFiles: 1,
        acceptedFiles: "image/*",
        addRemoveLinks: "true",
        autoDiscover: "false",    // because creating dropzones programmatically

        dictDefaultMessage: "Drop image here to upload"
    });

    

//    var mockFile = { name: "Filename", size: 12345 };
    // myDropzone.emit("addedfile", mockFile);
    // myDropzone.emit("thumbnail", mockFile, "/uploads/keeper2.png");

    // var existingFileCount = 0;
    // myDropzone.options.maxFiles = myDropzone.options.maxFiles - existingFileCount;

    // @todo //ccc keeper images need to be added programmamatically
    // @todo when we add multiple keepers per user page
    //       create dropzones programmatically
    //       http://www.dropzonejs.com/#toc_8

//    myDropzone.on("addedfile", function(file) {
//        alert("ey there that's a nice file you got there");
//    });
        
    myDropzone.on("success", function(file, response) {
        console.log("ey there, successful upload. file: " + file.name +
                    " res: " + response);
        
        $(".dz-success-mark").css({'color': 'green'});

    });
});

