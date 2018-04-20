"use strict";

window.Vue = require('vue');

document.addEventListener('DOMContentLoaded', function(e) {
    console.log(e);
    new Vue({
        el: '#component',
        components: {
            'component': require('./components/component.vue')
        }
    });
});
