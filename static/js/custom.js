// turn on x-editable inline mode
$.fn.editable.defaults.mode = 'inline';


$(document).ready(function() {

    /**
     * x-editable - set up and actiate x-editable elements
     */
    $('#keeper-default-money').editable({
        name: 'keepermoney',
        type: 'number',
        pk: '/api/keeper/default/money',
        url: '/api/keeper/default/money', // url to process submitted data
        title: 'Enter starting money'
    });

    $('#keeper-default-xp').editable({
        name: 'keeperxp',
        type: 'number',
        pk: '/api/keeper/default/stats/xp',
        url: '/api/keeper/default/stats/xp',
        title: 'Enter starting XP'
    });

    $('#keeper-default-hp').editable({
        name: 'champhp',
        type: 'number',
        pk: '/api/keeper/default/stats/hp',
        url: '/api/keeper/default/stats/hp',
        title: 'Enter starting HP'
    });

    $('#table-user a').editable({
        type: 'checklist',
        url: '/api/user/admin',
        pk: '/api/user/admin',
        title: 'Admin?',
        source: {'1': 'yes'},
        emptytext: 'no'
    });
});

