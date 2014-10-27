window = self;

var Parser = require('esprima');
var checkAST = require('./katest.js');

self.addEventListener('message', function (event) {
    try {
        var ast = Parser.parse(event.data.code, event.data.parserOptions);
        var result = checkAST(ast, event.data.testOptions);
        self.postMessage({ok: true, result: result});
    } catch (ex) {
        self.postMessage({ok: false, error: ex});
    }
});
