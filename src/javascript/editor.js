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
        var worker;
        if (window.Worker) {
            worker = new Worker('editor-worker.js');
        }
        $scope.code = 'alert("Hello, world!");if(true) {}';
        $scope.tests = require('./tests.js');
        $scope.curTest = 0;
        $scope.messages = [];
        
        
        if (worker) {
            worker.addEventListener('message', function (event) {
                if (event.data.ok) {
                    $scope.receiveResult(event.data.result);
                }
            }, false);
        }

        $scope.receiveResult = function (result) {
            $scope.$apply(function () {
                $scope.messages = result.errors.concat(result.warnings);
            });
        };

        // Run the tests, in a worker if possible
        $scope.checkCode = function () {
            var test = $scope.tests[$scope.curTest];
            var parserOptions = {loc: true};
            if (worker) {
                // the browser supports web workers
                worker.postMessage({
                    code: $scope.code,
                    parserOptions: parserOptions,
                    testOptions: test.options
                });
            } else {
                _.defer(function () {
                    var ast = Parser.parse($scope.code, parserOptions);
                    var result = checkAST(ast, test.options);
                    $scope.receiveResult(result);
                });
            }
        };

        // Limit how often the tests run
        $scope.codeChange = _.throttle($scope.checkCode, 1000, {leading: false});

        $scope.checkCode();
    }]);
