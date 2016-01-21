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