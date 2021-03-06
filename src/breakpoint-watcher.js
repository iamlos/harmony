var BaseClass = require('baseclassjs'),
    Eventable = require('./event-handler.js'),
    screen = require('./screen.js'),
    running = false,
    ready = true,
    breakpoints = [],
    last;

/**
 * # Breakpoint Watcher
 * @type {BaseClass}
 * @extends {EventHandler}
 */
module.exports = BaseClass({
    /**
     * ## watcher.current()
     * @return {Number} Current breakpoint.
     */
    current: function () {
        var i,
            len = breakpoints.length,
            width = screen.width(),
            point = breakpoints[len - 1];
        for (i = 0; i < len; i += 1) {
            if (width >= breakpoints[i]) {
                point = breakpoints[i];
                break;
            }
        }
        return point;
    },
    /**
     * ## watcher.add(set)
     * @param {Number|Array of Numbers} [set]
     */
    add: function (set) {
        breakpoints = breakpoints.concat(set || []);
        // Sort descending.
        breakpoints.sort(function (a, b) {
            return b - a;
        });
        module.exports.run();
    },
    /**
     * ## watcher.getAll()
     * @return {Array of Numbers}
     */
    getAll: function () {
        return breakpoints;
    },
    /**
     * ## watcher.clear()
     * Clears all breakpoints from the system.
     */
    clear: function () {
        breakpoints = [];
    },
    /**
     * ## watcher.run([throttle])
     * @param {Number} [throttle]
     */
    run: function (throttle) {
        function checkUpdate() {
            var current = module.exports.current();
            if (current !== last) {
                last = current;
                module.exports.trigger('update', current);
            }
        }

        // Do not run unless breakpoints are available.
        if (!running && breakpoints.length) {
            running = true;
            ready = true;
            global.addEventListener('resize', function () {
                if (ready) {
                    ready = false;
                    checkUpdate();

                    global.setTimeout(function () {
                        ready = true;
                    }, throttle || 250);
                }
            });
        }
        checkUpdate();
    }
}).extend(
    /**
     * ## watcher.on/one/off/trigger
     * @see <a href="event-handler.js">event-handler.js</a>
     */
    Eventable()
);
