import * as fp from 'fp-ts';
import * as fc from 'fast-check';
import { mapLeft } from 'fp-ts/lib/Either';

const currentFile = __filename.replace(process.env.PWD, '');

describe(`${currentFile}`, () => {
	const S: fp.semigroup.Semigroup<string> = {
		concat: (x, y) => x === ''
			? y
			: y === ''
				? x
				: x + ' ' + y,
	};
	const arb: fc.Arbitrary<string> = fc.string();

	const associativity = (x: string, y: string, z: string) =>
		S.concat(S.concat(x, y), z) === S.concat(x, S.concat(y, z));

	test('associativity', () => {
		fc.assert(fc.property(arb, arb, arb, associativity));
	});

	const M: fp.monoid.Monoid<string> = {
		...S,
		empty: '',
	};

	const rightIdentity = (x: string) => M.concat(x, M.empty) === x;
	const leftIdentity = (x: string) => M.concat(M.empty, x) === x;

	test('monoid instance should be lawful', () => {
		fc.assert(fc.property(arb, rightIdentity));
		fc.assert(fc.property(arb, leftIdentity));
		expect(M.concat('', M.empty)).toBe('');
	})
});
