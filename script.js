$(document).ready(function () {
  var video = document.getElementById("videoElement");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var captureButton = document.getElementById("captureButton");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Could not access the camera: " + error);
    });

  $("#uploadForm").submit(function (event) {
    event.preventDefault();
    var fileInput = document.getElementById("imageInput");
    var formData = new FormData();
    formData.append("image", fileInput.files[0]);
    processImage(formData);
  });

  captureButton.addEventListener("click", function () {
    context.drawImage(video, 0, 0, 270, 150);
    canvas.toBlob(function (blob) {
      // var formData = new FormData();
      // formData.append("image", blob);
      processImage(blob);
    });
  });

  function processImage(blob) {
    $.ajax({
      url: "https://cv-instance-analyseimg-northeur.cognitiveservices.azure.com/computervision/imageanalysis:analyze?api-version=2024-02-01&features=people&model-version=latest&language=en&gender-neutral-caption=False",
      type: "POST",
      processData: false,
      data: blob,
      // data: JSON.stringify({
      //   url: "https://raw.githubusercontent.com/Azure/azure-sdk-for-java/main/sdk/vision/azure-ai-vision-imageanalysis/src/samples/java/com/azure/ai/vision/imageanalysis/sample.jpg",
      // }),
      //   contentType: false,
      //   data: formData,
      // contentType: "application/json",
      contentType: "application/octet-stream",

      headers: {
        "Ocp-Apim-Subscription-Key": "169ba26709814440839c99da449b5421",
      },

      //   now success etc works
      success: function (response) {
        console.log("Response: ", response);
        var peopleResult = response.peopleResult.values;
        var highestConfidence = 0;

        // Loop through the peopleResult array to find the highest confidence
        for (var i = 0; i < peopleResult.length; i++) {
          var person = peopleResult[i];
          if (person.confidence > highestConfidence) {
            highestConfidence = person.confidence;
          }
        }

        // Check if the highest confidence is greater than 0.7
        if (highestConfidence > 0.7) {
          // Display message indicating the presence of a person
          var resultHeading = document.getElementById("resultHeading");
          resultHeading.innerHTML =
            '<h2 class="result-heading">This video contains a live person</h2>';
        } else {
          // Display message indicating no person detected or confidence too low
          var resultHeading = document.getElementById("resultHeading");
          resultHeading.innerHTML =
            '<h2 class="result-heading">No live person detected in the video</h2>';
        }
      },

      error: function () {
        var resultContainer = document.getElementById("resultContainer");
        var resultHeading = document.getElementById("resultHeading");
        resultContainer.innerHTML =
          "<p>An error occurred while processing the image.</p>";
        resultHeading.innerHTML = "";
      },
    });
  }
});
