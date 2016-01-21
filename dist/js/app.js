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
            key: new App.Entities.DataKey()
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

        App.data.key.fetch({
            success: function() {
                Backbone.history.start();
            },

            error: function(err) {
                App.errorsRegion.show(new App.Views.Error({
                    message: err
                }));
            }
        })

        // async.parallel(tasks, function(err, results) {
        //     if (err) {
        //         App.errorsRegion.show(new App.Views.Error({
        //             message: err
        //         }));
        //     }

            // App.errorsRegion.reset();

            // Backbone.history.start();
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
App.module("Views", function(Views, App, Backbone, Marionette, $, _){

	Views.Loader = Marionette.ItemView.extend({
		template: 'loader'
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
App.module("MainNav", function(Nav, App, Backbone, Marionette, $, _){

	Nav.BaseView = Marionette.LayoutView.extend({
		template: 'main-nav/main-nav',
		className: 'navbar navbar-default navbar-fixed-top',

		regions: {
			menu: '.menu-region'
		},

        events: {},

        serializeData: function() {
            return {
                version: App.version
            };
        },

		onBeforeShow: function() {
            this.menu.show(new Nav.Menu());
		}
	});

    Nav.Menu = Marionette.ItemView.extend({
        template: 'main-nav/menu',

        menuItems: [
            {
                name: 'index',
                title: 'Home'
            },
            {
                name: 'worksheet',
                title: 'Kanji Worksheet'
            },
            {
                name: 'about',
                title: 'About'
            }
        ],

        initialize: function() {
            var self = this;

            this.listenTo(App.vent, 'nav:update', function(activeItem) {
                self.active = activeItem;
                self.render();
            });

        },

        serializeData: function() {
            var self = this,
                menu = _.map(this.menuItems, function(item) {

                    if(self.active === item.name || item.name === 'index' && !self.active) {
                        item.isActive = true;
                    } else {
                        item.isActive = false;
                    }

                    return item;
                });

            return {
                menuItems: menu
            }
        }
    })


    App.on('start', function() {
        App.navRegion.show(new Nav.BaseView({}));
    });


});
App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.DataKey = Backbone.Model.extend({
        url: '/data/key.json',

        locateHexCode: function(code) {
            var attrs = this.attributes,
                result;

            _.each(attrs, function(keys, fileName) {
                var hasKey = _.indexOf(keys, code);

                if(hasKey !== -1) {
                    result = fileName;
                }
            });

            return result;
        },

        retrieveFormula: function(code) {
            var targetFile = this.locateHexCode(code);

            if(!targetFile) { return; }

            
        }
    });

});