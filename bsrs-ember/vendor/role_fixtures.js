var BSRS_ROLE_FACTORY = (function() {
    var factory = function(role_defaults, category_fixtures, location_level_fixtures) {
        this.role_defaults = role_defaults;
        this.category_fixtures = category_fixtures;
        this.location_level_fixtures = location_level_fixtures;
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name: this.role_defaults.nameOne,
            role_type: this.role_defaults.roleTypeGeneral,
            location_level: this.location_level_fixtures.detail().id
        }
    };
    factory.prototype.generate_single_for_list = function(i) {
        var role = this.generate(i);
        delete role.role_type;
        return role;
    };
    factory.prototype.list = function() {
        var response = [];
        var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04b';
        response.push({id: uuid + 1, name: this.role_defaults.nameOne, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.roleTypeGeneral });
        response.push({id: uuid + 2, name: this.role_defaults.nameTwo, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.roleTypeGeneral });
        response.push({id: uuid + 3, name: this.role_defaults.nameThree, location_level: this.location_level_fixtures.detail().id, role_type: this.role_defaults.roleTypeGeneral });
        for (var i=4; i <= 10; i++) {
            var rando_uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
            if (i < 10) {
                rando_uuid = rando_uuid + '0' + i;
            } else{
                rando_uuid = rando_uuid + i;
            }
            var role = this.generate(rando_uuid);
            role.name = 'zap' + i;
            response.push(role);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
        //return {'count':2,'next':null,'previous':null,'results': response};
    };
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = 'af34ee9b-833c-4f3e-a584-b6851d1e04';
            var role = this.generate(uuid + i);
            role.name = 'xav' + i;
            response.push(role);
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
    factory.prototype.detail = function(i) {
        var role = this.generate(i);
        return role;
    };
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.put = function(role) {
        var response = this.generate(role.id);
        response.location_level = response.location_level.id;
        for (var key in role) {
            response[key] = role[key];
        }
        return response;
    };
    //TODO: does this need to return the full object as shown in API docs or b/c we have loc_level and roles preloaded, then we don't?
    // factory.prototype.get = function() {
    //     return {
    //         'id': this.role_defaults.idOne,
    //         'name': this.role_defaults.nameOne,
    //         'location_level': this.location_level_fixtures.detail().id,
    //         'role_type': this.role_defaults.roleTypeGeneral
    //     }
    // };
    factory.prototype.get = function() {
        return this.role_defaults.idOne;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var role_defaults = require('../vendor/defaults/role');
    var category_fixtures = require('../vendor/category_fixtures');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    module.exports = new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures);
} else {
    define('bsrs-ember/vendor/role_fixtures', ['exports','bsrs-ember/vendor/defaults/role', 'bsrs-ember/vendor/category_fixtures', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, role_defaults, category_fixtures, location_level_fixtures) {
        'use strict';
        return new BSRS_ROLE_FACTORY(role_defaults, category_fixtures, location_level_fixtures);
    });
}
