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