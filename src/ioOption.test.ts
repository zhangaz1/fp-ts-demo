import createDebug from 'debug';
import { IO } from 'fp-ts/lib/IO';
import { Option, fromNullable } from 'fp-ts/lib/Option';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('ioOption', () => {
		function getItem(key: string): IO<Option<string>> {
			return () => fromNullable(localStorage.getItem(key));
		}

		localStorage.setItem('a', 'aa');

		const result = getItem('a')();
		debug('result:', result);


		debug('localstorage[a]:', localStorage.getItem('a'));
	});
});
