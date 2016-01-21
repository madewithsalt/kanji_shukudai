App.module("Home", function(Home, App, Backbone, Marionette, $, _) {

    Home.BaseView = Marionette.LayoutView.extend({
        template: 'home/home',
        className: 'home',

        events: {
            'click .submit': 'processEntries'
        },

        ui: {
            'input': '.input'
        },

        regions: {},

        initialize: function() {
            this.key = App.data.key;
        },

        processEntries: function(evt) {
            var input = this.ui.input.val(),
                hex, id;

            if(_.isEmpty(input)) { return; }

            hex = he.encode(input[0]);
            id = hex.split('&#x')[1].split(';')[0].toLowerCase();

            // THEORY - id's are always 5 digits. add 0's to the front if the id has less.
            // REASON - you can have as many 0's in front of a code and it will still decode properly.
            if(id.length < 5) {
                for(var i = 0; i < (5 - id.length); i++) {
                    id = '0' + id;
                }
            }

            console.log(this.key.locateHexCode(id));
        }
    });

    App.on('before:start', function() {
        App.commands.setHandler('show:home', function() {
            App.mainRegion.show(new Home.BaseView());
        });
    });

});