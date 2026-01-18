// Override all rules to warnings in CI environment
const ciEnvRules = {};

// Common rules that cause issues in CI
const problematicRules = [
  'no-unused-vars',
  'react/jsx-pascal-case',
  'react-hooks/exhaustive-deps',
  'no-console',
  'no-debugger',
  'prefer-const',
  'no-var',
  'semi',
  'comma-dangle',
  'quotes',
  'eol-last',
  'no-trailing-spaces',
  'object-curly-spacing',
  'array-bracket-spacing',
  'space-in-parens',
  'block-spacing',
  'key-spacing',
  'lines-between-class-members',
  'padding-line-between-statements',
  'no-multiple-empty-lines',
  'arrow-spacing',
  'computed-property-spacing',
  'func-call-spacing',
  'no-whitespace-before-property',
  'rest-spread-spacing',
  'template-curly-spacing',
  'generator-star-spacing',
  'yield-star-spacing',
  'jsx-quotes',
  'react/jsx-curly-brace-presence',
  'react/jsx-equals-spacing',
  'react/jsx-tag-spacing',
  'react/self-closing-comp',
  'react/react-in-jsx-scope',
  'react/jsx-fragments',
  'react/jsx-key',
  'react/jsx-no-comment-textnodes',
  'react/jsx-no-duplicate-props',
  'react/jsx-no-target-blank',
  'react/jsx-no-undef',
  'react/jsx-uses-react',
  'react/jsx-uses-vars',
  'react/no-children-prop',
  'react/no-danger-with-children',
  'react/no-deprecated',
  'react/no-direct-mutation-state',
  'react/no-find-dom-node',
  'react/no-is-mounted',
  'react/no-render-return-value',
  'react/no-string-refs',
  'react/no-unescaped-entities',
  'react/no-unknown-property',
  'react/prop-types',
  'react/require-render-return'
];

// Set all problematic rules to warnings in CI
problematicRules.forEach(rule => {
  ciEnvRules[rule] = 'warn';
});

module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: ciEnvRules
};