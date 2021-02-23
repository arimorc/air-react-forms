module.exports = {
	moduleDirectories: [
		'node_modules',
		'src',
	],
	moduleFileExtensions: [
		'js',
		'jsx',
		'json',
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
	testRegex: 'tests/*.*.(test|spec).(js|jsx)$',
	transform: { '^.+\\.jsx?$': 'babel-jest' },
};
