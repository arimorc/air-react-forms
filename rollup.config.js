import update from 'immutability-helper';

import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

import del from 'rollup-plugin-delete';
import generatePackageJson from 'rollup-plugin-generate-package-json';

import pkg from './package.json';
import tsconfig from './tsconfig.json';

const external = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.peerDependencies || {}),
	'react/jsx-runtime',
];

export default [
	{
		input: pkg.source,
		output: [
			{ file: pkg.main, format: 'cjs', sourcemap: true },
			{ file: pkg.module, format: 'esm', sourcemap: true },
		],
		plugins: [
			del({ targets: ['dist/*'] }),
			typescript({
				tsconfig: './tsconfig.json',
			}),
			generatePackageJson({
				baseContents: {
					name: pkg.name,
					description: pkg.description,
					author: pkg.author,
					version: pkg.version,
					respository: pkg.repository,
					license: pkg.license,
					keywords: pkg.keywords,
					types: 'index.d.ts',
					main: pkg.main.replace('dist/', ''),
					module: pkg.module.replace('dist/', ''),
					peerDependencies: pkg.peerDependencies,
				},
			}),
		],
		external,
	},
	{
		input: 'dist/types/index.d.ts',
		plugins: [
			dts(update(tsconfig, {
				compilerOptions: {
					baseUrl: { $set: 'dist/types' },
				},
			})),
			del({
				targets: ['dist/types'],
				hook: 'buildEnd',
			}),
		],
		output: {
			file: pkg.types,
			format: 'esm',
		},
		external,
	},
];
