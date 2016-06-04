var
  cursor = "&#8248;",
  forgettingTime = 8000,
  sIndex = 0, // Sound index to allow repetition.
    // Sounds extracted from https://www.youtube.com/watch?v=hFWXgB0wpsU
  spaceSound = new buzz.sound("http://drecourt.com/wp-content/uploads/2016/05/space", {
    formats: ["ogg", "mp3"],
    preload: true,
    autoplay: false,
    loop: false
  }),
    letterSound = new buzz.sound("http://drecourt.com/wp-content/uploads/2016/05/letter", {
    formats: ["ogg", "mp3"],
    preload: true,
    autoplay: false,
    loop: false
  }),
    crSound = new buzz.sound("http://drecourt.com/wp-content/uploads/2016/05/carriage-return", {
    formats: ["ogg", "mp3"],
    preload: true,
    autoplay: false,
    loop: false
  });

function appendHtml(htmlText) {
  var t = $(".text").last().html();
  if (htmlText == " " && t.slice(-2, -1) == " ") {
    // Allows for multiple spaces
    $(".text").last().html(t.slice(0, -2) + "&nbsp; " + cursor);
  } else {
    $(".text").last().html(t.slice(0, -1) + htmlText + cursor);
  }
}

function lineCount() {
  return $("div.text").not(".forgotten").length;
}

// Insert a line break if necessary
function checkForLineBreak() {
  var t = $(".text").last();
  if (t.css("height") > t.css("line-height")) {
    insertLineBreak();
  }
}

// Insert a line break to know where to delete the line
function insertLineBreak() {
  crSound.stop().play();
  var t = $('.text').last().html();
  var s = t.lastIndexOf(" ");
  $('.text').last().html(t.slice(0, s));
  $('.textWrapper').append("<div class='text'>" + t.slice(s + 1) + "</div>");
  //  t.html(t.slice(0, s) + breakMarker + t.slice(s + 1));
}

// Refine the disappearance 
// Use something proportional to the length of the text
// Start the opacity as soon as one or two lines are written and then slide up slowly as the text becomes bigger.
// Maybe a random fullscreen effect to distract the viewer?
function forgetStory() {
  if (lineCount() > 2) {
    var t = $(".text").not(".forgotten").first();
    var marginText = "-" + t.css("height");
    t.addClass("forgotten")
      .animate({
        "opacity": 0.5
      }, forgettingTime / 2)
      .animate({
          "opacity": 0,
          "margin-top": marginText
        },
        forgettingTime * 5,
        "linear",
        function() {
          $(this).remove();
          forgetStory();
        });
  }
}

// Special key press handler
$(document).keydown(function(event) {
  switch (event.which) {
    case 8:
      // Prevent using backspace 
      event.preventDefault();
      break;
    case 9:
      // Capture tab key and adds 4 spaces
      event.preventDefault();
      spaceSound.stop().play();
      appendHtml(" &nbsp;&nbsp; ");
      break;
    case 13:
      // Add new line with enter
      event.preventDefault();
      if ($(".text").last().text().length == 1) {
        // Makes sure an empty line appears on screen.
        appendHtml("&nbsp; ");
      } else {
        appendHtml(" ");
      }
      insertLineBreak();
      break;
    case 32:
      event.preventDefault();
      spaceSound.stop().play();
      appendHtml(" ");      
    default:
      // Nothing special happening but the sound
  }
});

// Printable characters handler
$(window).keypress(function(event) {
  var character = String.fromCharCode(event.charCode);
  letterSound.stop().play();
  appendHtml(character);
  checkForLineBreak();
  forgetStory();
});

// Insert the cursor
$(document).ready(function() {
  // Insert the cursor
  $(".text").html(cursor);

  // Prevent selection (from http://www.rgagnon.com/jsdetails/js-0120.html)
  if (typeof document.onselectstart != "undefined") {
    document.onselectstart = new Function("return false");
  } else {
    document.onmousedown = new Function("return false");
    document.onmouseup = new Function("return true");
  }
})