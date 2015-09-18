require.config({
    waitSeconds: 30,

    shim: {
        /*'plugin': {
            deps: ['jquery']
        }*/
    },

    paths: {
        'jquery': 'libs/jquery'
    }
});

require(['global'], function(global) {

});
