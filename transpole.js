/*jslint browser:true*/
var transpole = (function () {
    'use strict';

    var API_SUBSIDIARY_ID = '9d16ee6b-15a1-4963-bdeb-54d15dc27365',

        options = {
            apiProxyBase: 'http://localhost:8000/'
        };

    /**
     * Set customs options into options object.
     * @param  {Object} customOptions [description]
     */
    function handleOptions(customOptions) {
        var key;

        for (key in customOptions) {
            if (customOptions.hasOwnProperty(key) && options.hasOwnProperty(key)) {
                options[key] = customOptions[key];
            }
        }
    }

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
     * @param  {String}   url     [description]
     * @param  {Object}   params  [description]
     * @param  {Function} resolve [description]
     * @param  {Function} reject  [description]
     */
    function request(url, params, resolve, reject) {
        var requestObj = new XMLHttpRequest(),
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
                    reject(new Error(event));
                } else {
                    resolve(target.response);
                }
            } else {
                reject(new Error(event));
            }
        });

        requestObj.addEventListener('error', function (event) {
            reject(new Error(event));
        });

        requestObj.send();
    }

    /**
     *
     * @param  {String} endPoint [description]
     * @param  {Object} params   [description]
     * @return {Object}          [description]
     */
    function transpoleRequest(endPoint, params) {
        var url = options.apiProxyBase + '/' + endPoint + '/' + API_SUBSIDIARY_ID;

        return {
            // pseudo promise
            then: function (resolve, reject) {
                request(url, params, resolve, reject);
            }
        };
    }

    function lineId(lineName) {
        return 'transpole:Line:' + lineName;
    }

    function stopId(stopName) {
        return 'transpole:StopArea:' + stopName;
    }

    /**
     * Publics
     */

    function getNext(lineName, stopName, direction) {
        var params = {
            lineId: lineId(lineName),
            stopId: stopId(stopName),
            wayId: direction
        };

        return transpoleRequest('nextSchedule', params);
    }

    return function (options) {
        handleOptions(options);

        return {
            getNext: getNext
        };
    };
}());