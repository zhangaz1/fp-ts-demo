import * as fp from 'fp-ts';
import * as fc from 'fast-check';

const currentFile = __filename.replace(process.env.PWD, '');

describe(`${currentFile}`, () => {
	const S: fp.semigroup.Semigroup<string> = {
		concat: (x, y) => x + ' ' + y,
	};

	const associativity = (x: string, y: string, z: string) =>
		S.concat(S.concat(x, y), z) === S.concat(x, S.concat(y, z));

	test('0', () => {
		const arb: fc.Arbitrary<string> = fc.string();
		fc.assert(fc.property(arb, arb, arb, associativity));
	});
});
