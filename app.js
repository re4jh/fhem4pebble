/* FHEM4PEBBLE
   Source: https://github.com/re4jh/fhem4pebble
*/

//FHEM HOST SETTINGS HERE
var scheme = 'http';
var user   = 'myusername';
var passwd = 'mypassword';
var host   = '192.168.0.1';
var port   = '8083';

// Import the UI elements
var UI = require('ui');

// Import the AJAX elements
var ajax = require('ajax');
var Vector2 = require('vector2');

//Splashscreen
// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'FHEM4PEBBLE connecting...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

//create menu
var menu = new UI.Menu({
  sections: [{
    title: 'Switches'
  }]
});

ajax(
  {
    url: scheme + '://' + user + ':' + passwd  + '@' + host  + ':' + port  + '/fhem?cmd=jsonlist&XHR=1',
    type: 'json'
    //headers: {'Authorization': 'Basic DEMOAUTHHERE000000=='}
  },
  function(data, status, request) {
    splashWindow.hide();
    menu.show();
    //console.log('Alias: ' + data.Results[2].devices[15].ATTR.alias);
    var aDevices = data.Results[2].devices;
    var myMenuPos = 0;
    for(var i = 0; i < aDevices.length; i++) {
      if(aDevices[i].ATTR.subType === 'switch')
        {
          var myAlias = aDevices[i].ATTR.alias;
          var myShorterAlias = myAlias.replace('Schalter: ', '');
          var myNextState = 'on';
          if (aDevices[i].STATE==='on') myNextState = 'off';
          menu.item(0, myMenuPos, {
            title: myShorterAlias,
            subtitle: 'State:' +  aDevices[i].STATE,
            state_next: myNextState,
            state_current: aDevices[i].STATE,
            switch_name:  aDevices[i].NAME,
            switch_url: scheme + '://' + user + ':' + passwd  + '@' + host  + ':' + port  + '/fhem?XHR=1&cmd.' + aDevices[i].NAME + '=set%20' + aDevices[i].NAME + '%20' + myNextState
          });
          console.log('Switch found:' + aDevices[i].ATTR.alias);
          myMenuPos++;
        }
    }    
    
},
  function(error, status, request) {
    Pebble.showSimpleNotificationOnPebble( "Could not connect to FHEM Host"); 
  }
);


menu.on('select', function(e) {
  ajax({
    url: e.item.switch_url,
    type: 'get'
    //headers: {'Authorization': 'Basic DEMOAUTHHERE000000=='}
  });
  menu.item( e.sectionIndex,  e.itemIndex, {
      title: e.item.title,
      subtitle: 'State: ' + e.item.state_next,
      state_current: e.item.state_next,
      state_next: e.item.state_current,
      switch_url: scheme + '://' + user + ':' + passwd  + '@' + host  + ':' + port  + '/fhem?XHR=1&cmd.' + e.item.switch_name + '=set%20' + e.item.switch_name + '%20' + e.item.state_current
  });
});

