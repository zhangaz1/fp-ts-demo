import fs from 'fs';
import createDebug from 'debug';
import { IOEither, tryCatch, flatten, chain } from 'fp-ts/lib/IOEither';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('IOEither', () => {
		function readFileSync(path: string): IOEither<Error, string> {
			return tryCatch(
				() => fs.readFileSync(path, 'utf8'),
				reason => new Error(String(reason))
			);
		}

		const result = readFileSync('./package.json');
		debug('file:', result());

		const result2 = readFileSync('./xx.abc');
		debug('result2:', result2());
	});
});
