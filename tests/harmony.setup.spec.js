var Harmony = require('../src/harmony.js'),
    Help = require('./helpers/construction.helper.js'),
    Options = require('./helpers/slot-options.helper.js'),
    $ = require('jquery');

describe('harmony setup', function () {
    var harmony, conf;
    beforeEach(function () {
        conf = Help.setupDOM();
        harmony = Harmony({
            forceLog: true
        });
    });
    describe('harmony.load()', function () {
        it('creates ad slots', function () {
            harmony.load(conf);
            expect(harmony.slot('TST00').divId).toEqual('DVID00');
            expect(harmony.slot('TST01').breakpoint).toEqual('TSTPNT01');
            expect(harmony.slot('TST02').name).toEqual('TST02');
        });
        it('does not require conf', function () {
            expect(function () {
                harmony.load();
            }).not.toThrow();
        });
        it('supports empty conf', function () {
            expect(function () {
                harmony.load({});
            }).not.toThrow();
        });
        it('handles duplicate slot names', function () {
            conf.slots[2].id = 'DVID00';
            conf.slots[2].name = 'TST00';
            harmony.load(conf);
            expect(harmony.slot('TST00').name).toEqual('TST00');
            expect(harmony.slot('TST00').divId).toEqual('DVID00');
            expect(harmony.slot('TST00-h1').divId).toEqual('DVID00-h1');
            expect(harmony.slot('TST00-h1').div.id).toEqual('DVID00-h1');
            expect(harmony.slot('TST00-h1').name).toEqual('TST00-h1');
        });
        it('adjusts element ids for duplicates', function () {
            conf.slots[2].id = 'DVID00';
            conf.slots[2].name = 'TST00';
            harmony.load(conf);
            var slot = harmony.slot('TST00-h1'),
                el = document.getElementById(slot.divId);
            expect(el.id).toEqual('DVID00-h1');
            expect(slot.div.id).toEqual('DVID00-h1');
            // Smoke test error logs.
            expect(harmony.log.readback('error').length).toEqual(0);
        });
        it('sets system targeting', function () {
            conf.targeting.TST = 'target';
            conf.targeting.TST2 = 'abc123';
            harmony.load(conf);
            expect(googletag.pubads().setTargeting).toHaveBeenCalledWith('TST', 'target');
            expect(googletag.pubads().setTargeting).toHaveBeenCalledWith('TST2', 'abc123');
        });
        it('logs missing dom elements', function () {
            conf.slots[1].name = 'BAD01';
            conf.slots[1].id = 'BAD01';
            harmony.load(conf);
            expect(harmony.log.readback('error').length).toEqual(1);
        });
    });
    describe('harmony.defineSlot()', function () {
        var newOptions = function () {
                return Options({
                    name: 'TST22',
                    breakpoint: 'BKP22',
                    id: 'DVID22'
                });
            },
            newSlot = function () {
                Help.createDiv({
                    id: 'DVID22',
                    breakpoint: 'BKP22'
                });
                return newOptions();
            };
        it('creates an ad slot', function () {
            var opts = newSlot();
            harmony.defineSlot(opts);
            expect(harmony.slot('TST22')).toBeDefined();
            expect(harmony.breakpoint('BKP22')[0].divId).toEqual('DVID22');
        });
        it('handles duplicate slot names for sync pages', function () {
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            expect(harmony.slot('TST22').divId).toEqual('DVID22');
            expect(harmony.slot('TST22-1').divId).toEqual('DVID22-1');
            expect(harmony.slot('TST22-2').divId).toEqual('DVID22-2');
            expect(harmony.slot('TST22-3').divId).toEqual('DVID22-3');
        });
        it('handles duplicate slot names for async pages', function () {
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            // Simulate completed ad calls.
            $('.BKP22').text('test ad content');
            // Load in a new async ad slot.
            harmony.defineSlot(newSlot());
            // Simulate completed ad calls.
            $('.BKP22').text('test ad content');
            // Load in some new async ad slots.
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            expect(harmony.slot('TST22-1').divId).toEqual('DVID22-1');
            expect(harmony.slot('TST22-2').divId).toEqual('DVID22-2');
            expect(harmony.slot('TST22-3').divId).toEqual('DVID22-3');
            expect(harmony.slot('TST22-4').divId).toEqual('DVID22-4');
            expect(harmony.slot('TST22-5').divId).toEqual('DVID22-5');
            // Smoke test the leftover artifact.
            expect(harmony.slot('TST22').divId).toBeDefined('smoke test TST22');
        });
        it('returns the original slot conf on dom error', function () {
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            harmony.defineSlot(newSlot());
            $('.BKP22').text('test ad content');
            harmony.defineSlot(newOptions());
            harmony.defineSlot(newOptions());
            harmony.defineSlot(newOptions());
            // Expect error messages for failed DOM queries.
            expect(harmony.log.readback('error').length).toEqual(3);
            expect(harmony.slot('TST22').divId).toBeDefined('group A, TST22');
            expect(harmony.slot('TST22-1').divId).toEqual('DVID22-1', 'group A, TST22-1');
            expect(harmony.slot('TST22-2').divId).toEqual('DVID22-2', 'group A, TST22-2');
            expect(harmony.slot('TST22-3').divId).toEqual('DVID22-3', 'group A, TST22-3');
            expect(harmony.slot('TST22-4').divId).not.toBeDefined('group A, TST22-4');
            harmony.defineSlot(newSlot());
            expect(harmony.slot('TST22').divId).toBeDefined('group B, TST22');
            expect(harmony.slot('TST22-1').divId).toEqual('DVID22-1', 'group B, TST22-1');
            expect(harmony.slot('TST22-2').divId).toEqual('DVID22-2', 'group B, TST22-2');
            expect(harmony.slot('TST22-3').divId).toEqual('DVID22-3', 'group B, TST22-3');
            expect(harmony.slot('TST22-4').divId).toEqual('DVID22-4', 'group B, TST22-4');
            expect(harmony.slot('TST22-5').divId).not.toBeDefined('group B, TST22-5');
            expect(harmony.slot('TST22-6').divId).not.toBeDefined('group B, TST22-6');
            harmony.defineSlot(newSlot());
            expect(harmony.slot('TST22').divId).toBeDefined('group C, TST22');
            expect(harmony.slot('TST22-1').divId).toEqual('DVID22-1', 'group C, TST22-1');
            expect(harmony.slot('TST22-2').divId).toEqual('DVID22-2', 'group C, TST22-2');
            expect(harmony.slot('TST22-3').divId).toEqual('DVID22-3', 'group C, TST22-3');
            expect(harmony.slot('TST22-4').divId).toEqual('DVID22-4', 'group C, TST22-4');
            expect(harmony.slot('TST22-5').divId).toEqual('DVID22-5', 'group C, TST22-5');
            expect(harmony.slot('TST22-6').divId).not.toBeDefined('group C, TST22-6');
        });
        it('logs missing dom elements', function () {
            var opts = newSlot();
            opts.id = 'NOTHERE';
            harmony.defineSlot(opts);
            expect(harmony.slot('TST22')).not.toBeDefined();
            expect(harmony.log.readback('error').length).toEqual(1);
            expect(harmony.log.readback('error')[0].data.name).toEqual('TST22');
            expect(harmony.log.readback('error')[0].data.conf.id).toEqual('NOTHERE');
        });
    });
});
