import fs from 'fs';
import createDebug from 'debug';
import { randomInt } from 'fp-ts/lib/Random';
import {
	isRight,
	isLeft,
	toError,
} from 'fp-ts/lib/Either';
import {
	IOEither,
	tryCatch,
	ioEither,
	rightIO,
	map,
} from 'fp-ts/lib/IOEither';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	function readFileSync(path: string): IOEither<Error, string> {
		return tryCatch(
			() => fs.readFileSync(path, 'utf8'),
			toError
		);
	}

	describe('IOEither', () => {

		test('right', () => {
			expect(
				isRight(
					readFileSync('./package.json')()
				)
			).toBeTruthy();
		});

		test('left', () => {
			expect(
				isLeft(
					readFileSync('./xx.abc')()
				)
			).toBeTruthy();
		});
	});

	describe('random file', () => {
		const files = [
			`${__dirname}/io.test.ts`,
			`${__dirname}/either.test.ts`,
			`${__dirname}/ioEither.test.ts`,
		];

		const randomReadFile = ioEither.chain(
			map((n: number) => files[n])
				(rightIO(randomInt(0, 2))),
			readFileSync
		);

		test('random read file', () => {
			expect(
				isRight(randomReadFile())
			).toBeTruthy();
		});
	});
});

