import createDebug from 'debug';
import * as fp from 'fp-ts';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	let stdout = {
		debug,
	};

	beforeEach(() => {
		stdout = { debug };
	});

	const monoidVoid: fp.monoid.Monoid<void> = {
		concat: () => undefined,
		empty: undefined,
	};

	const replicateIO = (n: number, mv: fp.io.IO<void>): fp.io.IO<void> =>
		fp.monoid.fold(fp.io.getMonoid(monoidVoid))(fp.array.replicate(n, mv));

	const fib = (n: number): number =>
		n <= 1 ? 1 : fib(n - 1) + fib(n - 2);

	test('fib', () => {
		expect([
			fib(1), fib(2), fib(3), fib(4), fib(5)
		]).toEqual([1, 2, 3, 5, 8]);
	});

	const log = (message: unknown): fp.io.IO<void> =>
		() => stdout.debug(message);

	test('log', () => {
		// debug('log result:', log('a message')());
	});

	const printFib: fp.io.IO<void> = fp.function.pipe(
		fp.random.randomInt(3, 5),
		fp.io.chain(n => log(fib(n)))
	);

	test('replicatedIO', () => {
		const n = 3;
		const spyDebug = jest.spyOn(stdout, 'debug');
		replicateIO(n, printFib)();

		expect(spyDebug).toHaveBeenCalled();
		expect(spyDebug).toHaveBeenCalledTimes(n);
	});

	test('printFib', () => {
		// debug('printFib:', printFib());
	});
});
