var BSRS_LOCATION_LEVEL_FACTORY = (function() {
    var factory = function(location_level_defaults) {
        this.idOne = location_level_defaults.idOne;
        this.idTwo = location_level_defaults.idTwo;
        this.idThree = location_level_defaults.idThree;
        this.idDistrict = location_level_defaults.idDistrict;
        this.nameCompany = location_level_defaults.nameCompany;
        this.nameRegion = location_level_defaults.nameRegion;
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
            var level = this.generate(uuid + i);
            level.name = 'admin.locationlevel.company.tsiname' + i;
            response.push(level);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.sorted = function(column, page) {
        var response;
        if(page && page === 2) {
            response = this.list_two().results;
        } else {
            response = this.list().results;
        }
        var columns = column.split(',');
        var column = columns[0];
        var sorted = response.sort(function(a,b) {
            if(column.match(/[-]/)) {
                return a[column] - b[column];
            }else{
                return b[column] - a[column];
            }
            //we do a reverse order sort here to verify a real sort occurs in the component
        });
        if(columns.length === 2) {
            sorted = response.sort(function(a,b) {
                return b[columns[1]] - a[columns[1]];
            });
        }
        return {'count':19,'next':null,'previous':null,'results': sorted};
    };
    factory.prototype.fulltext = function(find, page) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        var sorted = response.sort(function(a,b) {
            return a['id'] - b['id'];
        });
        var params = find.split(',');
        var filtered = params.map(function(option) {
            var property = option.split(':')[0];
            var propertyValue = option.split(':')[1];
            var findRegex = new RegExp(propertyValue);
            return sorted.filter(function(object) {
                var value = object[property] ? object[property].toLowerCase() : null;
                return findRegex.test(value);
            });
        });

        var paged;
        if(page && page > 1) {
            paged = filtered.slice(10, 20);
        } else {
            paged = filtered.slice(0, 10);
        }
        paged = paged.reduce(function(a, b) { return a.concat(b); }).uniq();
        return {'count':filtered.length,'next':null,'previous':null,'results': paged};
    },
    factory.prototype.searched = function(search, column, page) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        //we do a normal order sort here to slice correctly below
        var sorted = response.sort(function(a,b) {
            return a[column] - b[column];
        });
        var regex = new RegExp(search);
        var searched = sorted.filter(function(object) {
            var value = object.name;
            return regex.test(value);
        });
        var paged;
        if(page && page > 1) {
            paged = searched.slice(10, 20);
        } else {
            paged = searched.slice(0, 10);
        }
        return {'count':searched.length,'next':null,'previous':null,'results': paged};
    };
    factory.prototype.empty = function() {
        return {'count':3,'next':null,'previous':null,'results': []};
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
    var location_level_defaults = require('./defaults/location-level');
    module.exports = new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
} else {
    define('bsrs-ember/vendor/location_level_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location-level'], function (exports, location_level_defaults) {
        'use strict';
        return new BSRS_LOCATION_LEVEL_FACTORY(location_level_defaults);
    });
}

