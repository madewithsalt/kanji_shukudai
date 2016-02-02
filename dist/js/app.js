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
App.module('Views.Charts', function (Charts, App, Backbone, Marionette, $, _) {

    // Snap reference: 
    // http://svg.dabbles.info/
    // http://snapsvg.io/docs
    Charts.Base = Marionette.ItemView.extend({
        template: 'blank',
        className: 'chart',

        onShow: function () {
            var id = this.model.get('id');

            this.$el.append('<svg id="svg_' + id + '" />');

            this.svg = Snap(this.$('svg')[0]);
            this.buildChartBase();
            this.renderChart();
        },

        buildChartBase: function () {
            var w = this.options.width || 200,
                h = this.options.height || 200;

            this.svg.attr('width', w)
                .attr('height', h);
        },

        renderChart: function () {}
    });


    Charts.StrokeOrderSVG = Charts.Base.extend({
        // http://stackoverflow.com/questions/19484707/how-can-i-make-an-svg-scale-with-its-parent-container
        renderChart: function() {
            var self = this;

            this.currentStroke = 1;

            self.renderGrid();

            _.times(this.options.strokes, function(i) {
                self.renderStrokes();
                self.currentStroke++;
            });

        },

        renderPath: function(path) {
            // is eq current stroke
            // style class diff for active
            // else < current, style for inactive
            // if > current, ignore.
            var self = this,
                currentStroke = this.currentStroke,
                w = this.options.width,
                h = this.options.height,
                strokes = this.options.strokes,
                attrs = path['$'],
                pathStroke = attrs.id.split('kvg:' + this.model.get('id') + '-s')[1];

                pathStroke = parseFloat(pathStroke);

            if(pathStroke <= currentStroke) { 
                var $p = this.svg.path(attrs['d']),
                    matrix = new Snap.Matrix();

                var rowLimit = Math.ceil(w / 100),
                    rows = Math.ceil(strokes / rowLimit),
                    currentRow = Math.ceil(currentStroke / rowLimit),
                    xTrans = (currentStroke * 100) - 100, 
                    yTrans = 0;

                if(xTrans >= w) {
                    yTrans = (currentRow * 100) - 100;
                    xTrans = ((currentStroke - (rowLimit * (currentRow - 1))) * 100) - 100;
                    // xTrans = ((currentStroke - rowLimit) * 100) - 100;
                }

                matrix.translate(xTrans + 5, yTrans + 5);
                matrix.scale(0.8, 0.8);

                if(pathStroke === currentStroke) {
                    $p.addClass('current');

                    // render a circle at the start of the stroke 
                    // using pathSegList (soon depricated)
                    var startCoords = $p.node.pathSegList['0'];
                    this.svg.circle(startCoords.x, startCoords.y, 5).addClass('marker').transform(matrix);
                }

                $p.transform(matrix);

            }
        },

        traverseGroup: function(group) {
            var self = this;

            if(group['path']) {
                // render paths
                // specify group number
                _.each(group['path'], function(path) {
                    self.renderPath(path);
                });
            }

            if(group['g']) {
                _.each(group['g'], function(grp) {
                    self.traverseGroup(grp)
                });
            }
        },

        renderStrokes: function() {
            var self = this,
                top = this.model.get('svg');
            

            if(top['g']) {
                _.each(top['g'], function(grp) {
                    self.traverseGroup(grp)
                });
            }

            if(top['path']) {
                // render paths
                // specify group number
                _.each(top['path'], function(path) {
                    self.renderPath(path);
                });
            }
        },

        renderGrid: function() {
            var self = this,
                w = this.options.width,
                h = this.options.height,
                strokes = this.options.strokes,
                currentStroke = this.currentStroke,
                cols = Math.ceil(w / 100),
                rows = Math.ceil(strokes / cols);

            // top horiz
            this.svg.line(1, 1, w - 1, 1).addClass('grid border');
            // btn horiz
            this.svg.line(1, h - 1, w - 1, h - 1).addClass('grid border');
            // left vert
            this.svg.line(1, 1, 1, h - 1).addClass('grid border');
            // right vert
            this.svg.line(w - 1, 1, w - 1, h - 1).addClass('grid border');

            _.times(cols, function(i) {
                var x = i * 100;
                self.svg.line(x, 0, x, h).addClass('grid border-inner');
            });

            _.times(cols * 2, function(i) {
                var x = i * 50;
                self.svg.line(x, 0, x, h).addClass('grid border-inner dotted');
            });

            _.times(rows * 2, function(i) {
                var y = i * 50;
                self.svg.line(0, y, w, y).addClass('grid border-inner dotted');
            });

            if(rows > 1) {
                _.times((rows), function(i) {
                    var y = i * 100;
                    self.svg.line(0, y, w, y).addClass('grid border-inner');
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
            'click .process-btn': 'processEntries',
            'click .clear-btn': 'clearEntries',
            'click .get-wanikani': 'processWaniKani'
        },

        ui: {
            'input': 'textarea',
            'btns': '.actions .btn'
        },

        regions: {
            'queue': '.character-queue'
        },

        serializeData: function() {
            var cookies = Cookies.get();

            return {
                wk_key: cookies['wk_key']
            }
        },

        initialize: function() {
            var self = this;

            this.key = App.data.key;
            this.itemQueue = App.data.itemQueue || new Backbone.Collection();

            this.listenTo(this.itemQueue, 'add remove reset', function() {
                self.checkReady();
            });

        },

        onBeforeShow: function() {
            this.queue.show(new Home.QueueList({
                collection: this.itemQueue
            }));

            this.checkReady();
        },

        checkReady: function() {
            if(this.itemQueue.length) {
                this.ui.btns.removeClass('hidden');
            } else {
                this.ui.btns.addClass('hidden');
            }
        },

        addEntry: function(evt) {
            var self = this,
                input = this.ui.input.val();

            if(_.isEmpty(input)) { return; }

            _.each(input, function(character) {
                self.addCharacter(character);
            });

            this.ui.input.empty();
        },

        addCharacter: function(character, data) {
            var self = this,
                target = character,
                hex = he.encode(character),
                id;

            data = data || {};

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
                    self.itemQueue.add(_.extend({
                        id: id,
                        target: target,
                        hex: hex
                    }, data));                       
                }

            }
        },

        processEntries: function() {
            if(!this.itemQueue.length) { return; }
            var format = this.$('input[name="template-format"]').val();

            // App.data.user_settings.set('template-format', format);
            App.data.itemQueue = this.itemQueue;
            App.router.navigate('worksheet', { trigger: true });
        },

        clearEntries: function() {
            this.itemQueue.reset();
        },

        processWaniKani: function(evt) {
            var self = this,
                wkKey = this.$('input[name="api"]').val(),
                percent = this.$('input[name="crit-percent"]').val(),
                $btn = $(evt.currentTarget),
                $error = this.$('.wk-error'),
                btnText = $btn.text();

            if(_.isEmpty(wkKey)) { return; }

            $error.empty().addClass('hidden');

            Cookies.set('wk_key', wkKey);

            $btn.attr('disabled', true).html('<i class="fa fa-spin fa-cog" />');

            this.waniKani = new App.Entities.WaniKani({}, {
                api_key: wkKey,
                percent: percent || '95'
            });

            this.waniKani.fetch({
                success: function(model) {
                    $btn.removeAttr('disabled').html(btnText);

                    if(model.get('error')) {
                        return $error.html(model.get('error').message).removeClass('hidden');
                    }

                    var info = model.get('requested_information'),
                        kanji = _.where(info, { type: 'kanji' });

                    _.each(kanji, function(val, key) {
                        self.addCharacter(val.character, val);
                    });

                },
                error: function() {
                    $error.html('API Request failed. :(').removeClass('hidden');
                }
            })
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
                title: 'ホーム'
            },
            {
                name: 'worksheet',
                title: 'ワークシート'
            },
            {
                name: 'about',
                title: 'アボウート'
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

    Worksheet.TemplateView = Marionette.LayoutView.extend({
        template: 'worksheet/template',

        initialize: function() {
            this.strokeCount = this.collectStrokeCount();
            this.format = App.data.user_settings.get('template_format') || 'large';
        },

        regions: {
            'strokes': '.stroke-order',
            'practice': '.practice-grid'
        },

        ui: {
            'strokeOrder': '.stroke-order'
        },

        serializeData: function() {
            return _.extend({
                format: this.format
            }, this.model.toJSON());
        },

        onBeforeShow: function() {
            var charsPerRow = 6;

            this.strokes.show(new App.Views.Charts.StrokeOrderSVG({
                model: this.model,
                strokes: this.strokeCount,
                width: charsPerRow <= this.strokeCount ? charsPerRow * 100 : this.strokeCount * 100,
                height: this.strokeCount > charsPerRow ? (Math.ceil(this.strokeCount / charsPerRow) * 100) : 100
            }));
        },

        collectStrokeCount: function() {
            var data = this.model.toJSON(),
                id = data.id,
                svg = data.svg,
                count = 0;

            function traverseChildren (arr) {
                _.each(arr, function(obj) {
                    if(obj['path']) {
                        count += obj['path'].length;
                    }

                    if(obj['g']) {
                        traverseChildren(obj['g']);
                    }
                });
            }

            if(svg['g']) {
                traverseChildren(svg['g']);
            }

            if(svg['path']) {
                count += svg.path.length;
            }

            return count;
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
                    return App.router.navigate('index', { trigger: true });
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
        url: 'data/key.json',

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
                    try {
                        formulae.push(_.toArray(model.toJSON()));
                    } catch(e) {
                        console.error(e);
                    }
                });

                callback(null, new Backbone.Collection(_.flatten(formulae)));
            });
        }
    });

    Entities.FormulaSet = Backbone.Model.extend({
        initialize: function(attrs, opts) {
            if(!opts.file && !opts.targets) { return console.error('no filename or target entities provided.'); }

            this.url = 'data/' + opts.file + '.json';
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
App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

    Entities.UserSettings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('UserSettings'),
        
        defaults: {
            template_format: 'large'
        }
    });

});
App.module("Entities", function(Entities, App, Backbone, Marionette, $, _){

	Entities.WaniKani = Backbone.Model.extend({
		initialize: function(attrs, opts) {
			this.url = 'http://www.wanikani.com/api/user/' + opts.api_key + '/critical-items/' + opts.percent;
		},

		fetch: function(options) {
			var self = this;

			$.ajax({
				url: this.url,
				dataType: 'jsonp',
				success: function(data) {
					self.set(data);
					if(options.success) {
						options.success(self);
					}
				},
				error: function() {
					if(options.error) {
						options.error(arguments);
					}
				}
			})
		}
	});
});