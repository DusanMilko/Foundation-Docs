require.config({
    waitSeconds: 30,

    shim: {
        /*'plugin': {
            deps: ['jquery']
        }*/
    },

    paths: {
        'jquery': 'jquery'
    }
});

require(['global'], function(global) {

});
