import createDebug from 'debug';
import * as fp from 'fp-ts';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('log fp-ts', () => {
		debug('%s', fp);
		debug('%s', process.env.DEBUG);
		debug('%s', process.env.PWD);
		debug('alt: %s', fp.alt);
	});
});
