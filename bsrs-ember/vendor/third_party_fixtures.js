var BSRS_THIRD_PARTY_FACTORY = (function() {
    var factory = function(third_party) {
        this.third_party = third_party.default || third_party;
    };
    // factory.prototype.get = function(i) {
    //     return {
    //         id: i || this.third_party.idOne,
    //         name: this.third_party.nameOne,
    //         number: this.third_party.numberOne,
    //     }
    // },
    factory.prototype.generate = function(i) {
        var id = i || this.third_party.idOne;
        return {
            id: id,
            name : this.third_party.nameOne,
            number : this.third_party.numberOne,
            status: this.third_party.statusActive,
        }
    };
    factory.prototype.list = function() {
        var response = [];
        response.push(this.generate(this.third_party.idOne));
        for (var i=1; i <= 10; i++) {
            var uuid = '4cc31ebe-cad3-44ea-aa33-bbe8d456ed4d';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var third_party = this.generate(uuid);
            third_party.name = third_party.name + i;
            third_party.number = third_party.number + i;
            response.push(third_party);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        // var sorted = response.sort(function(a,b) {
        //     return b.id - a.id;
        // });
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    // factory.prototype.list_two = function() {
    //     var response = [];
    //     for (var i=11; i <= 19; i++) {
    //         var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
    //         var third_party = this.generate(uuid + i);
    //         third_party.name = 'vzoname' + i;
    //         third_party.number = 'sconumber' + i;
    //         response.push(third_party);
    //     }
    //     return {'count':19,'next':null,'previous':null,'results': response};
    // };
    factory.prototype.detail = function(i) {
        return this.generate(this.third_party.idOne);
    };
    // factory.prototype.put = function(third_party) {
    //     var response = this.generate(third_party.id);
    //     response.third_party = this.third_party_fixtures.detail().id;
    //     for(var key in third_party) {
    //         response[key] = third_party[key];
    //     }
    //     return response;
    // };
    return factory;
})();

if (typeof window === 'undefined') {
    // var objectAssign = require('object-assign');
    // var mixin = require('../vendor/mixin');
    var third_party = require('../vendor/defaults/third-party');
    // objectAssign(BSRS_THIRD_PARTY_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_THIRD_PARTY_FACTORY(third_party);
} else {
    define('bsrs-ember/vendor/third_party_fixtures', ['exports', 'bsrs-ember/vendor/defaults/third-party'], function (exports, third_party) {
        'use strict';
        // Object.assign(BSRS_THIRD_PARTY_FACTORY.prototype, mixin.prototype);
        return new BSRS_THIRD_PARTY_FACTORY(third_party);
        // return {default: Factory};
    });
}


