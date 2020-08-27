import createDebug from 'debug';
import { Eq, getStructEq, eqNumber, eqString, eq } from 'fp-ts/lib/Eq';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

type Point = {
	x: number,
	y: number,
};

describe(`${currentFile}`, () => {
	test('elem equal', () => {
		function elem<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
			return (a, as) => as.some(item => E.equals(item, a));
		}

		const result1 = elem(eqNumber)(3, [1, 3, 5]);
		debug('result1:', result1);

		const result2 = elem(eqString)('a', ['a', 'b', 'c']);
		debug('result2:', result2);

		const result3 = elem(eqString)('d', ['a', 'b', 'c']);
		debug('result3:', result3);
	});

	describe('customize eqPoint', () => {
		const eqPoint: Eq<Point> = {
			equals: (p1, p2) => p1 === p2 || p1.x === p2.x && p1.y === p2.y,
		};
		testPointEq(eqPoint);
	});

	describe('getStructEq eqPoint', () => {
		const eqPoint = getStructEq({
			x: eqNumber,
			y: eqNumber,
		});
		testPointEq(eqPoint);
	});
});

function testPointEq(eqPoint: Eq<Point>) {
	describe('eqPoint:equal', () => {
		test('same', () => {
			const point = { x: 1, y: 1 };
			const result = eqPoint.equals(point, point);
			expect(result).toBe(true);
		});

		test('different', () => {
			const result = eqPoint.equals(
				{ x: 1, y: 1 },
				{ x: 1, y: 1 }
			);
			expect(result).toBe(true);
		});
	});

	test('eqPoint:noEqual', () => {
		const result = eqPoint.equals(
			{ x: 1, y: 1 },
			{ x: 1, y: 2 }
		);
		expect(result).toBe(false);
	});
}
