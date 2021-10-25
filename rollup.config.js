import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import extensions from 'rollup-plugin-extensions';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

export default [
	{
		input: pkg.source,
		output: [
			{ file: pkg.main, format: 'cjs', sourcemap: true },
			{ file: pkg.module, format: 'esm', sourcemap: true },
		],
		plugins: [
			nodeResolve(),
			commonjs({
				include: 'node_modules/**',
			}),
			external(),
			babel({
				babelHelpers: 'runtime',
				exclude: [
					'node_modules/**',
				],
			}),
			del({ targets: ['dist/*'] }),
			extensions({
				extensions: ['.jsx', '.js', '.tsx', '.ts'],
				resolveIndex: true,
			}),
			typescript({
				lib: ['es5', 'es6', 'dom'],
				target: 'es5',
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
					types: pkg.types,
					main: pkg.main.replace('dist/', ''),
					module: pkg.module.replace('dist/', ''),
				},
			}),
		],
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],
	},
	{
		input: 'src/index.ts',
		plugins: [dts()],
		output: {
			file: pkg.types,
			format: 'esm',
		},
	},
];
