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
  isBackSpace = false;

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

// Insert a line break if necessary
function checkForLineBreak() {
  var $l = $(".line:last");
  if ($l.css("height") > $l.css("line-height")) {
    insertLineBreak();
  }
}

// Insert a line break to know where to delete the line
// TODO: Manage backspace
function insertLineBreak() {
  crSound.stop().play();
  var $t = $('.line:last > .text'),
      s = $t.html().lastIndexOf(" "),
      newLineText = $t.html().slice(s + 1); // Keep it before updating $t
  $t.html($t.html().slice(0, s));
  $cursor.before("<div></div><div class='line'><span class='text'>" + newLineText + "</span></div>");
}

// Refine the disappearance
// Use something proportional to the length of the text
// Start the opacity as soon as one or two lines are written and then slide up slowly as the text becomes bigger.
// Maybe a random fullscreen effect to distract the viewer?
function forgetStory() {
  if (lineCount() > 2) {
    var t = $(".line").not(".forgotten").first();
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

function moveCursorBack() {
  if (!isBackSpace) {
    isBackSpace = true;
    appendHtml("<span class='backspace'></span>");
  }
  $(".backspace:last").css({"margin-left": "-=2ex"})
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
      break;
    case 9: // Tab key
      // Adds 4 spaces
      event.preventDefault();
      spaceSound.stop().play();
      appendHtml(" &nbsp;&nbsp; ");
      break;
    case 13: // New line
      // Add new line
      event.preventDefault();
      if ($(".line:last > .text").text().length == 0) {
        // Makes sure an empty line appears on screen.
        appendHtml("&nbsp; ");
      } else {
        appendHtml(" ");
      }
      insertLineBreak();
      break;
    case 32: // Space
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

$(document).ready(function() {
  // Prevent selection (from http://www.rgagnon.com/jsdetails/js-0120.html)
  if (typeof document.onselectstart != "undefined") {
    document.onselectstart = new Function("return false");
  } else {
    document.onmousedown = new Function("return false");
    document.onmouseup = new Function("return true");
  }
})
