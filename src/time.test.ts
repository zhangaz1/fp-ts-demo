import * as fp from 'fp-ts';

const currentFile = __filename.replace(process.env.PWD, '');

describe(`${currentFile}`, () => {
	function time<M extends fp.hkt.URIS>(M: fp.monadIO.MonadIO<M>)
		: <A>(ma: fp.hkt.HKT<M, A>) => fp.hkt.HKT<M, [A, number]> {
		const now = M.fromIO(fp.date.now);
		return ma => M.chain(
			now,
			start => M.chain(
				ma,
				a => M.map(
					now,
					end => [a, end - start]
				)
			)
		);
	}

	const monadIOIO: fp.monadIO.MonadIO<fp.io.URI> = {
		...fp.io.io,
		fromIO: fp.io.fromIO,
	};

	const monadIOTask: fp.monadIO.MonadIO<fp.task.URI> = {
		...fp.task.task,
		fromIO: fp.task.fromIO,
	}

	test('timeIO', () => {
		const timeIO = time(monadIOIO);
		const fiveIO: fp.io.IO<number> = () => 5;
		const result = timeIO(fiveIO)();
		expect(result).toEqual([5, 0]);
	});

	test('timeTask', (done) => {
		const timeTask = time(monadIOTask);
		const fiveTask: fp.task.Task<number> = () => Promise.resolve(5);
		timeTask(fiveTask)()
			.then(result => {
				expect(result).toEqual([5, 0]);
				done();
			});
	})
});
