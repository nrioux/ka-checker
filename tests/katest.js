var checkAST = require('../src/javascript/katest.js');
var assert = require('assert');
var fs = require('fs');
var Parser = require('esprima');

function parse(code) {
    return Parser.parse(code, {loc: true});
}


function testString(code, opts, isValid) {
    var ast = parse(code);
    var result = checkAST(ast, opts);
    assert.equal(result.isValid, isValid);
}

function testFile(file, opts, isValid) {
    var code = fs.readFileSync('tests/testcases/' + file + '.js');
    testString(code, opts, isValid);
}


describe('checkAST', function () {
    describe('whitelisted for for and variable declaration', function () {
        var opts = {
            whitelist: ['ForStatement', 'VariableDeclarator']
        };

        it('should match a for loop with a variable declaration', function () {
            testFile('forif', opts, true);
        });

        it('should not match an empty program', function () {
            testString('', opts, false);
        });

        it('should not match a function without a loop', function () {
            testFile('fib', opts, false);
        });
    });

    describe('blacklisted while and if', function () {
        var opts = {
            blacklist: ['WhileStatement', 'IfStatement']
        };

        it('should match an empty program', function () {
            testString('', opts, true);
        });

        it('should not match a function with an if', function () {
            testFile('fib', opts, false);
        });

        it('should match omega', function () {
            testFile('omega', opts, true);
        });
    });

    describe('if inside of for template', function () {
        var opts = {
            templates: {
                'ForStatement': 'IfStatement'
            }
        };

        it('should not match an empty program', function () {
            testString('', opts, false);
        });

        it('should match a for loop with an if statement', function () {
            testFile('forif', opts, true);
        });

        it('should not match a function with an if statement but no loops', function () {
            testFile('fib', opts, false);
        });
    });

    describe('function declaration with an if and a return template', function () {
        var opts = {
            templates: {
                'FunctionDeclaration': ['IfStatement', 'ReturnStatement']
            }
        };
        it('should not match functions without ifs', function () {
            testFile('omega', opts, false);
        });
        it('should match a function with returns inside of an if', function () {
            testFile('fib', opts, true);
        });
        it('should not match an if without a function', function () {
            testFile('forif', opts, false);
        });
        it('should not match two functions, one with an if and the other with a return', function () {
            testFile('twofunc', opts, false);
        });
    });
});
