var traverse = require('ast-traverse');

module.exports = [
    { 
        name: 'Must use "for loop" and "variable declaration"', 
        options: {
            whitelist: ['ForStatement', 'VariableDeclarator']
        }
    }, {
        name: 'Must not use "while loop" or "if statement"',
        options: {
            blacklist: ['WhileStatement', 'IfStatement']
        }
    }, {
        name: 'Must use "if" inside of "for"',
        options: {
            templates: [{
                'ForStatement': 'IfStatement'
            }]
        }
    }
];
