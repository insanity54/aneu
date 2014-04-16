// turn on x-editable inline mode
$.fn.editable.defaults.mode = 'inline';


$(document).ready(function() {


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

    // @todo when we add multiple keepers per user page
    //       create dropzones programmatically
    //       http://www.dropzonejs.com/#toc_8
    
    myDropzone.on("addedfile", function(file) {
        alert("ey there that's a nice file you got there");

    });
        
    myDropzone.on("success", function(file, response) {
        console.log("ey there, successful upload. file: " + file.name +
                    " res: " + response);
        
        $(".dz-success-mark").css({'color': 'green'});

    });
});

