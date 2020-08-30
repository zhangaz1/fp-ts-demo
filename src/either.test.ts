import createDebug from 'debug';
import {
	Either,
	tryCatch,
	left,
	right,
	chain,
	mapLeft,
	getValidation,
	map,
	getValidationSemigroup,
} from 'fp-ts/lib/Either';
import { pipe, flow } from 'fp-ts/lib/function';
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray';
import { sequenceT } from 'fp-ts/lib/Apply';
import { Semigroup, getLastSemigroup } from 'fp-ts/lib/Semigroup';
import { map as arrayMap } from 'fp-ts/lib/Array';
import { Monoid, fold } from 'fp-ts/lib/Monoid';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('exceptions', () => {
		function parse(s: string): Either<Error, unknown> {
			return tryCatch(() => JSON.parse(s), reason => new Error(String(reason)));
		}

		expect(parse('')._tag).toBe('Left');
		expect(parse('{"name":"zs"}')._tag).toBe('Right');

	});

	describe('validate password', () => {
		const minLength = (s: string): Either<string, string> =>
			s.length >= 6 ? right(s) : left('at least 6 characters');

		const oneCapital = (s: string): Either<string, string> =>
			/[A-Z]/g.test(s) ? right(s) : left('at least one capital letter');

		const oneNumber = (s: string): Either<string, string> =>
			/[0-9]/g.test(s) ? right(s) : left('at least one number');

		test('pipe validate', () => {
			const validatePassword = (s: string): Either<string, string> =>
				pipe(
					minLength(s),
					chain(oneCapital),
					chain(oneNumber)
				);

			testPassword(validatePassword);
		});

		test('flow validate', () => {
			const validatePassword = flow(
				right as (s: string) => Either<string, string>,
				chain(minLength),
				chain(oneCapital),
				chain(oneNumber)
			);

			testPassword(validatePassword);
		});

		describe('getValidationSemigroup', () => {
			const lift = <A = string, E = string>(check: (a: A) => Either<E, A>): ((a: A) => Either<E[], A>) =>
				flow(
					check,
					mapLeft(a => [a])
				);

			const semigroupValidation: Semigroup<Either<string[], string>> =
				getValidationSemigroup(
					getSemigroup<string>(),
					getLastSemigroup<string>()
				);

			function validatePassword(s: string): Either<string[], string> {
				const monoidValidation: Monoid<Either<string[], string>> = {
					concat: semigroupValidation.concat,
					empty: right(s),
				};

				const validationResults = arrayMap(
					flow(
						lift,
						f => f(s)
					),
				)([
					minLength,
					oneCapital,
					oneNumber,
				]);

				return fold(monoidValidation)(validationResults);
			}

			testPasswordByValidation(validatePassword);
		});

		describe('getValidation', () => {
			function lift<E, A>(check: (a: A) => Either<E, A>): (a: A) => Either<NonEmptyArray<E>, A> {
				return flow(
					check,
					mapLeft(a => [a])
				);
			}

			const minLengthV = lift(minLength);
			const oneCapitalV = lift(oneCapital);
			const oneNumberV = lift(oneNumber);

			function validatePassword(s: string): Either<NonEmptyArray<string>, string> {
				return pipe(
					sequenceT(getValidation(getSemigroup<string>()))(
						minLengthV(s),
						oneCapitalV(s),
						oneNumberV(s)
					),
					map(() => s)
				) as Either<NonEmptyArray<string>, string>;
			}

			testPasswordByValidation(validatePassword);
		});
	});
});

function testPasswordByValidation(validatePassword) {
	test('left', () => {
		expect(
			validatePassword('ab')
		).toEqual(left([
			"at least 6 characters",
			"at least one capital letter",
			"at least one number",
		]));
	});

	test('right', () => {
		expect(
			validatePassword('A1bcdefg')
		).toEqual(right('A1bcdefg'));
	});

	test('left & righ', () => {
		expect(
			validatePassword('abcdef1')
		).toEqual(left([
			"at least one capital letter",
		]));
	});
}

function testPassword(validatePassword: (s: string) => Either<string, string>) {
	expect(validatePassword('ab')).toEqual(left('at least 6 characters'));
	expect(validatePassword('abcdef')).toEqual(left('at least one capital letter'));
	expect(validatePassword('Abcdef')).toEqual(left('at least one number'));
}