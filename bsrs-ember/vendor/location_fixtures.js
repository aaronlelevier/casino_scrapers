var BSRS_LOCATION_FACTORY = (function() {
    var factory = function(location_defaults, location_level_defaults, location_level_fixtures) {
        this.location_defaults = location_defaults;
        this.location_level_defaults = location_level_defaults;
        this.location_level_fixtures = location_level_fixtures;
    };
    factory.prototype.get = function(i) {
        return {
            id: i || this.location_defaults.idOne,
            name: this.location_defaults.storeName,
            number: this.location_defaults.storeName,
            location_level: this.location_level_fixtures.detail()
        }
    },
    factory.prototype.generate = function(i) {
        var id = i || this.location_defaults.idOne;
        return {
            id: id,
            name : this.location_defaults.baseStoreName,
            number : this.location_defaults.storeNumber,
            status: this.location_defaults.status,
            location_level: this.location_level_fixtures.detail(),
            children: [],
            parents: []
        }
    };
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var location = this.generate(uuid);
            location.name = location.name + i;
            location.number = location.number + i;
            response.push(location);
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
            var uuid = '232z46cf-9fbb-456z-4hc3-59728vu3099';
            var location = this.generate(uuid + i);
            location.name = 'vzoname' + i;
            location.number = 'sconumber' + i;
            response.push(location);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
    };
    factory.prototype.paginated = function(page_size) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        var sorted = response.sort(function(a,b) {
            return a['id'] - b['id'];
        });
        var paginated;
        if(page_size > 10) {
            paginated = sorted;
        }else{
            paginated = sorted.slice(0, 10);
        }
        return {'count':18,'next':null,'previous':null,'results': paginated};
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
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.detail = function(i) {
        return this.generate(this.location_defaults.idOne);
    };
    factory.prototype.put = function(location) {
        var response = this.generate(location.id);
        response.location_level = this.location_level_fixtures.detail().id;
        for(var key in location) {
            response[key] = location[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var location_defaults = require('../vendor/defaults/location');
    var location_level_fixtures = require('../vendor/location_level_fixtures');
    var location_level_defaults = require('../vendor/defaults/location-level');
    module.exports = new BSRS_LOCATION_FACTORY(location_defaults, location_level_defaults, location_level_fixtures);
} else {
    define('bsrs-ember/vendor/location_fixtures', ['exports', 'bsrs-ember/vendor/defaults/location', 'bsrs-ember/vendor/defaults/location-level', 'bsrs-ember/vendor/location_level_fixtures'], function (exports, location_defaults, location_level_defaults, location_level_fixtures) {
        'use strict';
        return new BSRS_LOCATION_FACTORY(location_defaults, location_level_defaults, location_level_fixtures);
    });
}

