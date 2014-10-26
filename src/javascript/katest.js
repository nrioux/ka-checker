var traverse = require('ast-traverse');
var _ = require('lodash/dist/lodash.compat');

/**
 * Context objects keep track of problems found in checked AST nodes
 */
function Context() {
    this.errors = [];
    this.warnings = [];
    this.isValid = true;
}

Context.prototype.error = function (message, node) {
    this.isValid = false;
    this.errors.push({
        level: 'error',
        message: message,
        node: node
    });
};

Context.prototype.warning = function (message, node) {
    this.warnings.push({
        level: 'warning',
        message: message,
        node: node
    });
};

/**
 * Takes parsed JS code and runs the specified tests against it.
 *
 * @param {Object} options A map with the following values:
 * - whitelist: a list of node types that must appear in the AST
 * - blacklist: a list of node types to block
 * - recognizers: functions that  determine whether a given AST node is allowed
 *                Recognizers take a context object and an AST node and should call
 *                context.error() or context.warning() if a problem is found.
 * @return {Object} An object with the following properties:
 * - isValid: boolean indicating if all tests passed
 * - errors: list of errors
 *           Each error is an object with a message and node attribute.
 * - warnings: list of warnings
 */
module.exports = function checkAST(ast, options) {
    options = _.defaults(options || {}, {
        whitelist: [],
        blacklist: [],
        recognizers: []
    });
    var recognizers = _.clone(options.recognizers);
    var whitelist = {};
    _.forEach(whitelist, function (nodeType) {
        whitelist[nodeType] = false;
    });

    // Add a recognizer to reject all blacklisted node types
    recognizers.push(function (context, node) {
        if (_.contains(options.blacklist, node.type)) {
            context.error('Forbidden language construct: ' + node.type, node);
        }
    });

    var ctx = new Context();

    // Walk through the AST
    traverse(ast, {
        pre: function (node, parent, prop, idx) {
            console.log({
                node: node,
                parent: parent,
                prop: prop,
                idx: idx
            });

            // Keep track of which whitelisted properties have been found
            if (_.has(whitelist, node.type)) {
                whitelist[node.type] = true;
            }
            // Run each recognizer on each node
            _.each(recognizers, function (rec) {
                rec(ctx, node);
            });
        }
    });

    // Ensure that all whitelisted node types were used
    _.forOwn(whitelist, function (found, nodeType) {
        if (!found) {
            ctx.error('Expected construct not found: ' + nodeType);
        }
    });

    return ctx;
};
