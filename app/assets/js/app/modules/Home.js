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

            this.ui.input.empty();
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