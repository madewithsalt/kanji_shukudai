App.module("About", function(About, App, Backbone, Marionette, $, _) {

    About.BaseView = Marionette.ItemView.extend({
        template: 'about',
        className: 'col-md-12 about-page'
    });


    App.on('before:start', function() {
        App.commands.setHandler('show:about', function() {
            App.mainRegion.show(new About.BaseView());
        });
    });


});