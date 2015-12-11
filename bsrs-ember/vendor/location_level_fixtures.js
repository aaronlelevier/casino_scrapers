var BSRS_LOCATION_LEVEL_FACTORY = (function() {
    var factory = function(location_level_defaults, config) {
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
        this.config = config;
        this.location_level_defaults = location_level_defaults;
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
        var page_size = this.config.default.APP.PAGE_SIZE;
        for (var i=9; i <= page_size; i++) {
            var uuid = '8854f6c5-58c7-4849-971f-e8df9e15e55';
            if (i < page_size) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            response.push({id: uuid, name: this.nameCompany + i});
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':page_size*2-1,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.list_two = function() {
        var response = [];
        var page_size = this.config.default.APP.PAGE_SIZE;
        for (var i=page_size+1; i <= page_size*2-1; i++) {
            var uuid = '8854f6c5-58c7-4849-971f-e8df9e15e55';
            var level = this.generate_list(uuid + i);
            level.name = 'Company-tsiname' + i;
            response.push(level);
        }
        return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
    };
    factory.prototype.put = function(level) {
        var location_levels = this.detail();
        for(var key in level) {
            location_levels[key] = level[key];
        }
        return location_levels;
    };
    factory.prototype.all_location_levels = function() {
        return [{'id': '85c18266-dfca-4499-9cff-7c5c6970af7e','name':this.location_level_defaults.nameCompany, 'children': ['c42bd2fc-d959-4896-9b89-aa2b2136ab9a', 'ef2b1f9c-f277-433f-8431-bda21d2d9a74', 'f7199d15-b78b-4db9-b28f-cc95b4662804', '558d3cb9-f076-4303-a818-84799806d698', '73dcbd73-8fad-4152-b92c-3408c2029a65', '8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'c42bd2fc-d959-4896-9b89-aa2b2136ab9a','name': this.location_level_defaults.nameRegion, 'children': ['73dcbd73-8fad-4152-b92c-3408c2029a65', '8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id':'73dcbd73-8fad-4152-b92c-3408c2029a65', 'name': this.location_level_defaults.nameDistrict, 'children': ['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f'] },
            {'id': '8854f6c5-58c7-4849-971f-e8df9e15e559', 'name': this.location_level_defaults.nameStore, 'children':['b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'ef2b1f9c-f277-433f-8431-bda21d2d9a74','name': this.location_level_defaults.nameFacilityManagement, 'children': ['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'f7199d15-b78b-4db9-b28f-cc95b4662804', 'name': this.location_level_defaults.nameLossPreventionRegion, 'children':['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f', '558d3cb9-f076-4303-a818-84799806d698']},
            {'id': '558d3cb9-f076-4303-a818-84799806d698', 'name': this.location_level_defaults.nameLossPreventionDistrict, 'children':['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']},
            {'id': 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f','name': this.location_level_defaults.nameDepartment, 'children': [] }];
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('../vendor/mixin');
    var location_level_defaults = require('./defaults/location-level');
    var config = require('../config/environment');
    objectAssign(BSRS_LOCATION_LEVEL_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults, config);
} else {
    define('bsrs-ember/vendor/location_level_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'], function (exports, location_level_defaults, mixin, config) {
        'use strict';
        Object.assign(BSRS_LOCATION_LEVEL_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults, config);
        return {default: Factory};
    });
}

