(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['blank.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "";
},"useData":true});
templates['error.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<h3>Something went wrong</h3>\n<p>"
    + container.escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"message","hash":{},"data":data}) : helper)))
    + "</p>\n<p>Try refreshing the page. If the problem persists, please report it as an issue at the code repo on Github with <b>detailed instructions</b> on how to reproduce. Thank you!</p>";
},"useData":true});
templates['loader.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"loading-spinner\"><i class=\"fa fa-spin fa-cog\"></i></div>";
},"useData":true});
templates['modal.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                <h4 class=\"modal-title\">"
    + container.escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"modal-dialog\">\n    <div class=\"modal-content\">\n        <div class=\"modal-header\">\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n        <div class=\"modal-body\"></div>\n    </div>\n</div>";
},"useData":true});
templates['home/home.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "checked";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<div class=\"container home-container\">\n    <div class=\"col-md-4\">\n        <h3>Add Kanji</h3>\n        <form class=\"add-character\">\n            <div class=\"panel-group\" id=\"accordion\" role=\"tablist\" aria-multiselectable=\"true\">\n                <div class=\"panel panel-default\">\n                    <div class=\"panel-heading\" role=\"tab\" id=\"headingOne\">\n                      <h4 class=\"panel-title\">\n                        <a role=\"button\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapseOne\" aria-expanded=\"true\" aria-controls=\"collapseOne\">\n                            <span class=\"collapse-text\">Manual Entry</span>\n                        </a>\n                      </h4>\n                    </div>\n                    <div class=\"panel-collapse collapse in\" id=\"collapseOne\">\n                        <div class=\"panel-body\">\n                            <textarea class=\"input form-control buffer-bottom\" rows=\"3\"></textarea>\n                            <p class=\"small\">Characters that do not have a stroke-order are ignored.</p>\n                            <a class=\"btn btn-default submit\">Add</a>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"panel panel-default\">\n                    <div class=\"panel-heading\" role=\"tab\" id=\"headingOne\">\n                      <h4 class=\"panel-title\">\n                        <span class=\"wanikani-icon\"><img src=\"img/wanikani.png\" /></span>\n                        <a role=\"button\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapseTwo\" aria-expanded=\"true\" aria-controls=\"collapseTwo\">\n                            <span class=\"collapse-text\">WaniKani API</span>\n                        </a>\n                      </h4>\n                    </div>\n                    <div id=\"collapseTwo\" class=\"panel-collapse collapse\" role=\"tabpanel\">\n                      <div class=\"panel-body\">\n                        <div class=\"control-group\">\n                            <label class=\"control-label\">API Key:</label>\n                            <input type=\"text\" class=\"form-control wanikani-api\" name=\"api\" value=\""
    + container.escapeExpression(((helper = (helper = helpers.wk_key || (depth0 != null ? depth0.wk_key : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"wk_key","hash":{},"data":data}) : helper)))
    + "\" />\n                        </div>\n                        <div class=\"control-group row buffer-top form-horizontal\">\n                            <div class=\"col-md-12\">\n                                <label class=\"control-label\">Critical Items Threshold</label>\n                            </div>\n                            <div class=\"col-md-6\">\n                                <div class=\"input-group\">\n                                    <input type=\"number\" class=\"form-control\" name=\"crit-percent\" value=\"95\" />                        \n                                    <div class=\"input-group-addon\">%</div>\n                                </div>\n                            </div>\n                            <div class=\"col-md-12\">\n                                <p class=\"small\">At what percentage did you answer correctly.</p>                        \n                            </div>\n                        </div>\n                        <div class=\"wk-error alert alert-danger hidden\"></div>\n                        <a class=\"btn btn-sm btn-default get-wanikani\">Fetch</a>\n                      </div>\n                    </div>\n                </div>\n                <div class=\"panel panel-default\">\n                    <div class=\"panel-heading\">\n                        <h4 class=\"panel-title\">\n                            <a href=\"#collapseThree\" data-parent=\"#accordion\" data-toggle=\"collapse\">\n                                Worksheet Template Settings\n                            </a>\n                        </h4>\n                    </div>\n                    <div id=\"collapseThree\" class=\"panel-collapse collapse\" role=\"tabpanel\">\n                        <div class=\"panel-body\">\n                            <div class=\"template-options\">\n                                <div class=\"radio\">\n                                    <label>\n                                        <input type=\"radio\" name=\"template-format\" value=\"large\" "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,(depth0 != null ? depth0.format : depth0),"large",{"name":"is","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " />\n                                        Large Format (2 per 'page')\n                                    </label>\n                                </div>\n                                <div class=\"radio\">\n                                    <label>\n                                        <input type=\"radio\" name=\"template-format\" value=\"condensed\" "
    + ((stack1 = (helpers.is || (depth0 && depth0.is) || alias2).call(alias1,(depth0 != null ? depth0.format : depth0),"condensed",{"name":"is","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " />\n                                        Condensed Format (3-4 per 'page')\n                                    </label>\n                                </div>\n                             </div>\n                        </div>\n                    </div>\n                </div>\n          </div>\n        </form>\n    </div>\n    <div class=\"col-md-8\">\n        <h3 class=\"queue-title\">Queue</h3>\n        <div class=\"row\">\n            <div class=\"col-md-12 actions align-right buffer-bottom\">\n                <a class=\"process-btn btn btn-primary btn-lg hidden buffer-top\">Create</a>          \n                <a class=\"clear-btn btn btn-default btn-lg hidden buffer-top\">Clear</a>          \n            </div>          \n        </div>\n        <div class=\"character-queue\"></div>\n    </div>\n</div>";
},"useData":true});
templates['home/queue-item.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<a class=\"close\">&times;</a>\n<span class=\"character\">"
    + ((stack1 = ((helper = (helper = helpers.hex || (depth0 != null ? depth0.hex : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"hex","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</span>\n";
},"useData":true});
templates['main-nav/main-nav.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<a href=\"#\" class=\"navbar-brand\">漢字の宿題 <small> v"
    + container.escapeExpression(((helper = (helper = helpers.version || (depth0 != null ? depth0.version : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"version","hash":{},"data":data}) : helper)))
    + "</small></a>\n<a class=\"pull-right menu-link menu-toggle\" data-toggle=\"collapse\" href=\"#menu\"><i class=\"fa fa-bars\"></i></a>\n<div class=\"menu-region pull-right\"></div>\n";
},"useData":true});
templates['main-nav/menu.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <li class=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isActive : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n                <a href=\"#"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.watchCount : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                </a>\n            </li>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return " active";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                        <span class=\"badge\">"
    + container.escapeExpression(((helper = (helper = helpers.watchCount || (depth0 != null ? depth0.watchCount : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"watchCount","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    <ul class=\"nav navbar-nav\" id=\"menu\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.menuItems : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </ul>\n";
},"useData":true});
templates['worksheet/base.hbs'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"formula-list\"></div>";
},"useData":true});
templates['worksheet/template.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<div class=\"kanji-info\">\n				<div class=\"well well-sm meaning\">"
    + alias4(((helper = (helper = helpers.meaning || (depth0 != null ? depth0.meaning : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"meaning","hash":{},"data":data}) : helper)))
    + "</div>\n				<div class=\"well well-sm readings\">\n					<span>"
    + alias4(((helper = (helper = helpers.onyomi || (depth0 != null ? depth0.onyomi : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"onyomi","hash":{},"data":data}) : helper)))
    + "</span>\n					<span>"
    + alias4(((helper = (helper = helpers.kunyomi || (depth0 != null ? depth0.kunyomi : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"kunyomi","hash":{},"data":data}) : helper)))
    + "</span>\n					<span>"
    + alias4(((helper = (helper = helpers.nanori || (depth0 != null ? depth0.nanori : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nanori","hash":{},"data":data}) : helper)))
    + "</span>\n				</div>\n			</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function";

  return "<div class=\"col-md-12 formula-list-item "
    + container.escapeExpression(((helper = (helper = helpers.format || (depth0 != null ? depth0.format : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"format","hash":{},"data":data}) : helper)))
    + "\">\n	<div class=\"target\">"
    + ((stack1 = ((helper = (helper = helpers.hex || (depth0 != null ? depth0.hex : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"hex","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n	<div class=\"kanji-details-container\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.meaning : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		<div class=\"stroke-order\"></div>\n	</div>\n</div>";
},"useData":true});
})();