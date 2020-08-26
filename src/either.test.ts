import createDebug from 'debug';
import * as fp from 'fp-ts';
import { Either, tryCatch } from 'fp-ts/lib/Either';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('exceptions', () => {
		function parse(s: string): Either<Error, unknown> {
			return tryCatch(() => JSON.parse(s), reason => new Error(String(reason)));
		}

		const result1 = parse('');
		debug('result1:', result1);

		const result2 = parse('{"name":"zs"}');
		debug('result2:', result2);
	});
});
