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

function getHexCode(kvgId) {
    var id = '&#x' + kvgId.split('kvg:kanji_')[1] + ';'

    return id;
}

function getKvgId (kvgId) {
    return kvgId.split('kvg:kanji_')[1];
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
            console.log('Output dir exists. Over-writing files ...');
        }

        // this will be the file called "key.json"
        var key = {};

        _.each(clusters, function(group, i) {
            var fileName = 'kanji_' + (i + 1),
                lastIndex = group.length - 1,
                output = {};

            key[fileName] = [];

            _.each(group, function(item) {
                var svg = item['g'][0],
                    id = getKvgId(item['$'].id),
                    result = {
                        '$': _.extend(item['$'], { 
                            hex: getHexCode(item['$'].id),
                            id: getKvgId(item['$'].id
                        }),
                        svg: svg
                    };

                key[fileName].push(id);
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