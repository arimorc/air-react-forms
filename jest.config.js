module.exports = {
	moduleDirectories: [
		'node_modules',
		'src',
	],
	moduleFileExtensions: [
		'js',
		'jsx',
		'ts',
		'tsx',
		'json',
	],
	modulePathIgnorePatterns: [
		'<rootDir>/dist',
		'<rootDir>/playground',
	],
	modulePaths: [
		'<rootDir>',
		'src',
	],
	setupFiles: [
		'./setupTests.js',
	],
	snapshotSerializers: [
		'enzyme-to-json/serializer',
	],
	testRegex: 'tests/*.*.(test|spec).(js|jsx|ts|tsx)$',
	transform: {
		'^.+\\.jsx?$': 'babel-jest',
		'^.+\\.(ts|tsx)?$': 'ts-jest',
	},
};
