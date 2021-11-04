module.exports = {
	env: {
		browser: true,
		es2020: true,
		jest: true,
	},
	extends: [
		'airbnb',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 11,
		sourceType: 'module',
	},
	plugins: [
		'react',
		'@typescript-eslint',
	],
	settings: {
		'import/resolver': {
			node: {
				paths: ['src'],
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
	},
	rules: {
		// note you must disable the base rule as it can report incorrect errors
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': ['error'],
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': ['error'],
		'lines-between-class-members': 'off',
		'import/no-unresolved': [2, { ignore: ['^air-react-forms$'] }],
		'arrow-parens': ['error', 'always'],
		'comma-dangle': ['error', {
			arrays: 'always-multiline',
			objects: 'always-multiline',
			imports: 'always-multiline',
			exports: 'always-multiline',
			functions: 'ignore',
		}],
		curly: ['error', 'all'],
		'function-paren-newline': ['error', 'consistent'],
		'no-tabs': 'off',
		indent: ['error', 'tab', {
			ignoredNodes: ['JSXElement'],
			SwitchCase: 1,
		}],
		'no-underscore-dangle': ['error', { allow: ['_errors'] }],
		'react/jsx-indent': ['error', 'tab'],
		'import/no-cycle': 'error',
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
			},
		],
		'max-len': ['warn', 180],
		'no-console': 'warn',
		'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
		'no-plusplus': 'off',
		'object-curly-newline': ['warn', { consistent: true, multiline: true }],
		'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
		'prefer-promise-reject-errors': 'off',
		'react/forbid-prop-types': [1, { forbid: ['any', 'array'] }],
		'react/jsx-filename-extension': ['error', {
			extensions: ['.spec.js', '.test.js', '.test.tsx', '.jsx', '.tsx'],
		}],
		'react/jsx-indent-props': [1, 'tab'],
		'react/jsx-props-no-spreading': ['warn', {
			html: 'ignore',
			custom: 'ignore',
			exceptions: [''],
		}],
		'require-jsdoc': ['error', {
			require: {
				FunctionDeclaration: true,
				MethodDefinition: true,
				ClassDeclaration: false,
				ArrowFunctionExpression: true,
				FunctionExpression: true,
			},
		}],
		'jsx-a11y/anchor-is-valid': ['error', { components: ['Link'], specialLink: ['to'] }],
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'jsx-a11y/label-has-for': 'off',
		'jsx-a11y/label-has-associated-control': [2, {
			labelComponents: ['Label'],
			labelAttributes: ['label'],
			required: 'either',
		}],
	},
};
