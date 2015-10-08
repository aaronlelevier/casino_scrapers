var BSRS_LOCATION_LEVEL_FACTORY = (function() {
    var factory = function(location_level_defaults) {
        this.idOne = location_level_defaults.idOne;
        this.idTwo = location_level_defaults.idTwo;
        this.idThree = location_level_defaults.idThree;
        this.idDistrict = location_level_defaults.idDistrict;
        this.nameCompany = location_level_defaults.nameCompany;
        this.nameRegion = location_level_defaults.nameRegion;
        this.nameLossPreventionDistrict = location_level_defaults.lossPreventionDistrict;
        // this.nameStore = location_level_defaults.nameStore;
        this.nameDistrict = location_level_defaults.nameDistrict;
        this.allChildrenArray = location_level_defaults.companyChildren;
        this.districtChildrenArray = location_level_defaults.districtChildrenArray;
    };
    factory.prototype.generate = function(i, name) {
        return {
            id: i,
            name : name || this.nameCompany,
            children: [],
            parents: []
        }
    };
    factory.prototype.generate_list = function(i, name) {
        return {
            id: i,
            name : name || this.nameCompany
        }
    };
    factory.prototype.detail = function(i) {
        var idDetail = i || this.idOne;
        return {id: idDetail, name : this.nameCompany, children: this.allChildrenArray};
    };
    factory.prototype.detail_district = function() {
        return {id: this.idDistrict, name: this.nameDistrict, children: ['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']};
    };
    factory.prototype.list = function() {
        response = [
            {id: this.idOne, name : this.nameCompany},
            {id: this.idDistrict, name : this.nameDistrict},
            {id: this.idThree, name : this.nameRegion}
        ];
        for (var i=9; i <= 10; i++) {
            var uuid = '8854f6c5-58c7-4849-971f-e8df9e15e55';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            response.push({id: uuid, name: 'admin.locationlevel.company' + i});
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = '8854f6c5-58c7-4849-971f-e8df9e15e55';
            var level = this.generate_list(uuid + i);
            level.name = 'admin.locationlevel.company.tsiname' + i;
            response.push(level);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.put = function(level) {
        var location_levels = this.detail();
        for(var key in level) {
            location_levels[key] = level[key];
        }
        return location_levels;
    };
    factory.prototype.all_location_levels = function() {
        return [{'id': '85c18266-dfca-4499-9cff-7c5c6970af7e','name':'admin.locationlevel.company', 'children': ['c42bd2fc-d959-4896-9b89-aa2b2136ab9a', 'ef2b1f9c-f277-433f-8431-bda21d2d9a74', 'f7199d15-b78b-4db9-b28f-cc95b4662804', '558d3cb9-f076-4303-a818-84799806d698', '73dcbd73-8fad-4152-b92c-3408c2029a65', '8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'c42bd2fc-d959-4896-9b89-aa2b2136ab9a','name':'admin.locationlevel.region', 'children': ['73dcbd73-8fad-4152-b92c-3408c2029a65', '8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id':'73dcbd73-8fad-4152-b92c-3408c2029a65', 'name': 'admin.locationlevel.district', 'children': ['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f'] },
            {'id': '8854f6c5-58c7-4849-971f-e8df9e15e559', 'name': 'admin.locationlevel.store', 'children':['b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'ef2b1f9c-f277-433f-8431-bda21d2d9a74','name':'admin.locationlevel.facility_management', 'children': ['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'f7199d15-b78b-4db9-b28f-cc95b4662804', 'name': 'admin.locationlevel.loss_prevention_region', 'children':['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f', '558d3cb9-f076-4303-a818-84799806d698']},
            {'id': '558d3cb9-f076-4303-a818-84799806d698', 'name': 'admin.locationlevel.loss_prevention_district', 'children':['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f','name':'admin.locationlevel.department', 'children': [] }];
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var location_level_defaults = require('./defaults/location-level');
    objectAssign(BSRS_LOCATION_LEVEL_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
} else {
    define('bsrs-ember/vendor/location_level_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/mixin'], function (exports, location_level_defaults, mixin) {
        'use strict';
        Object.assign(BSRS_LOCATION_LEVEL_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
        return {default: Factory};
    });
}

