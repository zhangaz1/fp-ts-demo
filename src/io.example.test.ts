import createDebug from 'debug';
import * as fp from 'fp-ts';

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

	test('withLogging', () => {
		const spyLog = jest.spyOn(console, 'log');

		const program = fp.io.chain(withLogging)(() => () => fib(35));
		expect(program).toBeInstanceOf(Function);

		program();

		expect(spyLog).toHaveBeenCalled();
		expect(spyLog.mock.calls[0][0]).toMatch(/^Result: 14930352, Elapsed: \d+$/);
		expect(spyLog.mock.results[0].value).toBeInstanceOf(Function);
	})
});
