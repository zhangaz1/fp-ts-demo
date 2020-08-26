import createDebug from 'debug';
import {
	Option,
	some,
	none,
	fromNullable,
} from 'fp-ts/lib/Option';

const currentFile = __filename.replace(process.env.PWD, '');
const debug = createDebug(`test:${currentFile}`);

describe(`${currentFile}`, () => {
	let arr;

	beforeEach(() => {
		arr = ['a', 'b', 'cd'];
	})

	test('Option', () => {
		function findIndex<A>(as: Array<A>, predicate: (a: A) => boolean): Option<number> {
			const index = as.findIndex(predicate);
			return index === -1 ? none : some(index);
		};

		const result = findIndex(arr, s => s === 'b');
		debug('result', result);
	});

	test('Option: fromNullable', () => {
		function find<A>(as: Array<A>, predicate: (a: A) => boolean): Option<A> {
			return fromNullable(as.find(predicate));
		}

		const result = find(arr, s => s === 'b');
		debug('result:', result);
	});

});
