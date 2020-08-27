import { createInterface } from 'readline';
import createDebug from 'debug';
import { Task } from 'fp-ts/lib/Task';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('readline', (done) => {
		const read: Task<string> = () => {
			return new Promise<string>(resolve => {
				const rl = createInterface({
					input: process.stdin,
					output: process.stdout,
				});
				rl.question('give me your answer:', answer => {
					rl.close;
					resolve(answer);
				});
			});
		};

		read().then(answer => {
			debug('answer:', answer);
			done();
		});
	});
});
