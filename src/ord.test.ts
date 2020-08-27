import createDebug from 'debug';
import { Ord, min, max, lt, gt, fromCompare } from 'fp-ts/lib/Ord';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

type User = {
	name: string,
	age: number,
};

describe(`${currentFile}`, () => {
	const ordUser: Ord<User> = fromCompare(
		(u1, u2) => u1.age < u2.age
			? -1
			: u1.age > u2.age
				? 1
				: 0
	);

	const zs = { name: 'zs', age: 15 };
	const ls = { name: 'ls', age: 16 };

	test('min', () => {
		expect(
			min(ordUser)(zs, ls)
		).toEqual(zs);
	});

	test('max', () => {
		expect(
			max(ordUser)(zs, ls)
		).toBe(ls);
	});

	test('lt', () => {
		expect(
			lt(ordUser)(zs, ls)
		).toBeTruthy();
	});

	test('gt', () => {
		expect(
			gt(ordUser)(ls, zs)
		).toBeTruthy();
	});
});
