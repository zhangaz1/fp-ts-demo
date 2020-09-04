import * as fp from 'fp-ts';
import { isNone } from 'fp-ts/lib/Option';
import { stringifyJSON } from 'fp-ts/lib/Either';

const currentFile = __filename.replace(process.env.PWD, '');

describe(`${currentFile}`, () => {
	test('bad', () => {
		interface Person {
			name: string;
			age: number;
		}

		function person(name: string, age: number): Person {
			return { name, age };
		}

		const p = person('', -1.2);
		expect(p)
			.toEqual({ name: '', age: -1.2 });
	});

	describe('smart t', () => {
		interface NonEmptyStringSymbol {
			readonly NoneEmptySymbol: unique symbol;
		}

		type NonEmptyString = string & NonEmptyStringSymbol;

		function isNonEmptyString(s: string): s is NonEmptyString {
			return s.length > 0;
		}

		function makeNonEmptyString(s: string): fp.option.Option<NonEmptyString> {
			return isNonEmptyString(s)
				? fp.option.some(s)
				: fp.option.none;
		}

		test('non empty string', () => {
			expect(makeNonEmptyString(''))
				.toEqual(fp.option.none);

			expect(makeNonEmptyString('abc'))
				.toEqual(fp.option.some('abc'));
		});

		interface IntSymbol {
			readonly Int: unique symbol;
		}

		type Int = number & IntSymbol;

		function isInt(n: number): n is Int {
			return Number.isInteger(n) && n >= 0;
		}

		function makeInt(n: number): fp.option.Option<Int> {
			return isInt(n)
				? fp.option.some(n)
				: fp.option.none;
		}

		test('make int', () => {
			expect(makeInt(0.5))
				.toEqual(fp.option.none);
			expect(makeInt(-1))
				.toEqual(fp.option.none);

			expect(makeInt(2.0))
				.toEqual(fp.option.some(2));
		});

		interface Person {
			name: NonEmptyString;
			age: Int;
		}

		function person(name: NonEmptyString, age: Int) {
			return {
				name,
				age,
			};
		}

		test('person', () => {
			const goodName = makeNonEmptyString('Giulio');
			const badName = makeNonEmptyString('');

			const goodAge = makeInt(45);
			const badAge = makeInt(-1.2);

			const makePerson = (name: fp.option.Option<NonEmptyString>, age: fp.option.Option<Int>): fp.option.Option<Person> => fp.option.option.chain(
				name,
				(name: NonEmptyString) => fp.option.option.map(
					age,
					(age: Int) => person(name, age)
				)
			);

			expect(makePerson(goodName, goodAge))
				.toEqual(fp.option.some(person('Giulio' as NonEmptyString, 45 as Int)));

			expect(makePerson(goodName, badAge))
				.toEqual(fp.option.none);

			expect(makePerson(badName, goodAge))
				.toEqual(fp.option.none);

			expect(makePerson(badName, badAge))
				.toEqual(fp.option.none);
		})
	});
});
