import fetch from 'node-fetch';
import createDebug from 'debug';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	test('task either', (done) => {
		function get(url: string): TaskEither<Error, string> {
			return tryCatch(
				() => fetch(url).then(response => response.text()),
				reason => new Error(String(reason))
			);
		}

		Promise.all([
			get('http://www.sdfasdfasd')()
				.then(html => {
					debug('html:', html);
				}),

			get('http://news.cnblogs.com/1')()
				.then(html => {
					debug('html:', html);

				})
		]).finally(() => done());
	});
});
