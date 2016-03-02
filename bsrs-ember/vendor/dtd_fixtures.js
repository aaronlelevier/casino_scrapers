var BSRS_DTD_FACTORY = (function() {
    var factory = function(dtd_defaults, link_defaults, config) {
        this.dtd = dtd_defaults;
        this.link = link_defaults;
        this.config = config;
    };
    factory.prototype.generate = function(i, key) {
        var id = i || this.dtd.idOne;
        var key = key || this.dtd.keyOne;
        return {
            id: id,
            key: key,
            description: this.dtd.descriptionOne,
            prompt: this.dtd.promptOne,
            note: this.dtd.noteOne,
            note_type: this.dtd.noteTypeOne,
            link_type: this.dtd.linkTypeOne,
            links: [
                {
                    id: this.link.idOne,
                    order: this.link.orderOne,
                    action_button: this.link.action_buttonOne,
                    is_header: this.link.is_headerOne,
                    request: this.link.requestOne,
                    priority_fk: this.link.priorityOne
                }
            ]
        }
    };
    factory.prototype.generate_list = function(i, key) {
        var id = i || this.dtd.idOne;
        var key = key || this.dtd.keyOne;
        return {
            id: id,
            key: key,
            description: this.dtd.descriptionOne
        }
    };
    factory.prototype.list = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=1; i <= page_size; i++) {
            var uuid = '9435c17c-42eb-43be-9aa6-ed111a787b';
            var key;
            if (i < page_size) {
                uuid = uuid + '0' + i;
                key = '1.1.' + i;
            }else{
                uuid = uuid + i;
                key = '1.1.' + i;
            }
            var dtd = this.generate_list(uuid, key);
            response.push(dtd);
        }
        return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
    };
    factory.prototype.list_two = function() {
        var response = [];
        var page_size = this.config.default ? this.config.default.APP.PAGE_SIZE : 10;
        for (var i=page_size+1; i <= page_size*2-1; i++) {
            var uuid = 'cf2b9c85-f6bd-4345-9834-e5d22ap05p';
            var key = '1.2.' + i;
            var dtd = this.generate_list(uuid + i, key);
            response.push(dtd);
        }
        return {'count':page_size*2-1,'next':null,'previous':null,'results': response};
    };
    factory.prototype.detail = function(i, key) {
        var pk = i || this.dtd.idOne;
        var key = key || this.dtd.keyOne;
        var detail = this.generate(pk, key);
        return detail;
    };
    // factory.prototype.put = function(dtd) {
    //     var response = this.generate(dtd.id);
    //     response.cc = [response.cc[0].id];
    //     response.location = response.location.id;
    //     response.assignee = response.assignee.id;
    //     response.categories = response.categories.map(function(cat) { return cat.id; });
    //     response.status = response.status_fk;
    //     response.priority =  response.priority_fk;
    //     delete response.status_fk;
    //     delete response.priority_fk;
    //     delete response.number;
    //     for(var key in dtd) {
    //         response[key] = dtd[key];
    //     }
    //     return response;
    // };
    return factory;
})();

if (typeof window === 'undefined') {
    var objectAssign = require('object-assign');
    var mixin = require('./mixin');
    var dtd_defaults = require('./defaults/dtd');
    var link_defaults = require('./defaults/link');
    var config = require('../config/environment');
    objectAssign(BSRS_DTD_FACTORY.prototype, mixin.prototype);
    module.exports = new BSRS_DTD_FACTORY(dtd_defaults, link_defaults, config);
} else {
    define('bsrs-ember/vendor/dtd_fixtures', ['exports', 'bsrs-ember/vendor/defaults/dtd', 'bsrs-ember/vendor/defaults/link', 'bsrs-ember/vendor/mixin', 'bsrs-ember/config/environment'],
           function (exports, dtd_defaults, link_defaults, mixin, config) {
        'use strict';
        Object.assign(BSRS_DTD_FACTORY.prototype, mixin.prototype);
        var Factory = new BSRS_DTD_FACTORY(dtd_defaults, link_defaults, config);
        return {default: Factory};
    });
}

