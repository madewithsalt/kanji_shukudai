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
                    formulae.push(_.toArray(model.toJSON()));
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