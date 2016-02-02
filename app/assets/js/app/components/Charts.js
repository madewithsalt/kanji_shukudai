App.module('Views.Charts', function (Charts, App, Backbone, Marionette, $, _) {

    // Snap reference: 
    // http://svg.dabbles.info/
    // http://snapsvg.io/docs
    Charts.Base = Marionette.ItemView.extend({
        template: 'blank',
        className: 'chart',

        onShow: function () {
            var id = this.model.get('id');

            this.$el.append('<svg id="svg_' + id + '" />');

            this.svg = Snap(this.$('svg')[0]);
            this.buildChartBase();
            this.renderChart();
        },

        buildChartBase: function () {
            var w = this.options.width || 200,
                h = this.options.height || 200;

            this.svg.attr('width', w)
                .attr('height', h);
        },

        renderChart: function () {}
    });


    Charts.StrokeOrderSVG = Charts.Base.extend({
        defaults: {
            drawingSize: 105,
            columns: 6
        },

        initialize: function(options) {
            options = options || {};

            this.options = _.defaults(options, this.defaults);

            var charsPerRow = this.options.columns,
                strokes = this.options.strokes,
                drawingSize = this.options.drawingSize;

            this.options.width = charsPerRow <= strokes ? charsPerRow * drawingSize : strokes * drawingSize;
            this.options.height = strokes > charsPerRow ? (Math.ceil(strokes / charsPerRow) * drawingSize) : drawingSize;
        },

        // http://stackoverflow.com/questions/19484707/how-can-i-make-an-svg-scale-with-its-parent-container
        renderChart: function() {
            var self = this;

            this.currentStroke = 1;

            self.renderGrid();

            _.times(this.options.strokes, function(i) {
                self.renderStrokes();
                self.currentStroke++;
            });

        },

        renderPath: function(path) {
            // is eq current stroke
            // style class diff for active
            // else < current, style for inactive
            // if > current, ignore.
            var self = this,
                currentStroke = this.currentStroke,
                w = this.options.width,
                h = this.options.height,
                strokes = this.options.strokes,
                // the size the svg strokes are by default
                drawingDefaultSize = 105,
                drawingSize = this.options.drawingSize,
                columns = this.options.columns,
                attrs = path['$'],
                pathStroke = attrs.id.split('kvg:' + this.model.get('id') + '-s')[1];

                pathStroke = parseFloat(pathStroke);

            if(pathStroke <= currentStroke) { 
                var $p = this.svg.path(attrs['d']),
                    matrix = new Snap.Matrix();

                var rowLimit = Math.ceil(w / drawingSize),
                    rows = Math.ceil(strokes / rowLimit),
                    currentRow = Math.ceil(currentStroke / rowLimit),
                    xTrans = (currentStroke * drawingSize) - drawingSize, 
                    yTrans = 0;

                if(xTrans >= w) {
                    yTrans = (currentRow * drawingSize) - drawingSize;
                    xTrans = ((currentStroke - (rowLimit * (currentRow - 1))) * drawingSize) - drawingSize;
                }

                var offset,
                    scale = 0.8;

                if(drawingSize != drawingDefaultSize) {
                    scale = ((drawingSize * 0.8) / drawingDefaultSize);
                }

                offset = (drawingSize - (drawingSize * 0.8)) / 2;
                    
                matrix.translate(xTrans + offset, yTrans + offset);
                matrix.scale(scale, scale);

                if(pathStroke === currentStroke) {
                    $p.addClass('current');

                    // render a circle at the start of the stroke 
                    // using pathSegList (soon depricated)
                    var startCoords = $p.node.pathSegList['0'];
                    this.svg.circle(startCoords.x, startCoords.y, 5).addClass('marker').transform(matrix);
                }

                $p.transform(matrix);

            }
        },

        traverseGroup: function(group) {
            var self = this;

            if(group['path']) {
                // render paths
                // specify group number
                _.each(group['path'], function(path) {
                    self.renderPath(path);
                });
            }

            if(group['g']) {
                _.each(group['g'], function(grp) {
                    self.traverseGroup(grp)
                });
            }
        },

        renderStrokes: function() {
            var self = this,
                top = this.model.get('svg');
            

            if(top['g']) {
                _.each(top['g'], function(grp) {
                    self.traverseGroup(grp)
                });
            }

            if(top['path']) {
                // render paths
                // specify group number
                _.each(top['path'], function(path) {
                    self.renderPath(path);
                });
            }
        },

        renderGrid: function() {
            var self = this,
                w = this.options.width,
                h = this.options.height,
                strokes = this.options.strokes,
                drawingSize = this.options.drawingSize,
                currentStroke = this.currentStroke,
                cols = Math.ceil(w / drawingSize),
                rows = Math.ceil(strokes / cols);

            // top horiz
            this.svg.line(1, 1, w - 1, 1).addClass('grid border');
            // btn horiz
            this.svg.line(1, h - 1, w - 1, h - 1).addClass('grid border');
            // left vert
            this.svg.line(1, 1, 1, h - 1).addClass('grid border');
            // right vert
            this.svg.line(w - 1, 1, w - 1, h - 1).addClass('grid border');

            _.times(cols, function(i) {
                var x = i * drawingSize;
                self.svg.line(x, 0, x, h).addClass('grid border-inner');
            });

            _.times(cols * 2, function(i) {
                var x = i * (drawingSize / 2);
                self.svg.line(x, 0, x, h).addClass('grid border-inner dotted');
            });

            _.times(rows * 2, function(i) {
                var y = i * (drawingSize / 2);
                self.svg.line(0, y, w, y).addClass('grid border-inner dotted');
            });

            if(rows > 1) {
                _.times((rows), function(i) {
                    var y = i * drawingSize;
                    self.svg.line(0, y, w, y).addClass('grid border-inner');
                });
            }

        }
    });

});