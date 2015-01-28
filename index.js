var Q = require('q');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var convertTexToSvg = function(tex, outputPath) {
    var d = Q.defer();

    var command = path.resolve(__dirname, "node_modules/MathJax-node/bin/tex2svg");
    command = command + " '"+tex+"' > "+outputPath;

    var child = exec(command, function (error, stdout, stderr) {
        if (error) return d.reject(error);
        d.resolve();
    });

    return d.promise;
};

var countMath = 0;

module.exports = {
    blocks: {
        math: {
            shortcuts: {
                parsers: ["markdown"],
                start: "$$",
                end: "$$"
            },
            process: function(blk) {
                var tex = blk.body;
                var fileOutput = "_mathjax/"+countMath+".svg";

                return convertTexToSvg(tex, path.resolve(this.book.options.output, fileOutput))
                .then(function() {
                    countMath = countMath + 1;
                    return "<img src='/"+fileOutput+"' />";
                });
            }
        }
    },
    hooks: {
        init: function() {
            fs.mkdirSync(path.join(this.options.output, "_mathjax"));
        }
    }
};
