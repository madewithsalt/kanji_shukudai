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


        App.data = {
            key: new App.Entities.DataKey(),
            user_settings: new App.Entities.UserSettings()
        };

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

        App.mainRegion.show(new App.Views.Loader());

        async.parallel([
                function(callback) {
                    App.data.key.fetch({
                        success: function() {
                            callback();
                        },

                        error: function(err) {
                            callback(err);
                        }
                    });
                },

                function(callback) {
                    App.data.user_settings.fetch({
                        success: function() {
                            callback();
                        },
                        error: function(err) {
                            callback(err);
                        }
                    });
                }
            ], function(err, results) {
                if (err) {
                    App.errorsRegion.show(new App.Views.Error({
                        message: err
                    }));
                }

                App.errorsRegion.reset();

                Backbone.history.start();
        });
    });

    return App;

})(Backbone, Marionette);

