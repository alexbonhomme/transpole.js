/*! transpole.js - v0.1.0 - 2015-12-27 - Alexandre Bonhomme */
;(function (global) {

/**
 * Init wrapper for the core module.
 * @param {Object} The Object that the library gets attached to in library.init.js. If the library was not loaded with an AMD loader such as require.js, this is the global Object.
 */
function initTranspoleCore(context) {
    'use strict';

    var API_SUBSIDIARY_ID = '9d16ee6b-15a1-4963-bdeb-54d15dc27365';

    /**
     * @constructor
     * @param  {Object} opt_config [description]
     * @return {Transpole}         [description]
     */
    function Transpole(opt_config) {
        // enforces new
        if (!(this instanceof Transpole)) {
            return new Transpole(opt_config);
        }

        opt_config = opt_config || {};

        if (!opt_config.apiProxyUrl) {
            throw new Error('You have to provide a proxy URL.');
        }

        this.apiProxyBase = opt_config.apiProxyUrl;

        return this;
    }

    context.Transpole = Transpole;

    /**
     * Privates
     */

    /**
     *
     * @param  {String} endPoint [description]
     * @param  {Object} params   [description]
     * @return {Promise}         [description]
     */
    function transpoleRequest(endPoint, params) {
        var url = this.apiProxyBase + '/' + endPoint + '/' + API_SUBSIDIARY_ID;

        return Transpole.requestJSON(url, params);
    }

    /**
     * @param  {String} lineName [description]
     * @return {String}          [description]
     */
    function lineId(lineName) {
        return 'transpole:Line:' + lineName;
    }

    /**
     * @param  {String} stopName [description]
     * @return {String}          [description]
     */
    function stopId(stopName) {
        return 'transpole:StopArea:' + stopName;
    }

    /**
     * Publics
     */

    /**
     * Return the three next schedules for the givent line name, stop name and direction.
     * @param  {String}   lineName  [description]
     * @param  {String}   stopName  [description]
     * @param  {String}   direction [description]
     * @return {Promise}            [description]
     */
    Transpole.prototype.next = function (lineName, stopName, direction) {
        var params = {
            lineId: lineId(lineName),
            stopId: stopId(stopName),
            wayId: direction
        };

        return transpoleRequest.call(this, 'nextSchedule', params);
    };
}
function initTranspoleAjax(context) {
    'use strict';

    var Transpole = context.Transpole;

    /**
     * Format params object to url query args string.
     * @param  {Object} params [description]
     * @return {String}        [description]
     */
    function formatParams(params) {
        var key,
            query = [];

        for (key in params) {
            if (params.hasOwnProperty(key)) {
                query.push(key + '=' + params[key]);
            }
        }

        return query.join('&');
    }


    /**
     * Basic XHR request implementation.
     * @param  {String}  url    [description]
     * @param  {Object}  params [description]
     * @return {Promise}        [description]
     */
    Transpole.requestJSON = function (url, params) {
        return new Transpole.Promise(function (resolve, reject) {
            var requestObj = new window.XMLHttpRequest(),
                urlWithParams = url;

            if (params) {
                urlWithParams += '?' + formatParams(params);
            }

            requestObj.open('GET', urlWithParams);
            requestObj.responseType = 'json';

            requestObj.addEventListener('load', function (event) {
                var target = event.target;

                if (target.status === 200) {
                    if (target.response.message) {
                        reject(new Error(target));
                    } else {
                        resolve(target.response);
                    }
                } else {
                    reject(new Error(target));
                }
            });

            requestObj.addEventListener('error', function (event) {
                reject(new Error(event));
            });

            requestObj.send();
        });
    };
}
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
/*global initTranspoleCore, initTranspoleAjax, initTranspolePromise*/
var initTranspole = function (context) {
    'use strict';

    initTranspoleCore(context);
    initTranspoleAjax(context);
    initTranspolePromise(context);

    return context.transpole;
};


if (typeof define === 'function' && define.amd) {
    // Expose transpole as an AMD module if it's loaded with RequireJS or
    // similar.
    define(function () {
        'use strict';

        return initTranspole({});
    });
} else {
    // Load transpole normally (creating a transpole global) if not using an AMD
    // loader.
    initTranspole(this);
}

} (this));
