var CodeMirror = require('codemirror');
// ui-codemirror expects CM to be on window
window.CodeMirror = CodeMirror;

var _ = require('lodash');
var $ = require('jquery');
var Parser = require('esprima');
var checkAST = require('./katest.js');
require('angular');
require('codemirror/mode/javascript/javascript.js');
require('./vendor/ui-codemirror.js');


angular.module('editorApp', ['ui.codemirror'])
    .controller('EditorCtrl', ['$scope', function ($scope) {
        console.log('init ctrl');
        $scope.code = 'alert("Hello, world!");if(true) {}';
        $scope.tests = require('./tests.js');
        $scope.curTest = 0;
        $scope.messages = [];
        
        // Run the tests, in a worker if possible
        $scope.checkCode = function () {
            if (false) {
                // the browser supports web workers
                
            } else {
                _.defer(function () {
                    $scope.$apply(function () {
                        var ast = Parser.parse($scope.code, {loc: true});
                        var test = $scope.tests[$scope.curTest];
                        var result = checkAST(ast, test.options);
                        $scope.messages = result.errors.concat(result.warnings);
                    });
                });
            }
        };

        // Limit how often the tests run
        $scope.codeChange = _.throttle($scope.checkCode, 1000, {leading: false});

        $scope.checkCode();
    }]);
