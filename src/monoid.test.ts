import createDebug from 'debug';
import {
	Monoid,
	fold,
	monoidSum,
	monoidProduct,
	monoidString,
	monoidAll,
	monoidAny,
	getStructMonoid,
} from 'fp-ts/lib/Monoid';
import {
	Option,
	getApplyMonoid,
	some,
	none,
	getFirstMonoid,
	getLastMonoid,
} from 'fp-ts/lib/Option';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	describe('monoid fold', () => {
		test('monoidSum', () => {
			expect(
				fold(monoidSum)([1, 2, 3, 4])
			).toBe(10);
		});

		test('monoidProduct', () => {
			expect(
				fold(monoidProduct)([1, 2, 3, 4])
			).toBe(24);
		});

		test('monoidString', () => {
			expect(
				fold(monoidString)(['a', 'b', 'c'])
			).toBe('abc');
		});

		test('monoidAll', () => {
			expect(
				fold(monoidAll)([true, false, true])
			).toBeFalsy();
		});

		test('monoidAny', () => {
			expect(
				fold(monoidAny)([true, false, true])
			).toBeTruthy();
		});
	});

	describe('getAppplyMonoid', () => {
		const M = getApplyMonoid(monoidSum);

		test('none', () => {
			expect(
				M.concat(some(1), none)
			).toEqual(none);
		});

		test('some', () => {
			expect(
				M.concat(some(1), some(2))
			).toEqual(some(3));
		});

		test('empty', () => {
			expect(
				M.concat(some(1), M.empty)
			).toEqual(some(1));
		});
	});

	describe('getFirstMonoid', () => {
		const M = getFirstMonoid<number>();

		test('all none', () => {
			expect(
				M.concat(none, none)
			).toEqual(none);
		});

		test('first is none', () => {
			expect(
				M.concat(none, some(2))
			).toEqual(some(2));
		});

		test('second is none', () => {
			expect(
				M.concat(some(1), none)
			).toEqual(some(1));
		});

		test('has no none', () => {
			expect(
				M.concat(some(1), some(2))
			).toEqual(some(1));
		});
	});

	describe('getLastMonoid', () => {
		const M = getLastMonoid<number>();

		test('all none', () => {
			expect(
				M.concat(none, none)
			).toEqual(none);
		});

		test('first is none', () => {
			expect(
				M.concat(none, some(2))
			).toEqual(some(2));
		});

		test('second is none', () => {
			expect(
				M.concat(some(1), none)
			).toEqual(some(1));
		});

		test('has no none', () => {
			expect(
				M.concat(some(1), some(2))
			).toEqual(some(2));
		});
	});

	describe('settings', () => {
		interface Settings {
			fontFamily: Option<string>;
			fontSize: Option<number>;
			maxColumn: Option<number>;
		}

		test('monidSettings', () => {
			const monoidSettings: Monoid<Settings> = getStructMonoid({
				fontFamily: getLastMonoid<string>(),
				fontSize: getLastMonoid<number>(),
				maxColumn: getLastMonoid<number>(),
			});

			const workspaceSettings: Settings = {
				fontFamily: some('Courier'),
				fontSize: none,
				maxColumn: some(80),
			};

			const userSettings: Settings = {
				fontFamily: some('Fira Code'),
				fontSize: some(12),
				maxColumn: none,
			};

			const foldSettings: Settings = {
				fontFamily: some('Fira Code'),
				fontSize: some(12),
				maxColumn: some(80),
			};

			expect(
				monoidSettings.concat(workspaceSettings, userSettings)
			).toEqual(foldSettings);
		});
	});
});
