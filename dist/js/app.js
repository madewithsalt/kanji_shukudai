window.App = (function(Backbone, Marionette) {

    Swag.registerHelpers(window.Handlebars);

    var Router,
        App = new Marionette.Application();

    // basic config for the renderer, 
    // which uses Handlebars precompiled templates.
    _.extend(Marionette.Renderer, {
        path: 'templates/',
        render: function(template, data) {
            var path = this.getTemplate(template);

            if (!path) {
                $.error('Template ' + template + ' not found!');
                return;
            }

            return path(data);
        },

        getTemplate: function(template) {
            return Handlebars.templates[template + '.hbs'];
        }
    });

    App.on('before:start', function() {
        this.router = new App.Router();

        App.addRegions({
            mainRegion: '#main-region',
            navRegion: '#nav-region',
            errorsRegion: '#error-region',
            modalRegion: '#modal-region'
        });

        // page title time config
        var $title = $('#page-title'),
            titleContent = '漢字の宿題　ー　Kanji Homework Helper';

        // MODALS
        App.vent.on('modal:open', function(options) {
            var modal = new App.Views.Modal(options);

            App.vent.trigger('modal:close');
            App.modalRegion.show(modal);
            modal.$el.modal();
            modal.on('hidden.bs.modal', _.bind(App.modalRegion.reset, this));
        });

        App.vent.on('modal:close', function() {
            if(App.modalRegion.hasView()) {
                App.modalRegion.currentView.$el.modal('hide');
            }
        });

    });

    App.on('start', function(options) {
        App.version = options.version;

        // var tasks = _.map(this.collections, function(coll, name) {
        //     return function(callback) {
        //         coll.fetch({
        //             success: function() {
        //                 callback(null, coll);
        //             },
        //             error: function(xhr, status, err) {
        //                 callback(coll.type + ' ' + err, coll);
        //                 return console.error('Something blew up.', arguments);
        //             }
        //         })
        //     }
        // });


        // async.parallel(tasks, function(err, results) {
        //     if (err) {
        //         App.errorsRegion.show(new App.Views.Error({
        //             message: err
        //         }));
        //     }

            // App.errorsRegion.reset();

            Backbone.history.start();
        // });
    });

    return App;

})(Backbone, Marionette);


(function(App, Marionette, Backbone) {
    App.Router = Marionette.AppRouter.extend({
        routes: {
            '': 'index',
            'index': 'index',
            'watch-list': 'watchList',
            'about': 'about'
        },

        index: function() {
            App.commands.execute('show:home');
            App.vent.trigger('nav:update', 'index');
        },

        watchList: function() {
            App.commands.execute('show:watchList');
            App.vent.trigger('nav:update', 'watch-list');
        },

        about: function() {
            App.commands.execute('show:about');
            App.vent.trigger('nav:update', 'about');
        }

    });


})(App, Marionette, Backbone);
App.module("Views", function(Views, App, Backbone, Marionette, $, _){

    Views.Error = Marionette.ItemView.extend({
        template: 'error',
        className: 'alert alert-danger',
        serializeData: function() {
            return {
                message: this.options.message
            }
        }
    });

});
App.module("Views", function(Views, App, Backbone, Marionette, $, _) {

    Views.Modal = Marionette.LayoutView.extend({
        template: 'modal',
        className: 'modal fade',
        regions: {
            body: '.modal-body'
        },

        serializeData: function() {
            return {
                title: this.options.title,
                footerButtons: this.options.footerButtons
            }
        },

        onBeforeShow: function() {
            var self = this;

            if(this.options.childView) {
                var child = new this.options.childView({
                    model: this.model,
                    collection: this.collection
                });

                this.body.show(child);

                this.listenTo(child, 'modal:close', function() {
                    self.$el.modal('hide');
                });
            }
        }
    });
});