var Util = require('../src/util.js'),
    slots = require('../src/slot-set.js'),
    Conf = require('./helpers/slot-options.helper.js'),
    Help = require('./helpers/construction.helper.js'),
    $ = require('jquery');

describe('Util', function () {
    it('provides a noop', function () {
        expect(typeof Util.noop).toEqual('function');
        expect(function () {
            Util.noop();
        }).not.toThrow();
    });

    describe('scrubConf', function () {
        var conf;
        beforeEach(function () {
            conf = Conf({
                name: 'testname',
                id: 'testid',
                group: 'testgrp'
            });
            slots.add(conf);
        });

        it('throws when missing DOM element', function () {
            expect(function () {
                Util.scrubConf(conf);
            }).toThrow();
        });
        it('does nothing when no duplicate', function () {
            Help.createDiv(conf);
            var out = Util.scrubConf(conf);
            expect(out).toEqual(conf);
        });

        describe('with empty duplicate', function () {
            it('throws when missing DOM element', function () {
                expect(function () {
                    slots.add(conf);
                    Util.scrubConf(conf);
                }).toThrow();
            });
            it('alters id and name of conf', function () {
                Help.createDiv(conf);
                slots.add(conf);
                Help.createDiv(conf);
                var out = Util.scrubConf(conf);
                expect(out.name).toEqual('testname-h1');
                expect(out.id).toEqual('testid-h1');
            });
            it('increments id per duplicate', function () {
                var i,
                    out = [],
                    confs = [];

                slots.clear();
                for (i = 0; i < 4; i += 1) {
                    confs[i] = Conf({
                        name: 'testname',
                        id: 'testid',
                        group: 'testgrp'
                    });
                    Help.createDiv(confs[i]);
                }
                for (i = 0; i < 4; i += 1) {
                    out[i] = Util.scrubConf(confs[i]);
                    slots.add(out[i]);
                }
                expect(out[0].name).toEqual('testname');
                expect(out[1].name).toEqual('testname-h1');
                expect(out[2].name).toEqual('testname-h2');
                expect(out[3].name).toEqual('testname-h3');
            });
        });

        describe('with filled duplicate', function () {
            it('throws when missing DOM element', function () {
                expect(function () {
                    Help.createDiv(conf, 'testcontent');
                    slots.add(conf);
                    Util.scrubConf(conf);
                }).toThrow();
            });
            it('alters id and name of conf', function () {
                var first = Conf({
                        name: 'testname',
                        id: 'testid',
                        group: 'testgrp'
                    }),
                    second = Conf({
                        name: 'testname',
                        id: 'testid',
                        group: 'testgrp'
                    });
                slots.add(first);
                Help.createDiv(first, 'testcontent');
                slots.add(second);
                Help.createDiv(second);
                Util.scrubConf(second);

                expect(first.name).toEqual('testname');
                expect(first.id).toEqual('testid');
                expect(second.name).toEqual('testname-h1');
                expect(second.id).toEqual('testid-h1');
            });
            it('does not alter the original slot', function () {
                Help.createDiv(conf, 'testcontent');
                slots.add(conf);
                Help.createDiv(conf);
                Util.scrubConf(conf);
                var original = $('#testid').text();
                expect(original).toEqual('testcontent');
            });
            it('increments id per duplicate', function () {
                var i,
                    out = [],
                    confs = [];

                slots.clear();
                for (i = 0; i < 4; i += 1) {
                    confs[i] = Conf({
                        name: 'testname',
                        id: 'testid',
                        group: 'testgrp'
                    });
                    Help.createDiv(confs[i]);
                    out[i] = Util.scrubConf(confs[i]);
                    slots.add(out[i]);
                    $('#' + out[i].id).text('testcontent');
                }

                expect(out[0].name).toEqual('testname');
                expect(out[1].name).toEqual('testname-h1');
                expect(out[2].name).toEqual('testname-h2');
                expect(out[3].name).toEqual('testname-h3');
            });
        });
    });
});
