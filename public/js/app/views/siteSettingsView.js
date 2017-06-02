/*global define*/
define([
	'jQuery-2.1.4.min',
	'underscore_1.3.3',
	'backbone_0.9.2',
  'text!../../../js/app/templates/siteSettings.html'
], function ($, _, Backbone, SiteSettingsTemplate) {
	'use strict';

	var SiteSettingsView = Backbone.View.extend({

    /*
     * Dev Notes:
     * -It is assumed that the keyDisplay and keyNames array exist in both private and public JSON files.
     * -It is assumed that the keyDisplay and keyNames arrays are the same length.
     */


		tagName:  'div',

    el: '#siteSettingsView',

		template: _.template(SiteSettingsTemplate),

		events: {
      //'hidden.bs.modal #fileLibraryModal': 'refreshView'
      'click #saveSettingsBtn': 'saveSettings'
		},

		initialize: function () {
			this.privateData = new Object();
      this.publicData = new Object();
		},

    render: function () {
      //debugger;
      log.push('siteSettingsView.js/render() called.');

      this.$el.html(this.template);

      this.populateView();

			return this;
		},

    //This function reads in the public and private JSON files and popultes the View with the data inside of them.
    //This function is called by render().
    populateView: function() {
      //debugger;
      log.push('siteSettingsView.js/populateView() called.');

      var thisView = this;

      $.getJSON('/api/serversettings/getprivate', '', function(data) {
        //debugger;
        log.push('Data successfully retrieved from /api/serversettings/getprivate');

        thisView.privateData = data.privateSettings;

        thisView.populatePrivateData();
      })
      //If sending the data to the server fails:
      .fail(function( jqxhr, textStatus, error ) {
        // debugger;

        var err = textStatus + ", " + error;

        try {
          if(jqxhr.responseJSON.detail == "invalid csrf") {
            global.modalView.errorModal('Update failed due to a bad CSRF token. Please log out and back in to refresh your CSRF token.');
            return;
          } else {
            global.modalView.errorModal("Request failed because of: "+error+'. Error Message: '+jqxhr.responseText);
            console.log( "Request Failed: " + error );
            console.error('Error message: '+jqxhr.responseText);
          }
        } catch(err) {
          console.error('Error trying to retrieve JSON data from server response.');
        }
      });

      $.getJSON('/js/publicsettings.json', '', function(data) {
        //debugger;
        log.push('Data successfully retrieved from publicsettings.json');

        thisView.publicData = data;

        thisView.populatePublicData();
      })
      //If sending the data to the server fails:
      .fail(function( jqxhr, textStatus, error ) {
        // debugger;

        var err = textStatus + ", " + error;

        try {
          if(jqxhr.responseJSON.detail == "invalid csrf") {
            global.modalView.errorModal('Update failed due to a bad CSRF token. Please log out and back in to refresh your CSRF token.');
            return;
          } else {
            global.modalView.errorModal("Request failed because of: "+error+'. Error Message: '+jqxhr.responseText);
            console.log( "Request Failed: " + error );
            console.error('Error message: '+jqxhr.responseText);
          }
        } catch(err) {
          console.error('Error trying to retrieve JSON data from server response.');
					console.log('err', err)
        }
      });


    },

    //This function populates the DOM with data stored inside the private settings file.
    //This function is called by populateView() after the data has been retrieved from the server.
    populatePrivateData: function() {
      //debugger;
      log.push('siteSettingsView.js/populatePrivateData() called.');

      for(var i=0; i < this.privateData.keyNames.length; i++) {

        //Clone the scaffolding element
        var thisForm = this.$el.find('#privateScaffold').clone();
        thisForm.prop('id', this.privateData.keyNames[i]);

        //Get the display name and display value from the JSON data.
        var displayName = this.privateData.keyDisplay[i];
        var displayVal = this.privateData[this.privateData.keyNames[i]]

        //Add the JSON data to the DOM.
        thisForm.find('label').text(displayName);
        thisForm.find('input').val(displayVal);

        //Append this new form element to the DOM.
        this.$el.find('#privateSettingsForm').append(thisForm);
      }

      //Hide the scaffolding element.
      this.$el.find('#privateScaffold').hide();
    },

    //This function populated the DOM with the data stored inside the public settings file.
    //This function is called by populateView() after the data has been retrieved.
    populatePublicData: function() {
      //debugger;
      log.push('siteSettingsView.js/populatePublicData() called.');

      for(var i=0; i < this.publicData.keyNames.length; i++) {

        //Clone the scaffolding element
        var thisForm = this.$el.find('#publicScaffold').clone();
        thisForm.prop('id', this.publicData.keyNames[i]);

        //Get the display name and display value from the JSON data.
        var displayName = this.publicData.keyDisplay[i];
        var displayVal = this.publicData[this.publicData.keyNames[i]]

        //Add the JSON data to the DOM.
        thisForm.find('label').text(displayName);
        thisForm.find('input').val(displayVal);

        //Append this new form element to the DOM.
        this.$el.find('#publicSettingsForm').append(thisForm);
      }

      //Hide the scaffolding element.
      this.$el.find('#publicScaffold').hide();
    },

    //This function is called when the user clicks on the Save Settings button.
    saveSettings: function(event) {
      //debugger;

      for(var i=0; i < this.privateData.keyNames.length; i++) {

        //Get a handle on the form element.
        var thisForm = this.$el.find('#'+this.privateData.keyNames[i]);

        //Retrieve the value from the input field.
        var inputString = thisForm.find('input').val();

        //If the input contains commas, then split it into an array of values.
        if(inputString.indexOf(',') != -1) {
          inputString = inputString.replace(/\s/g, ''); //Remove any white space
          inputString = inputString.split(','); //Split into array, separated by comma.
        }

        //Overwrite the old value with the new value.
        this.privateData[this.privateData.keyNames[i]] = inputString;

      }

      //Send the updated data to the server.
      $.get('/api/serversettings/saveprivate', this.privateData, function(data) {
        //debugger;

        if(data.success) {
          log.push('Successfly updated privatesettings.json file using /api/serversettings/saveprivate API.');
          checkSuccess(1);
        } else {
          log.push('Unknown value returned by /api/serversettings/saveprivate');
        }
      })
      //If sending the data to the server fails:
      .fail(function( jqxhr, textStatus, error ) {
        debugger;

        var err = textStatus + ", " + error;

        try {
          if(jqxhr.responseJSON.detail == "invalid csrf") {
            global.modalView.errorModal('Update failed due to a bad CSRF token. Please log out and back in to refresh your CSRF token.');
            return;
          } else {
            global.modalView.errorModal("Request failed because of: "+error+'. Error Message: '+jqxhr.responseText);
            console.log( "Request Failed: " + error );
            console.error('Error message: '+jqxhr.responseText);
          }
        } catch(err) {
          console.error('Error trying to retrieve JSON data from server response.');
        }
      });


      for(var i=0; i < this.publicData.keyNames.length; i++) {

        //Get a handle on the form element.
        var thisForm = this.$el.find('#'+this.publicData.keyNames[i]);

        //Retrieve the value from the input field.
        var inputString = thisForm.find('input').val();

        //If the input contains commas, then split it into an array of values.
        if(inputString.indexOf(',') != -1) {
          inputString = inputString.replace(/\s/g, ''); //Remove any white space
          inputString = inputString.split(','); //Split into array, separated by comma.
        }

        //Overwrite the old value with the new value.
        this.publicData[this.publicData.keyNames[i]] = inputString;
      }

      //Send the updated data to the server.
      $.get('/api/serversettings/savepublic', this.publicData, function(data) {
        //debugger;

        if(data.success) {
          log.push('Successfly updated publicsettings.json file using /api/serversettings/savepublic API.');
          checkSuccess(2);
        } else {
          log.push('Unknown value returned by /api/serversettings/savepublic');
        }
      })
      //If sending the data to the server fails:
      .fail(function( jqxhr, textStatus, error ) {
        debugger;

        var err = textStatus + ", " + error;

        try {
          if(jqxhr.responseJSON.detail == "invalid csrf") {
            global.modalView.errorModal('Update failed due to a bad CSRF token. Please log out and back in to refresh your CSRF token.');
            return;
          } else {
            global.modalView.errorModal("Request failed because of: "+error+'. Error Message: '+jqxhr.responseText);
            console.log( "Request Failed: " + error );
            console.error('Error message: '+jqxhr.responseText);
          }
        } catch(err) {
          console.error('Error trying to retrieve JSON data from server response.');
        }
      });


      var checkTotal = 0;
      var checkSuccess = function(val) {
        checkTotal += val;

        if(checkTotal == 3) {
          global.modalView.successModal();
        }
      }

    }


	});

  //debugger;
	return SiteSettingsView;
});
