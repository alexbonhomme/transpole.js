/*global XMLHttpRequest*/
var transpole = (function () {
    'use strict';

    var API_SUBSIDIARY_ID = '9d16ee6b-15a1-4963-bdeb-54d15dc27365',
        API_PROXY_BASE = 'http://localhost:8000/';

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
     * @param  {String} path    [description]
     * @param  {Object} params  [description]
     * @param  {Function} success [description]
     * @param  {Function} error   [description]
     */
    function request(path, params, success, error) {
        var requestObj,
            url,
            query;

        // build url
        url = API_PROXY_BASE + path + '/' + API_SUBSIDIARY_ID;

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

    return {
        getNext: function (lineName, stopName, direction) {
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
    };
}());