import fs from 'fs';
import createDebug from 'debug';
import {
	isRight,
	isLeft,
	toError,
} from 'fp-ts/lib/Either';
import {
	IOEither,
	tryCatch,
} from 'fp-ts/lib/IOEither';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	describe('IOEither', () => {
		function readFileSync(path: string): IOEither<Error, string> {
			return tryCatch(
				() => fs.readFileSync(path, 'utf8'),
				reason => new Error(String(reason))
			);
		}

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
});

