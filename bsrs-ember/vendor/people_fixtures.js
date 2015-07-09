var generatePerson = function(i) {
    return {
        "id": i,
        "username": "akrier",
        "first_name": "Andy",
        "last_name": "Krier",
        "title": "RVP",
        "empnumber": "5063",
        "authamount": "50000.0000",
        "status":{
            "id":1,
            "name":"person.status.active"
        },
        "role":{
            "id":1,
            "name":"admin.role.hosting_administrator",
            "locationlevel":1,
            "roletype":"location"
        }

    }
}//generatePerson

var PEOPLE_FACTORY = {
    list: function() {
        'use strict';
        var response = [];
        for (var i=0; i < 50; i++) { 
            response.push(generatePerson(i));
        }
        return {"results": response};
    },
}


if (typeof window === 'undefined') {
    module.exports = PEOPLE_FACTORY; 
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports'], function (exports) {
        'use strict';
        return PEOPLE_FACTORY;
    });
}

