import createDebug from 'debug';
import * as fp from 'fp-ts';
import { Reader, ask, chain, map, chainW, } from 'fp-ts/lib/Reader';
import { pipe, flow } from 'fp-ts/lib/function';
import { IO } from 'fp-ts/lib/IO';
import { stringifyJSON } from 'fp-ts/lib/Either';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);


interface Dependencies {
	readonly i18n: {
		readonly true: string;
		readonly false: string;
	},
	readonly lowerBound: number;
}

interface OtherDependencies {
	readonly semicolon: boolean;
}

declare function transform(a: string): Reader<OtherDependencies, string>
declare function anotherTransform(a: string): Reader<OtherDependencies, string>
declare function f(b: boolean): Reader<Dependencies, string>

describe(`${currentFile}`, () => {
	const instance: Dependencies & OtherDependencies = {
		i18n: {
			true: 'vero',
			false: 'falso',
		},
		lowerBound: 2,
		semicolon: false,
	};

	describe('reader', () => {
		type rt = Reader<Dependencies, string>;

		const f = (b: boolean): rt =>
			deps => (b ? deps.i18n.true : deps.i18n.false);

		const g = (n: number): rt => f(n > 2);

		const h = (s: string): rt => g(s.length + 1);

		test('true', () => {
			expect(
				h('foo')(instance)
			).toBe('vero');
		});

		test('false', () => {
			expect(
				h('a')(instance)
			).toBe('falso');
		});
	});

	describe('ask', () => {
		type rt = Reader<Dependencies, string>;

		const f = (b: boolean): rt =>
			deps => (b ? deps.i18n.true : deps.i18n.false);

		// const g = (n: number): rt =>
		// 	(deps: Dependencies) => f(n > deps.lowerBound)(deps);

		const g = (n: number): rt =>
			pipe(
				ask<Dependencies>(),
				chain(deps => f(n > deps.lowerBound))
			);

		const h = (s: string): rt => g(s.length + 1);

		test('true', () => {
			expect(
				h('foo')(instance)
			).toBe('vero');
		});

		test('true', () => {
			expect(
				h('foo')({ ...instance, lowerBound: 4 })
			).toBe('falso');
		});

		test('false', () => {
			expect(
				h('a')(instance)
			).toBe('falso');
		});
	});

	describe('composition', () => {
		const len = (s: string): number => s.length;
		const double = (n: number): number => n * 2;
		const gt2 = (n: number): boolean => n > 2;

		test('flow', () => {
			const composition = flow(
				len,
				double,
				gt2
			);

			expect(
				composition('ab')
			).toBeTruthy();

			expect(
				composition('')
			).toBeFalsy();
		});

		test('pipe map', () => {
			const composition = pipe(
				len,
				map(double),
				map(gt2)
			);

			expect(
				composition('ab')
			).toBeTruthy();

			expect(
				composition('')
			).toBeFalsy();
		});

	});

	describe('another dependencies', () => {
		// const g = (n: number) =>
		// 	pipe(
		// 		f(n > 2),
		// 		chainW(transform),
		// 		chainW(anotherTransform)
		// 	);

		const equals = (b1: boolean) => (b2: boolean) => b1 === b2;
		const always: (s: string) => IO<string> = (s: string) => () => s;
		const ifElse = (
			predicate: (b: boolean) => boolean,
			truely: () => string,
			falsely: () => string
		) => b => predicate(b) ? truely() : falsely();

		// Transform:
		const transform = (a: string) => (deps: OtherDependencies) =>
			`myString${deps.semicolon ? ':' : ''} ${a}`;

		const transform2 = (deps: OtherDependencies) => (a: string) =>
			`myString${deps.semicolon ? ':' : ''} ${a}`;

		// AnotherTransform:
		const anotherTransform = (a: string) => (deps: OtherDependencies) =>
			`${a}${deps.semicolon ? ':' : ''} myString`;

		const anotherTransform2 = (deps: OtherDependencies) => (a: string) =>
			`${a}${deps.semicolon ? ':' : ''} myString`;

		// F:
		const f = (b: boolean) => (deps: Dependencies) =>
			pipe(
				b,
				ifElse(
					equals(true),
					always(deps.i18n.true),
					always(deps.i18n.false)
				)
			);

		test('f', () => {
			expect(
				f(true)(instance)
			).toBe('vero');
		});

		const f2 = (deps: Dependencies) =>
			ifElse(
				equals(true),
				always(deps.i18n.true),
				always(deps.i18n.false)
			);

		test('f2', () => {
			expect(
				f2(instance)(true)
			).toBe('vero');
		});

		// G:
		const g = (n: number) => (deps: Dependencies & OtherDependencies) =>
			pipe(
				n > 2,
				f,
				ff => ff(deps),
				s => transform(s)(deps),
				s => anotherTransform(s)(deps)
			);

		test('g', () => {
			debug('g:', g(5)(instance));
		});

		const g2 = (deps: Dependencies & OtherDependencies) =>
			flow(
				(n: number) => n > 2,
				f2(deps),
				transform2(deps),
				anotherTransform2(deps)
			);

		test('g2', () => {
			debug('g2', g2(instance)(5));
		});
	});
});
