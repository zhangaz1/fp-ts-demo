import createDebug from 'debug';
import { Eq, getStructEq, eqNumber, eqString, contramap } from 'fp-ts/lib/Eq';
import { getEq } from 'fp-ts/lib/Array';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

type Point = {
	x: number,
	y: number,
};

type Vector = {
	from: Point,
	to: Point,
};

type User = {
	id: number,
	name: string,
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

	describe('vector equal', () => {
		const eqPoint: Eq<Point> = getStructEq({
			x: eqNumber,
			y: eqNumber,
		});

		const eqVector: Eq<Vector> = getStructEq({
			from: eqPoint,
			to: eqPoint,
		});

		test('equal:', () => {
			const v1 = { from: { x: 1, y: 1 }, to: { x: 2, y: 3 } };
			const v2 = { from: { x: 1, y: 1 }, to: { x: 2, y: 3 } };
			const result = eqVector.equals(v1, v2);
			expect(result).toBe(true);
		});


		test('not equal:', () => {
			const v1 = { from: { x: 1, y: 1 }, to: { x: 2, y: 3 } };
			const v2 = { from: { x: 1, y: 1 }, to: { x: 2, y: 4 } };
			const result = eqVector.equals(v1, v2);
			expect(result).toBe(false);
		});
	});

	describe('array getEq', () => {
		const eqPoint = getStructEq({
			x: eqNumber,
			y: eqNumber,
		});

		const eqArrayOfPoints = getEq(eqPoint);

		describe('equal', () => {
			test('empty', () => {
				const result = eqArrayOfPoints.equals([], []);
				expect(result).toBeTruthy();
			});

			test('not empty', () => {
				const result = eqArrayOfPoints.equals([{ x: 1, y: 1 }], [{ x: 1, y: 1 }]);
				expect(result).toBeTruthy();
			});
		});

		describe('not equal', () => {
			test('empty and not empty', () => {
				expect(
					eqArrayOfPoints.equals(
						[],
						[{ x: 1, y: 2 }]
					)
				).toBeFalsy();
			});

			test('different', () => {
				expect(
					eqArrayOfPoints.equals(
						[{ x: 1, y: 1 }],
						[{ x: 2, y: 1 }],
					)
				).toBeFalsy();
			});

			test('length different', () => {
				expect(
					eqArrayOfPoints.equals(
						[{ x: 1, y: 1 }],
						[{ x: 1, y: 1 }, { x: 2, y: 2 }]
					)
				).toBeFalsy();
			});
		});
	});

	describe('contramap', () => {
		const eqUser: Eq<User> = contramap((user: User) => user.id)(eqNumber);

		test('equal', () => {
			expect(
				eqUser.equals(
					{ id: 1, name: 'zs' },
					{ id: 1, name: 'zs' }
				)
			).toBeTruthy();

			expect(
				eqUser.equals(
					{ id: 1, name: 'zs' },
					{ id: 1, name: 'ls' }
				)
			).toBeTruthy();
		});

		test('not equal', () => {
			expect(
				eqUser.equals(
					{ id: 1, name: 'zs' },
					{ id: 2, name: 'ls' }
				)
			).toBeFalsy();

			expect(
				eqUser.equals(
					{ id: 1, name: 'zs' },
					{ id: 2, name: 'zs' }
				)
			).toBeFalsy();
		});
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
