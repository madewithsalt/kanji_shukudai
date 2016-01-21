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