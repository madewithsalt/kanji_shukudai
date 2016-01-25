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

    Home.QueueItem = Marionette.ItemView.extend({
        template: 'home/queue-item',
        className: 'alert alert-info queue-item',

        triggers: {
            'click .close': 'item:remove'
        }
    });

    Home.QueueList = Marionette.CollectionView.extend({
        childView: Home.QueueItem,

        childEvents: {
            'item:remove': 'removeItem'
        },

        removeItem: function(view) {
            this.collection.remove(view.model);
        }
    });

    Home.BaseView = Marionette.LayoutView.extend({
        template: 'home/home',
        className: 'home',

        events: {
            'click .submit': 'addEntry',
            'click .process-btn': 'processEntries'
        },

        ui: {
            'input': '.input',
            'processBtn': '.process-btn'
        },

        regions: {
            'queue': '.character-queue'
        },

        initialize: function() {
            var self = this;

            this.key = App.data.key;
            this.itemQueue = App.data.itemQueue || new Backbone.Collection();

            this.listenTo(this.itemQueue, 'add remove', function() {
                self.checkReady();
            });

        },

        onBeforeShow: function() {
            this.queue.show(new Home.QueueList({
                collection: this.itemQueue
            }));
        },

        checkReady: function() {
            if(this.itemQueue.length) {
                this.ui.processBtn.removeClass('hidden');
            } else {
                this.ui.processBtn.addClass('hidden');
            }
        },

        addEntry: function(evt) {
            var self = this,
                input = this.ui.input.val();

            if(_.isEmpty(input)) { return; }

            _.each(input, function(character) {
                var target = character,
                    hex = he.encode(character),
                    id;

                if(hex.indexOf('&#x') === 0) {
                    id = hex.split('&#x')[1].split(';')[0].toLowerCase();

                    // THEORY - id's are always 5 digits. add 0's to the front if the id has less.
                    // REASON - you can have as many 0's in front of a code and it will still decode properly.
                    if(id.length < 5) {
                        for(var i = 0; i < (5 - id.length); i++) {
                            id = '0' + id;
                        }
                    }

                    if(self.key.locateEntity(id)) {
                        self.itemQueue.add({
                            id: id,
                            target: target,
                            hex: hex
                        });                        
                    }

                }
            });

            this.ui.input.val('');
        },

        processEntries: function() {
            if(!this.itemQueue.length) { return; }

            App.data.itemQueue = this.itemQueue;
            App.router.navigate('worksheet', { trigger: true });
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
App.module("Worksheet", function(Worksheet, App, Backbone, Marionette, $, _) {


    Worksheet.TemplateView = Marionette.ItemView.extend({
        template: 'worksheet/template',

        initalize: function() {

        },

        ui: {
            'strokeOrder': 'svg.stroke-order'
        },

        renderStrokeOrderSVG: function() {
            // svg translation
            // if groups, render groups
            // iterate through the svg formula, 
            // and render any stroke <= current iteration
            // once a stroke === iteration is not found, complete.

        }
    });

    Worksheet.TemplateList = Marionette.CollectionView.extend({
        childView: Worksheet.TemplateView
    });

    Worksheet.BaseView = Marionette.LayoutView.extend({
        template: 'worksheet/base',

        regions: {
            'list': '.formula-list'
        },

        onBeforeShow: function() {
            this.list.show(new Worksheet.TemplateList({
                collection: this.collection
            }));
        }
    });

    App.on('before:start', function() {
        App.commands.setHandler('show:worksheet', function() {

            App.mainRegion.show(new App.Views.Loader());

            App.data.key.getFormulae(App.data.itemQueue, function(err, formulaList) {
                if(err) {
                    App.router.navigate('index', { trigger: true });
                }

                App.mainRegion.show(new Worksheet.BaseView({
                    collection: formulaList
                }));
            });

        });
    });
});
App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.DataKey = Backbone.Model.extend({
        url: '/data/key.json',

        locateEntity: function(id) {
            id = this.getIdFromHex(id);
            var attrs = this.attributes,
                result;

            _.each(attrs, function(keys, fileName) {
                var hasKey = _.indexOf(keys, id);

                if(hasKey !== -1) {
                    result = fileName;
                }
            });

            return result;
        },

        getIdFromHex: function(code) {
            var id = code;
                if(code.indexOf('&#x') === 0) {
                    id = code.split('&#x')[1].split(';')[0].toLowerCase();

                    // THEORY - id's are always 5 digits. add 0's to the front if the id has less.
                    // REASON - you can have as many 0's in front of a code and it will still decode properly.
                    if(code.length < 5) {
                        for(var i = 0; i < (5 - id.length); i++) {
                            id = '0' + id;
                        }
                    }
                }

            return id;
        },

        getHexFromId: function(id) {
            return '&#x' + id + ';';
        },

        getFormulae: function(entityCollection, callback) {
            callback = callback || function() {};

            if(!entityCollection || !entityCollection.length) { return callback(true); }

            var self = this,
                filesRequired = [];

            entityCollection.each(function(model) {
                var id = model.get('id'),
                    targetFile = self.locateEntity(id);

                if(targetFile) {
                    filesRequired.push(_.extend({ 
                        file: targetFile 
                    }, model.toJSON()));
                }
            });

            filesRequired = _.groupBy(filesRequired, 'file');
            var tasks = [];
            _.each(filesRequired, function(list, fileName) {
                var fileModel = new Entities.FormulaSet({}, { file: fileName, targets: list });
                tasks.push(function(cb) {
                    fileModel.fetch({
                        success: function() {
                            cb(null, fileModel);
                        }, 
                        error: function() {
                            cb('failed to get ' + fileName);
                        }
                    })
                });
            });

            async.parallel(tasks, function(err, results) {
                var formulae = [];

                _.each(results, function(model) {
                    formulae.push(_.toArray(model.toJSON()));
                });

                callback(null, new Backbone.Collection(_.flatten(formulae)));
            });
        }
    });

    Entities.FormulaSet = Backbone.Model.extend({
        initialize: function(attrs, opts) {
            if(!opts.file && !opts.targets) { return console.error('no filename or target entities provided.'); }

            this.url = '/data/' + opts.file + '.json';
            this.targets = opts.targets;
        },

        parse: function(data) {
            var self = this,
                attrs = {};

            _.each(this.targets, function(target) {
                attrs[target.id] = _.extend({}, target, data[target.id]);
            });

            return attrs;
        }
    })

});