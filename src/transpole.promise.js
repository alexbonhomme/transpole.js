/**
 * Basic implementation of Promise.
 * @see http://stackoverflow.com/questions/23772801/basic-javascript-promise-implementation-attempt/23785244#23785244
 * @see https://www.promisejs.org/implementing/
 */
function initTranspolePromise(context) {
    'use strict';

    var Transpole = context.Transpole,

        PENDING = 0,
        FULFILLED = 1,
        REJECTED = 2;

    /**
     * Check if a value is a Promise and, if it is,
     * return the `then` method of that promise.
     *
     * @param {Promise|Any} value
     * @return {Function|Null}
     */
    function getThen(value) {
        var t = typeof value;

        if (value && (t === 'object' || t === 'function')) {
            var then = value.then;

            if (typeof then === 'function') {
                return then;
            }
        }

        return null;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     *
     * @param {Function} fn A resolver function that may not be trusted
     * @param {Function} onFulfilled
     * @param {Function} onRejected
     */
    function doResolve(fn, onFulfilled, onRejected) {
        var done = false;

        try {
            fn(function (value) {
                if (done) {
                    return;
                }

                done = true;
                onFulfilled(value);
            }, function (reason) {
                if (done) {
                    return;
                }

                done = true;
                onRejected(reason);
            });
        } catch (e) {
            if (done) {
                return;
            }

            done = true;
            onRejected(e);
        }
    }

    /**
     * @constructor
     * @param {Function} fn [description]
     */
    function Promise(fn) {
        if (typeof this !== 'object') {
            throw new TypeError('Promises must be constructed via new');
        }

        if (typeof fn !== 'function') {
            throw new TypeError('fn must be a function');
        }

        var state = PENDING, // store state which can be PENDING, FULFILLED or REJECTED

            value = null, // store value once FULFILLED or REJECTED

            handlers = []; // store sucess & failure handlers

        function fulfill(result) {
            state = FULFILLED;
            value = result;

            handlers.forEach(handle);
            handlers = [];
        }

        function reject(error) {
            state = REJECTED;
            value = error;

            handlers.forEach(handle);
            handlers = [];
        }

        function resolve(result) {
            try {
                var then = getThen(result);

                if (then) {
                    doResolve(then.bind(result), resolve, reject);

                    return;
                }

                fulfill(result);
            } catch (e) {
                reject(e);
            }
        }

        function handle(handler) {
            if (state === PENDING) {
                handlers.push(handler);
            } else {
                if (state === FULFILLED && typeof handler.onFulfilled === 'function') {
                    handler.onFulfilled(value);
                }

                if (state === REJECTED && typeof handler.onRejected === 'function') {
                    handler.onRejected(value);
                }
            }
        }

        /**
         *
         * @param  {Function}   onFulfilled [description]
         * @param  {Function}   onRejected  [description]
         */
        this.done = function (onFulfilled, onRejected) {
            // ensure we are always asynchronous
            setTimeout(function () {
                handle({
                    onFulfilled: onFulfilled,
                    onRejected: onRejected
                });
            }, 0);
        };

        /**
         *
         * @param  {Function} onFulfilled [description]
         * @param  {Function} onRejected  [description]
         * @return {Promise}              [description]
         */
        this.then = function (onFulfilled, onRejected) {
            var self = this;

            return new Promise(function (resolve, reject) {
                return self.done(function (result) {
                    if (typeof onFulfilled === 'function') {
                        try {
                            return resolve(onFulfilled(result));
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        return resolve(result);
                    }
                }, function (error) {
                    if (typeof onRejected === 'function') {
                        try {
                            return resolve(onRejected(error));
                        } catch (e) {
                            return reject(e);
                        }
                    } else {
                        return reject(error);
                    }
                });
            });
        };


        doResolve(fn, resolve, reject);
    }

    Transpole.Promise = Promise;
}