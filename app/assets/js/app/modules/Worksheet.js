App.module("Worksheet", function(Worksheet, App, Backbone, Marionette, $, _) {

    Worksheet.TemplateView = Marionette.LayoutView.extend({
        template: 'worksheet/template',

        initialize: function() {
            this.strokeCount = this.collectStrokeCount();
        },

        regions: {
            'strokes': '.stroke-order'
        },

        ui: {
            'strokeOrder': '.stroke-order'
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