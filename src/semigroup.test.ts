import createDebug from 'debug';
import {
	getApplySemigroup,
	some,
	none,
} from 'fp-ts/lib/Option';
import {
	Semigroup,
	semigroupSum,
	getMeetSemigroup,
	getJoinSemigroup,
	getStructSemigroup,
	getFunctionSemigroup,
	semigroupAll,
	fold,
	semigroupProduct,
	semigroupAny,
} from 'fp-ts/lib/Semigroup';
import {
	ordNumber,
	contramap,
} from 'fp-ts/lib/Ord';
import {
	getMonoid,
} from 'fp-ts/lib/Array';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

type Point = {
	x: number,
	y: number,
};



describe(`${currentFile}`, () => {

	const p1: Point = { x: 1, y: 1 };
	const p2: Point = { x: 2, y: 2 };
	const p3: Point = { x: 3, y: 3 };

	describe('semigroupPoint customize:', () => {

		const semigroupPoint: Semigroup<Point> = {
			concat: (p1, p2) => ({
				x: semigroupSum.concat(p1.x, p2.x),
				y: semigroupSum.concat(p1.y, p2.y),
			})
		};

		test('concat point', () => {
			expect(
				semigroupPoint.concat(p1, p2)
			).toEqual(p3);
		});
	});

	describe('semigroupPoint by getStructSemigroup', () => {
		const semigroupPoint = getStructSemigroup({
			x: semigroupSum,
			y: semigroupSum,
		});

		test('concat point', () => {
			expect(
				semigroupPoint.concat(p1, p2)
			).toEqual(p3);
		});
	});

	describe('getMeetSemigroup', () => {
		test('semigroupMin', () => {
			const semigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber);
			expect(
				semigroupMin.concat(1, 2)
			).toEqual(1);
		});
	});

	describe('getJoinSemigroup', () => {
		test('semigroupMax', () => {
			const semigroupMax = getJoinSemigroup(ordNumber);
			expect(
				semigroupMax.concat(1, 2)
			).toEqual(2);
		});
	});

	describe('getFunctionSemigroup, semigroupAll', () => {
		const semigroupPredicate: Semigroup<(p: Point) => boolean>
			= getFunctionSemigroup(semigroupAll)<Point>();

		const isPositiveX = (p: Point) => p.x >= 0;
		const isPositiveY = (p: Point) => p.y >= 0;

		const isPositivePoint = semigroupPredicate.concat(isPositiveX, isPositiveY);

		test('isPositivePoint', () => {
			expect(isPositivePoint({ x: 1, y: 1 })).toBeTruthy();
			expect(isPositivePoint({ x: -1, y: 1 })).toBeFalsy();
			expect(isPositivePoint({ x: 1, y: -1 })).toBeFalsy();
			expect(isPositivePoint({ x: -1, y: -1 })).toBeFalsy();
		});
	});

	describe('fold', () => {
		test('semigroupSum', () => {
			const sum = fold(semigroupSum);
			const result = sum(0, [1, 2, 3, 4]);
			expect(result).toBe(10);
		});

		test('semigroupProduct', () => {
			const product = fold(semigroupProduct);
			const result = product(1, [1, 2, 3, 4]);
			expect(result).toBe(24);
		});
	});

	describe('getApplySemigroup', () => {
		const S = getApplySemigroup(semigroupSum);

		test('none', () => {
			expect(
				S.concat(some(1), none)
			).toEqual(none);
		});

		test('some', () => {
			expect(
				S.concat(some(1), some(2))
			).toEqual(some(3));
		})
	});

	describe('semigroup Customer', () => {
		interface Customer {
			name: string;
			favouriteThings: Array<string>;
			registeredAt: number;
			lastUpdatedAt: number;
			hasMadePurchase: boolean;
		}

		test('concat Customer', () => {
			const semigroupCustomer: Semigroup<Customer> = getStructSemigroup({
				name: getJoinSemigroup(contramap((s: string) => s.length)(ordNumber)),
				favouriteThings: getMonoid<string>(),
				registeredAt: getMeetSemigroup(ordNumber),
				lastUpdatedAt: getJoinSemigroup(ordNumber),
				hasMadePurchase: semigroupAny,
			});

			const c1: Customer = {
				name: 'Giulio',
				favouriteThings: ['math', 'climbing'],
				registeredAt: new Date(2018, 1, 20).getTime(),
				lastUpdatedAt: new Date(2018, 2, 18).getTime(),
				hasMadePurchase: false,
			};
			const c2: Customer = {
				name: 'Giulio Canti',
				favouriteThings: ['functional programming'],
				registeredAt: new Date(2018, 1, 22).getTime(),
				lastUpdatedAt: new Date(2018, 2, 9).getTime(),
				hasMadePurchase: true,
			};
			const c3: Customer = {
				name: 'Giulio Canti',
				favouriteThings: ['math', 'climbing', 'functional programming'],
				registeredAt: new Date(2018, 1, 20).getTime(),
				lastUpdatedAt: new Date(2018, 2, 18).getTime(),
				hasMadePurchase: true,
			};

			expect(
				semigroupCustomer.concat(c1, c2)
			).toEqual(c3);
		});
	});
});
