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