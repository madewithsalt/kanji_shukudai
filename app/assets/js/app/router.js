(function(App, Marionette, Backbone) {
    App.Router = Marionette.AppRouter.extend({
        routes: {
            '(index)': 'index',
            'worksheet': 'workSheet',
            'about': 'about'
        },

        index: function() {
            App.commands.execute('show:home');
            App.vent.trigger('nav:update', 'index');
        },

        workSheet: function() {
            App.commands.execute('show:worksheet');
            App.vent.trigger('nav:update', 'worksheet');
        },

        about: function() {
            App.commands.execute('show:about');
            App.vent.trigger('nav:update', 'about');
        }

    });


})(App, Marionette, Backbone);