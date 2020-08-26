import createDebug from 'debug';
import * as fp from 'fp-ts';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('0', () => {

	});
});
