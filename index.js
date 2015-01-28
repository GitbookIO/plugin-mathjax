var Q = require('q');
var fs = require('fs');
var path = require('path');
var crc = require('crc');
var exec = require('child_process').exec;
var mjAPI = require('MathJax-node/lib/mj-single.js');

var started = false;
var countMath = 0;
var parsed = {};

function escapeShellArg(arg) {
    var ret = '';
    ret = arg.replace(/"/g, '\\"');
    return "\"" + ret + "\"";
}

function convertTexToSvg(tex, outputPath, options) {
    var d = Q.defer();
    options = options || {};

    if (!started) {
        mjAPI.config({MathJax: {SVG: {font: 'TeX'}}});
        mjAPI.start();
        started = true;
    }

    mjAPI.typeset({
        math: tex,
        format: (options.inline ? 'inline-TeX' : 'TeX'),
        svg: true,
        speakText: options.speakText || "default",
        speakRuleset: (options.speechrules || "mathspeak").replace(/^chromevox$/i, 'default'),
        speakStyle: options.speechstyle || "default",
        ex: options.ex || 6,
        width: options.width || 100,
        linebreaks: !!options.linebreaks
    }, function (data) {
        if (data.errors) {
            console.log(data.errors)
            return d.reject(new Error(data.errors));
        }

        fs.writeFileSync(outputPath, data.svg);
        d.resolve();
    });

    return d.promise;
}

module.exports = {
    blocks: {
        math: {
            shortcuts: {
                parsers: ["markdown"],
                start: "$$",
                end: "$$"
            },
            process: function(blk) {
                var that = this;
                var tex = blk.body;
                var fileOutput = "_mathjax/"+countMath+".svg";

                var hashTex = crc.crc32(tex).toString(16);


                that.book.log.info("process TeX using MathJAX", countMath, tex);
                return Q()
                .then(function() {
                    if (parsed[hashTex]) {
                        fileOutput = "_mathjax/"+parsed[hashTex]+".svg";
                        return;
                    }

                    parsed[hashTex] = countMath;
                    countMath = countMath + 1;
                    return convertTexToSvg(tex, path.resolve(that.book.options.output, fileOutput))
                })
                .then(function() {
                    that.book.log.info.ok();
                    return "<img src='/"+fileOutput+"' />";
                }, function(err) {
                    that.book.log.info.fail();
                    throw err;
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
