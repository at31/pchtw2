// http://eslint.org/docs/user-guide/configuring

/*module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
*/

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  "env": {
    "node": true,
    "es6": true
  },
  extends: ['yandex'],
  
  // add your custom rules here
  'rules': {    
    'no-used-vars':0,
    'max-len':0,
    'no-shadow' :0,
    'vars-on-top' :0,
    'no-undef' :0,
    'new-cap' :0, // яндекс прогнали бы САМИ СВОЙ КОД ЧЕРЕЗ СВОЙ ЛИНТЕР
    'prefer-const' :0 
  }
}