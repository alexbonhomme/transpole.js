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
