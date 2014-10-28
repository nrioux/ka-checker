# Live Code Checker
The structure of this project is based on [Gulp Starter](https://github.com/greypants/gulp-starter).

## Dependencies
This project depends on a few other projects to build.
- [Gulp](http://gulpjs.com/)
- [Browserify](http://browserify.org/)/[Watchify](https://github.com/substack/watchify)
- [SASS](http://sass-lang.com/) (with [compass](http://compass-style.org/))
- [Mocha](http://mochajs.org/) for unit tests

Be sure to install gulp with `npm install -g gulp`. If you have bundler, then the other build tools can be installed from the Gemfile with `bundle`.

On the client-side, a some open-source libraries are used as well:
- A bit of [Bootstrap](http://getbootstrap.com/).
- [Esprima](http://esprima.org/) was chosen over Acorn, however the code is written mostly independent of this decision. Acorn claims to be faster, but the difference was not noticable in my tests. On the other hand, Esprima conforms to the Mozilla Parser API's spec for source locations, while Acorn does not seem to. Esprima also seemed to be a more mature project.
- [Lodash](https://lodash.com/)
- [Codemirror](http://codemirror.net/)
- [AngularJS](http://angularjs.org), version 1.2 for IE8 compatibility
- [jQuery](http://jquery.com/), version 1.11 for IE8 compatibility

## Build
Before the first build, run `npm install` to install the project's dependencies.

To run the project, run `gulp`. To run the unit tests run `gulp tests`.

## API
Overall, the goal was to keep the API easy to use and reasonably efficient. It is implemented in `src/javascript/katest.js`. This file exports the checkAST(`ast`, `options`) function.
- `ast` is an abstract syntax tree as specified by the Mozilla Parser API
- `options` is an object that may contain the following keys:
  - `whitelist` is an array of node types that the code must contain
  - `blacklist` is an array of node types that the code cannot contain
  - `recognizers` is a list of recognizer functions (see below) that determine whether a given AST node is valid
  - `templates` is a template object (see below) to match the AST against

checkAST returns an object with a boolean `isValid` attribute representing whether the test completed without errors and `errors`/`warnings` attributes giving more information on problems found. Each error and warning has `message` and `node` attributes.

### Recognizers
A recognizer is a function that takes `context` and `node` arguments. If there is a problem with `node`, then it should call `context.error(node, message)`. It may also call `context.warning`.

### Templates
A template may be a string, an array of subtemplates, or an object mapping strings to subtemplates.
- If the template is a string, then it specifies the type that the current node or a descendant of it must have.
- If the template is an array of subtemplates, then every subtemplate must match the current node.
- If the template is a map from strings to subtemplates, then each subtemplate must be a descendant of a node of the type represented by the corresponding string. 

For example,
```
{
    'FunctionDeclaration': ['IfStatement', 'ReturnStatement']
}
```
Matches a function declaration with an if and a return inside of it.

## Notes
`checkAST` uses the ast-traverse module to perform a depth-first search over the given AST to check the blacklist, whitelist, and recognizers. Unfortunately, templates are more difficult to match and are currently checked in a second DFS due to time constraints. Ideally these two passes should be combined into one.
    
## Browser Compatibility
The goal was to support IE back to version 8 (unfortunately, I have no way of testing in IE8). This forces us to use an older version of Angular and the compatibility build of Lodash. The other dependencies should support IE8. Web workers are used in browsers that support them.
