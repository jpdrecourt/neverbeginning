'use strict';

var
  $cursor = $("#cursor"),
  forgettingTime = 8000,
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
  }),
  bellSound = new buzz.sound("media/bell", {
    formats: ["ogg", "mp3"],
    preload: true,
    autoplay: false,
    loop: false
  }),
  isBackSpace = false,
  isWarned = false; // Warning that we're reaching the end of the line

function appendHtml(htmlText) {
  var $t = $(".line:last > .text");
  if (htmlText == " " && $t.html().slice(-1) == " ") {
    // Allows for multiple spaces
    $t.html($t.html().slice(0, -1) + "&nbsp; ");
  } else {
    $t.html($t.html() + htmlText);
  }
}

function lineCount() {
  return $("div.line").not(".forgotten").length;
}

// LF/CR
function lfcr() {
  if ($(".text:last").html().length === 0) {
    appendHtml("&nbsp;");
  }
  $cursor.before("<div></div><div class='line'><span class='text'></span></div>");
  isWarned = false;
}

// Makes sure the cursor (and the typing) remains within the margin of the document
// TODO Create bell sounds.
function manageMargin() {
  var leftPosition = $("#cursor").offset().left - $(".textWrapper").offset().left;
  var rightPosition = $(".textWrapper").width() - leftPosition;
  // Hard margins
  if (leftPosition < 0) {
    // It's necessarily because of a backspace
    bellSound.stop().play();
    $(".backspace:last").css({"margin-left": "+=" + (-leftPosition) + "px"});
  } else if (rightPosition < 0) {
    bellSound.stop().play();
    moveCursorBack(-rightPosition + "px"); // Back inside the .textWrapper
    moveCursorBack(); // One more step for next character
    manageMargin();
  }
  // Warning
  console.log(rightPosition + ", " + $(".textWrapper").width());
  if (!isWarned && rightPosition < 0.1 * $(".textWrapper").width()) {
    bellSound.play();
    console.log("WARNING!!!");
    isWarned = true;
  }
}

// Refine the disappearance
// Use something proportional to the length of the text
// Start the opacity as soon as one or two lines are written and then slide up slowly as the text becomes bigger.
// Maybe a random fullscreen effect to distract the viewer?
function forgetStory() {
  if (lineCount() > 2) {
    $(".line").not(".forgotten").first()
      .addClass("forgotten")
      .animate({
        "opacity": 0.5
      }, forgettingTime / 2)
      .animate({
          "opacity": 0,
          "height": 0
        },
        forgettingTime * 5,
        "linear",
        function() {
          $(this).remove();
          forgetStory();
        });
  }
}

function moveCursorBack() {
  var w = "1ch";
  if (arguments.length > 0) {
    w = arguments[1];
  }
  if (!isBackSpace) {
    isBackSpace = true;
    appendHtml("<span class='backspace'></span>");
  }
  $(".backspace:last").css({"margin-left": "-=" + w})
}

// Special key press handler
$(document).keydown(function(event) {
  if (event.which != 8) {
    isBackSpace = false;
  }
  switch (event.which) {
    case 8: // Backspace
      event.preventDefault();
      spaceSound.stop().play();
      moveCursorBack();
      manageMargin();
      break;
    case 9: // Tab key
      // Adds 4 spaces
      event.preventDefault();
      spaceSound.stop().play();
      appendHtml("&nbsp;&nbsp;&nbsp;&nbsp;");
      manageMargin();
      break;
    case 13: // New line
      // Add new line
      event.preventDefault();
      crSound.stop().play();
      lfcr();
      break;
    case 32: // Space
      event.preventDefault();
      spaceSound.stop().play();
      appendHtml("&nbsp;");
      manageMargin();
    default:
      // Nothing special happening but the sound
  }
});

// Printable characters handler
$(window).keypress(function(event) {
  var character = String.fromCharCode(event.charCode);
  letterSound.stop().play();
  appendHtml(character);
  manageMargin();
  forgetStory();
});

$(document).ready(function() {
  // Prevent selection (from http://www.rgagnon.com/jsdetails/js-0120.html)
  if (typeof document.onselectstart != "undefined") {
    document.onselectstart = new Function("return false");
  } else {
    document.onmousedown = new Function("return false");
    document.onmouseup = new Function("return true");
  }
})
