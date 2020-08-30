import createDebug from 'debug';
import {
	IO,
	io,
	map,
	chain,
	getMonoid,
} from 'fp-ts/lib/IO';
import {
	Option,
	fromNullable,
	none,
	some,
} from 'fp-ts/lib/Option';
import { log } from 'fp-ts/lib/Console';
import { fold, Monoid, monoidSum } from 'fp-ts/lib/Monoid';
import { randomInt } from 'fp-ts/lib/Random';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	describe('localstorage', () => {
		const getItem = (key: string): IO<Option<string>> =>
			() => fromNullable(localStorage.getItem(key));

		const setItem = (key: string, value: string): IO<void> =>
			() => localStorage.setItem(key, value);

		test('get item', () => {
			expect(
				getItem('xx')()
			).toEqual(none);
		});

		test('set item', () => {
			expect(
				setItem('xxx', '3x')()
			).toBeUndefined();

			expect(
				getItem('xxx')()
			).toEqual(some('3x'));
		});
	});


	test('get current time', () => {
		const now: IO<number> = () => new Date().getTime();

		expect(
			now()
		).toBeLessThanOrEqual(now());
	});


	describe('random map chain', () => {
		const log = (s: unknown): IO<void> => () => console.log(s);
		const random: IO<number> = () => Math.random();
		const numberToBoolean = n => n > -1;
		const numberToBooleanIO = n => () => n > -1;

		test('log', () => {
			expect(
				log('abc')()
			).toBeUndefined();
		});

		test('Random', () => {
			expect(
				random() === random()
			).toBeFalsy();
		});

		test('io.map', () => {
			const randomBoolean: IO<boolean> = io.map(random, numberToBoolean);
			testRandomToBoolean(randomBoolean);
		});

		test('map', () => {
			const randomBoolean: IO<boolean> = map(numberToBoolean)(random);
			testRandomToBoolean(randomBoolean);
		});

		test('io.chain', () => {
			const randomBoolean: IO<boolean> = io.chain(random, numberToBooleanIO);
			testRandomToBoolean(randomBoolean);
		});

		test('chain', () => {
			const randomBoolean: IO<boolean> = chain(numberToBooleanIO)(random);
			testRandomToBoolean(randomBoolean);
		});
	});

	describe('roll die', () => {
		type Die = IO<number>;
		const monoidDie: Monoid<Die> = getMonoid(monoidSum);

		const roll: (dice: Array<Die>) => IO<number> = fold(monoidDie);

		const D4: Die = randomInt(1, 4);
		const D10: Die = randomInt(1, 10);
		const D20: Die = randomInt(1, 20);

		const dice = [D4, D10, D20];

		const withLogging = <A>(action: IO<A>): IO<A> =>
			io.chain(action, a => (io.map(log(`Value: ${a}`), () => a)));

		test('io.chain(roll)', () => {
			io.chain(roll(dice.map(withLogging)), result => log(`Result is: ${result}`))();
		});

	});
});

function testRandomToBoolean(rtb) {
	expect(rtb())
		.toBeTruthy();
}
