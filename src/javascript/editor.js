var CodeMirror = require("codemirror");
var $ = require("jquery");
var _ = require("lodash");
var Parser = require("acorn");
var checkAST = require("./katest.js");
require("codemirror/mode/javascript/javascript.js");

// initialize editor
var editor = CodeMirror($('#editor').get(0), {
    lineNumbers: true,
    mode: 'javascript',
    indentUnit: 4
});


/**
 * Parse the given string.
 */
function checkCode(code) {
    var ast = Parser.parse(code);
    console.log(ast);
    var results = checkAST(ast, {
        blacklist: ['IfStatement']
    });
    return results;
}

$('#check-btn').click(function () {
    console.log(checkCode(editor.getValue()));
});
