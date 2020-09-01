import createDebug from 'debug';
import * as fp from 'fp-ts';
import { randomInt } from 'fp-ts/lib/Random';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	let console = {
		log: fp.console.log,
	};

	beforeEach(() => {
		console = {
			log: fp.console.log,
		}
	});

	function time<A>(ma: fp.io.IO<A>): fp.io.IO<A> {
		return fp.io.io.chain(
			fp.date.now,
			start => fp.io.io.chain(
				ma,
				a => fp.io.io.chain(
					fp.date.now,
					end => fp.io.io.map(
						fp.console.log(`Elapsed: ${end - start}`),
						() => a
					)
				)
			)
		)
	}

	test('time', () => {
		expect(
			time(() => 5)()
		).toBe(5);
	});

	const time2 = <A>(ma: fp.io.IO<A>): fp.io.IO<[A, number]> =>
		fp.io.io.chain(
			fp.date.now,
			start => fp.io.io.chain(
				ma,
				a => fp.io.io.chain(
					fp.date.now,
					end =>
						() => [a, end - start]
				)
			)
		);

	const withLogging = <A>(ma: fp.io.IO<A>): fp.io.IO<A> =>
		fp.io.io.chain(
			time2(ma),
			([a, millis]) => fp.io.io.map(
				console.log(`Result: ${a}, Elapsed: ${millis}`),
				() => a
			)
		);

	const fib = (n: number): number =>
		n <= 1
			? 1
			: fib(n - 1) + fib(n - 2);

	const randomFib = () => fp.io.map(fib)(fp.random.randomInt(30, 35));

	const program = fp.io.chain(withLogging)(randomFib);

	test('program', () => {
		expect(program).toBeInstanceOf(Function);
	});

	test('withLogging', () => {
		const spyLog = jest.spyOn(console, 'log');

		program();

		expect(spyLog).toHaveBeenCalled();
		expect(spyLog.mock.calls[0][0]).toMatch(/^Result: \d+, Elapsed: \d+$/);
		expect(spyLog.mock.results[0].value).toBeInstanceOf(Function);
	});

	function fastTest<A>(head: fp.io.IO<A>, tail: Array<fp.io.IO<A>>): fp.io.IO<A> {
		const ordTuple = fp.ord.contramap(([_, elapsed]: [A, number]) => elapsed)(fp.ord.ordNumber);
		const semigroupTuple = fp.semigroup.getMeetSemigroup(ordTuple);
		const semigroupIO = fp.io.getSemigroup(semigroupTuple);
		const fast = fp.semigroup.fold(semigroupIO)(time2(head), tail.map(time2));
		const ignoreSnd = <A>(ma: fp.io.IO<[A, unknown]>): fp.io.IO<A> =>
			fp.io.map(([a]) => a)(ma);
		return ignoreSnd(fast);
	}

	test('fastTest', () => {
		console.log(fastTest(program, [program, program])())();
	})
});
