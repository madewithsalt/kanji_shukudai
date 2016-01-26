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