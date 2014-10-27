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
        $scope.code = 'alert("Hello, world!");';
        $scope.messages = [];
        
        $scope.checkCode = function () {
            console.log("code: " + $scope.code);
            var ast = Parser.parse($scope.code, {loc: true});
            var result = checkAST(ast, {
                whitelist: ['IfStatement']
            });
            $scope.messages = result.errors.concat(result.warnings);
            console.log($scope.messages);
        };
    }]);
