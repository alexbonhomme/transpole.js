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
     *
     * @param  {String}   path    [description]
     * @param  {Object}   params  [description]
     * @param  {Function} success [description]
     * @param  {Function} error   [description]
     */
    function request(path, params, success, error) {
        var requestObj,
            url,
            query;

        // build url
        url = options.apiProxyBase + path + '/' + API_SUBSIDIARY_ID;

        // build query params
        query = formatParams(params);

        // perform request
        requestObj = new XMLHttpRequest();
        requestObj.addEventListener('load', function (event) {
            var target = event.target;

            if (target.status === 200) {
                if (target.response.message) {
                    error(target.response);
                } else {
                    success(target.response);
                }
            } else {
                // what to do ??
                error(event);
            }
        });

        requestObj.open('GET', url + '?' + query);
        requestObj.responseType = 'json';

        requestObj.send();
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

        return {
            then: function (success, error) {
                request('/nextSchedule', params, success, error);
            }
        };
    }

    return function (options) {
        handleOptions(options);

        return {
            getNext: getNext
        };
    };
}());