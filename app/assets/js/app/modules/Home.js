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

            App.data.user_settings.set('template-format', format);
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