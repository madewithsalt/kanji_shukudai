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