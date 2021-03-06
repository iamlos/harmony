var watcher = require('../src/breakpoint-watcher.js'),
    screen = require('../src/screen.js');

describe('Breakpoint Watcher', function () {
    afterEach(function () {
        watcher.clear();
    });
    describe('can add()', function () {
        it('a single breakpoint', function () {
            watcher.add(1234);
            expect(watcher.getAll()).toEqual([1234]);
        });
        it('multiple breakpoints', function () {
            watcher.add([12, 34, 56]);
            expect(watcher.getAll()).toEqual([56, 34, 12]);
        });
        it('zero breakpoints', function () {
            watcher.add(1);
            watcher.add();
            watcher.add(2);
            expect(watcher.getAll()).toEqual([2, 1]);
        });
    });
    describe('current()', function () {
        it('works when size > bp', function () {
            var width = screen.width();
            watcher.add(width - 1);
            expect(watcher.current()).toEqual(width - 1);
        });
        it('works when size < bp', function () {
            var width = screen.width();
            watcher.add([width + 1, width + 2]);
            expect(watcher.current()).toEqual(width + 1);
        });
        it('works with multiple breakpoints', function () {
            var width = screen.width();
            watcher.add([width - 1, width + 1]);
            expect(watcher.current()).toEqual(width - 1);
        });
    });
    describe('run()', function () {
        var originalWidth = global.innerWidth;
        beforeEach(function () {
            watcher.add([1, 100, 200, 300, 500]);
        });
        afterEach(function () {
            global.innerWidth = originalWidth;
            watcher.off('update');
            watcher.clear();
        });
        it('triggers on first run', function (done) {
            watcher.on('update', function (bp) {
                expect(bp).toEqual(200);
                done();
            }, true);
            global.innerWidth = 200;
            watcher.run();
        });
        it('triggers on bp update', function (done) {
            global.innerWidth = 90;
            watcher.one('update', function (bp) {
                expect(bp).toEqual(1);
                global.innerWidth = 802;
                watcher.on('update', function (bp) {
                    expect(bp).toEqual(500);
                    done();
                }, true);
                watcher.run();
            }, true);
            watcher.run();
        });
    });
});
