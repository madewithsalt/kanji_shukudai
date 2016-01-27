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
						options.error();
					}
				}
			})
		}
	});
});