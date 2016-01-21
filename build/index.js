var _ = require('underscore'),
    fs = require('fs'),
    glob = require('glob'),
    xml2js = require('xml2js');

var XMLFilename = 'kanjivg-20150615-2.xml',
    outputDestination = '../app/assets/data';


var parser = new xml2js.Parser();

// utils
function split(a, n) {
    var len = a.length,
        out = [], 
        i = 0;

    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    
    return out;
}

function getUniCodeChar(kvgId) {
    var id = kvgId.split('kvg:0')[1];

    return id;
}

function getKvgId (kvgId) {
    return kvgId.split('kvg:')[1];
}

function getAttributes(attrs) {
    var result = {};

    _.each(attrs, function(val, key) {
        var name;

        if(key.indexOf('kvg:') === 0) {
            name = key.split('kvg:')[1];                
        } else {
            name = key;                
        }

        result[name] = val.indexOf('kvg:') === 0 ? val.split('kvg:')[1] : val;
    });

    return result;
}

console.log('Reading xml file ...');

fs.readFile('data/' + XMLFilename, 'utf8', function(err, data) {
    if (err) throw err;

    console.log('File read! parsing XML ...');

    parser.parseString(data, function (err, result) {

        var kanji = result.kanjivg.kanji;
        console.log('Parse complete! Read ' + kanji.length + ' formulae.');

        var clusters = split(kanji, Math.ceil(kanji.length / 500));

        console.log('Dividing results into ' + clusters.length + ' json data files of 500 characters.');

        try {
            fs.mkdirSync(outputDestination);
        } catch(e) {
            console.log('Output dir exists. Cleaning dir and re-writing files ...');
            // Find files
            glob(outputDestination + "/*",function(err, files){
                 if (err) throw err;
                 // files.forEach(function(item,index,array){
                 //      console.log(item + " found");
                 // });

                 // Delete files
                 files.forEach(function(item,index,array){
                      fs.unlinkSync(item);
                      console.log(item + 'deleted.');
                 });
            });

        }

        // this will be the file called "key.json"
        var key = {};

        _.each(clusters, function(group, i) {
            var fileName = 'kanji_' + (i + 1),
                lastIndex = group.length - 1,
                output = {};

            key[fileName] = [
                getUniCodeChar(group[0]['g'][0]['$'].id),
                getUniCodeChar(group[lastIndex]['g'][0]['$'].id)
            ];

            _.each(group, function(item) {
                var svg = item['g'][0],
                    id = getKvgId(svg['$'].id),
                    uni = getUniCodeChar(svg['$'].id),
                    result = {
                        attrs: _.extend(getAttributes(svg['$']), { 
                            uni: uni
                        }),
                        svg: _.omit(svg, '$')
                    };

                output[id] = result;
            });

            fs.writeFile(outputDestination + '/' + fileName + '.json', JSON.stringify(output), 'utf8', function(err) {
              if (err) throw err;
              console.log('Saved ' + fileName + '.json');
            });
        });

        fs.writeFile(outputDestination + '/key.json', JSON.stringify(key), 'utf8', function(err) {
          if (err) throw err;
          console.log('Saved key.json');
        });


    });
    
});