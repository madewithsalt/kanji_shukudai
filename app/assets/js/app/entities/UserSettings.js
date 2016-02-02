App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.UserSettings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('UserSettings'),
        
        defaults: {
            template_format: 'large'
        }
    });

});