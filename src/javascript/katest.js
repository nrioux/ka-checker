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

/*
 Templates may be a string containing a node type, an array of subtemplates that all must match a 
 given node, or a map of node type strings to subtemplates indicating that the subtemplate must be 
 found in the children of the key.
*/

/**
 * Determine whether a given AST node matches a given template
 */
function matches(node, templ) {
    // determine whether a child node matches a given template
    function childMatches(templ) {
        var found = false;
        _.forIn(node, function(val, prop) {
            // loop through each property on the node, determine whether
            // a given object is a node by looking at its type attribute
            if (_.isArray(val)) {
                _.forEach(val, function (child) {
                    if (_.isString(child.type) && matches(child, templ)) {
                        found = true;
                        return false;
                    }
                });
            } else if (val && _.isString(val.type) && matches(val, templ)) {
                found = true;
                return false;
            }
        });
        return found;
    }

    if (_.isString(templ)) {
        // if the template is a string, we must find a node of the given type
        return node.type == templ || childMatches(templ);
    } else if (_.isArray(templ)) {
        // if the template is an array, the current node must match each subtemplate
        return _.every(templ, function (subtempl) {
            return matches(node, subtempl);
        });
    } else {
        // the template is an object of form {nodeType: subtemplate, ...}
        return _.every(templ, function (subtempl, nodeType) {
            if (nodeType === node.type && childMatches(subtempl)) {
                return true;
            } else {
                return childMatches(templ);
            }
        });
    }
}


/**
 * Takes parsed JS code and runs the specified tests against it.
 * 
 * Note: all mentions of node types refer to the Mozilla Parser API:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
 *
 * @param {Object} options A map with the following values:
 * - whitelist: a list of node types that must appear in the AST
 * - blacklist: a list of node types to block
 * - recognizers: functions that  determine whether a given AST node is allowed
 *                Recognizers take a context object and an AST node and should call
 *                context.error() or context.warning() if a problem is found.
 * - templates: a list of templates that must match the AST
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
        recognizers: [],
        templates: []
    });
    var recognizers = _.clone(options.recognizers);
    var whitelist = {};
    _.forEach(options.whitelist, function (nodeType) {
        whitelist[nodeType] = false;
    });
    var templates = _.clone(options.templates);
    
    // Add a recognizer to reject all blacklisted node types
    recognizers.push(function (context, node) {
        if (_.contains(options.blacklist, node.type)) {
            context.error('Forbidden language construct: ' + node.type, node);
        }
    });

    var ctx = new Context();
    
    // Ideally we would check templates together with the white/blacklist.
    // However, separating the code here makes it much easier to follow,
    // and makes it easier to give good error messages.
    if((templates && !_.isArray(templates)) || (templates && templates.length >= 1)) {
        if(!matches(ast, templates)) {
            ctx.error('Template mismatch.', ast);
        }
    }

    // Walk through the AST
    traverse(ast, {
        pre: function (node) {
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
