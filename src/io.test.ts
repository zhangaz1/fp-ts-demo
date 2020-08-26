import createDebug from 'debug';
import { IO } from 'fp-ts/lib/IO';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('Random', () => {
		const random: IO<number> = () => Math.random();

		const result = random();
		debug('result:', result);
	});
});
