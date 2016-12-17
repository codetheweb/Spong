// Import packages
const electron = require('electron');
const SpotifyWebHelper = require('@jonny/spotify-web-helper')
const helper = SpotifyWebHelper();
const request = require('request');
const Vibrant = require('node-vibrant');
const $ = require("jquery");

const Config = require('electron-config');
const config = new Config();

var lastSong = {};
var colorPalette;

// Events fired when the status of Spotify changes
helper.player.on('track-will-change', track => {
  updateDisplay({artist: track.artist_resource.name, song: track.track_resource.name, id: track.track_resource.uri.slice(14)});
  return;
});
helper.player.on('status-will-change', status => {
  if (status.running == false) {
    notRunning(true);
  }
  else {
    notRunning(false);
    updateDisplay({artist: helper.status.track.artist_resource.name, song: helper.status.track.track_resource.name, id: helper.status.track.track_resource.uri.slice(14)});
  }
  return;
});
helper.player.on('error', err => {
  console.log('Error: ', err);
  notRunning(true);
});

$(document).keydown(function(event) {
  if (event.keyCode == 32) {
    console.log('Space pressed');
    helper.player.pause(!helper.status.playing);
  }
  return;
});

// Tells user Spotify isn't running and hides song info
function notRunning(state) {
  if (state == true) {
    console.log('Spotify not running');
    $('.alert').text('Spotify not running. Please close this app and reopen it after starting Spotify.').show();
    $('.song-info, img').hide();
  }
  else {
    $('.alert').hide();
    $('.song-info, img').show();
  }
}

// Updates the displayed song and artwork
function updateDisplay(songInfo) {
  if (songInfo == undefined || songInfo == lastSong) {
    // Below only runs when options are changed
    if (config.get('showArtwork') == false) {
      $('#artwork, #artwork-blur').hide();
    }
    else {
      $('#artwork, #artwork-blur').show();
    }
    if (config.get('showArtist') == false) {
      $('#artist').hide();
    }
    else {
      $('#artist').show();
    }
    
    setColors(colorPalette);
    
    return;
  }
  $('#song').text(songInfo.song);
  $('#artist').text(songInfo.artist);
  
  getArtwork(songInfo.id, function(artworkURL) {
    if (artworkURL != undefined) {
      $('#artwork').attr('src', artworkURL);
      $('#artwork-blur').attr('src', artworkURL);
  	    $('#artwork').show();
  	    $('#artwork-blur').show();
  	    
  	    // Extracts colors of artwork
  	    v = new Vibrant(artworkURL, {quality: 1, colorCount: 150});
  	    v.getPalette(function(err, palette) {
    	    if (!err) {
      	    colorPalette = palette;
    	      setColors(colorPalette);
        }
        else {
          console.log(err);
        }
      });
    }
    else {
      console.log("No artwork found.");
    }
  });
  
  lastSong = songInfo;
    
  return;
}

// Function to return url of artwork, given Spotify track ID
function getArtwork(id, callback) {
  var requestURL = 'https://api.spotify.com/v1/tracks/' + id;
  var imageURL;
  
  request(requestURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonResponse = JSON.parse(body);
      // first image is always the biggest
      var imageURL = jsonResponse.album.images[0].url;
      callback(imageURL);
    }
    else {
      callback(false);
    }
  });
}

// Sets background and foreground colors
function setColors(palette) {
  if (config.get('reactiveBackground') == true) {
    $('html, body').css({'background-color': palette['DarkMuted'].getHex()});
    ('html, body').removeClass('defaultColors');
  }
  else {
    $('html, body').css({'background-color': '#141619'});
    $('html, body').addClass('defaultColors');
  }
  if (config.get('reactiveForeground') == true) {
    $('.song-info').css({'color': palette['LightVibrant'].getHex()});
    $('.song-info').removeClass('defaultColors');
  }
  else {
    $('.song-info').addClass('defaultColors');
  }
  return;
}
