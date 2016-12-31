var TICKET_ACTIVITY_FACTORY = (function() {
  var factory = function(pd, td, cd, general, ta, ad) {
    this.ad = ad;
    this.pd = pd['default'].defaults();
    this.td = td;
    this.cd = cd;
    this.ta = ta;
    this.general = general;
  };
  factory.prototype.empty = function() {
    return {'count':0,'next':null,'previous':null,'results': []};
  };
  factory.prototype.get_assignee_automation = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'assignee', created: d.setDate(d.getDate()-25), ticket: ticket_id};
    activity.automation = {id: this.ad.idOne, description: this.ad.descriptionOne};
    activity.person = null;
    activity.content = {to: {id: this.pd.idSearch, fullname: this.pd.fullnameBoy}, from: {id: this.pd.idBoy, fullname: this.pd.fullnameBoy2}};
    return activity;
  },
  factory.prototype.get_comment = function(i, ticket_pk, name) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'comment', created: d.setDate(d.getDate()-120), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    var name_override = name || this.td.commentOne;
    activity.content = {'comment': name_override};
    return activity;
  },
  factory.prototype.get_category = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'categories', created: d.setDate(d.getDate()-90), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    activity.content = {to: [{id: this.cd.idOne, name: this.cd.nameOne}], from: [{id: this.cd.idTwo, name: this.cd.nameTwo}]};
    return activity;
  },
  factory.prototype.get_categories_automation = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'categories', created: d.setDate(d.getDate()-25), ticket: ticket_id};
    activity.automation = {id: this.ad.idOne, description: this.ad.descriptionOne};
    activity.content = {to: [{id: this.cd.idOne, name: this.cd.nameOne}], from: [{id: this.cd.idTwo, name: this.cd.nameTwo}]};
    return activity;
  },
  factory.prototype.get_category_multiple = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'categories', created: d.setDate(d.getDate()-90), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    activity.content = {to: [{id: this.cd.idOne, name: this.cd.nameOne}, {id: this.cd.idThree, name: this.cd.nameThree}], from: [{id: this.cd.idTwo, name: this.cd.nameTwo}, {id: this.cd.idChild, name: this.cd.namePlumbingChild}]};
    return activity;
  },
  factory.prototype.get_create = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'create', created: d.setDate(d.getDate()-90), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    activity.content = null;
    return activity;
  },
  factory.prototype.get_create_json = function(i, ticket_pk) {
    var activity = this.get_create(i, ticket_pk);
    activity.person_fk = activity.person.id;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  factory.prototype.get_assignee = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'assignee', created: d.setDate(d.getDate()-45), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, username: this.pd.username, fullname: this.pd.fullname};
    activity.content = {to: {id: this.pd.idSearch, fullname: this.pd.fullnameBoy}, from: {id: this.pd.idBoy, fullname: this.pd.fullnameBoy2}};
    return activity;
  },
  factory.prototype.get_assignee_json = function(i, ticket_pk) {
    var activity = this.get_assignee(i, ticket_pk);
    activity.to_fk = activity.content.to.id;
    activity.from_fk = activity.content.from.id;
    activity.person_fk = activity.person.id;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  factory.prototype.get_assignee_person_and_to_from_json = function(i, ticket_pk) {
    var activity = this.get_assignee(i, ticket_pk);
    return {person: activity.person, to: activity.content.to, from: activity.content.from};
  },
  factory.prototype.get_status = function(i, ticket_pk, inc) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'status', created: d.setDate(d.getDate()-30), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    activity.content = {to: this.td.statusOneId, from: this.td.statusTwoId};
    return activity;
  },
  factory.prototype.get_priority = function(i, ticket_pk) {
    var d = new Date();
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: 'priority', created: d.setDate(d.getDate()-60), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    activity.content = {to: this.td.priorityOneId, from: this.td.priorityTwoId};
    return activity;
  },
  factory.prototype.get_status_json = function(i, ticket_pk) {
    var activity = this.get_status(i, ticket_pk);
    activity.to_fk = activity.content.to;
    activity.from_fk = activity.content.from;
    activity.person_fk = activity.person.id;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  factory.prototype.get_priority_json = function(i, ticket_pk) {
    var activity = this.get_priority(i, ticket_pk);
    activity.to_fk = activity.content.to;
    activity.from_fk = activity.content.from;
    activity.person_fk = activity.person.id;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  factory.prototype.get_cc_add_remove = function(i, count, type, ticket_pk) {
    var d = new Date();
    var added_removed = [];
    for (var j=1; j <= count; j++) {
      var person = {id: '249543cf-8fea-426a-8bc3-09778cd7800' + j, fullname: this.pd.fullnameBoy};
      added_removed.push(person);
    }
    var ticket_id = ticket_pk || this.td.idOne;
    var date_reset = type === 'cc_remove' ? 20 : 15;
    var activity = {id: i, type: type, created: d.setDate(d.getDate()-date_reset), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    var key = type === 'cc_add' ? 'added' : 'removed';
    activity.content = {};
    activity.content[key] = added_removed;
    return activity;
  },
  factory.prototype.get_automation_cc_add_remove = function(i, count, type, ticket_pk) {
    var activity = this.get_cc_add_remove(i, count, type, ticket_pk);
    activity.automation = {id: this.ad.idOne, description: this.ad.descriptionOne};
    delete activity.person;
    return activity;
  },
  factory.prototype.get_cc_add_remove_json = function(i, count, type, ticket_pk) {
    var activity = this.get_cc_add_remove(i, count, type, ticket_pk);
    activity.person_fk = activity.person.id;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  factory.prototype.get_send_sms_or_email = function(i, count, type, ticket_pk) {
    var d = new Date();
    var added_removed = [];
    for (var j=1; j <= count; j++) {
      var person = {id: '249543cf-8fea-426a-8bc3-09778cd7800' + j, fullname: this.pd.fullnameBoy};
      added_removed.push(person);
    }
    var ticket_id = ticket_pk || this.td.idOne;
    var date_reset = type === 'cc_remove' ? 20 : 15;
    var activity = {id: i, type: type, created: d.setDate(d.getDate()-date_reset), ticket: ticket_id};
    activity.automation = {id: this.ad.idOne, description: this.ad.descriptionOne};
    activity.content = {};
    activity.content[type] = added_removed;
    return activity;
  },
  factory.prototype.get_attachment_activity = function(i) {
    var arr = [
      [this.general.nameTicketAttachmentOne, this.ta.fileAttachmentAddOne, this.ta.imageThumnailOne],
      [this.general.nameTicketAttachmentTwo, this.ta.fileAttachmentAddTwo, this.ta.imageThumnailTwo],
      [this.general.nameTicketAttachmentThree, this.ta.fileAttachmentAddThree, this.ta.imageThumnailThree],
      [this.general.nameTicketAttachmentFour, this.ta.fileAttachmentAddFour, this.ta.imageThumnailFour],
      [this.general.nameTicketAttachmentFive, this.ta.fileAttachmentAddFive, this.ta.imageThumnailFive]
    ];
    return attachment = {
      id: '249543cf-8fea-426a-8bc3-09778cd7801' + (i + 1),
      filename: arr[i][0],
      file: arr[i][1],
      image_thumbnail: arr[i][2]
    };
  },
  factory.prototype.get_attachment_add_remove = function(i, count, type, ticket_pk) {
    var d = new Date();
    var added_removed = [];
    for (var j=0; j <= count-1; j++) {
      added_removed.push(this.get_attachment_activity(j));
    }
    var ticket_id = ticket_pk || this.td.idOne;
    var activity = {id: i, type: type, created: d.setDate(d.getDate()-180), ticket: ticket_id};
    activity.person = {id: this.pd.idOne, fullname: this.pd.fullname};
    var key = type === 'attachment_add' ? 'added' : 'removed';
    activity.content = {};
    activity.content[key] = added_removed;
    return activity;
  },
  factory.prototype.get_attachment_add_remove_json = function(i, count, type, ticket_pk) {
    var activity = this.get_attachment_add_remove(i, count, type, ticket_pk);
    activity.person_fk = activity.person.id;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  //
  factory.prototype.created_only = function(ticket_pk) {
    var response = [];
    var uuid = '649447cc-1a19-4d8d-829b-bfb81cb5ece1';
    var activity = this.get_create(uuid, ticket_pk);
    response.push(activity);
    return this.response(1, response);
  };
  factory.prototype.get_comment_json = function(i) {
    var activity = this.get_comment(i);
    activity.person_fk = activity.person.id;
    activity.comment = activity.content.comment;
    delete activity.person;
    delete activity.content;
    return activity;
  },
  factory.prototype.comment_only = function(ticket_pk, count, comment) {
    var response = [];
    var count = count || 1;
    for (var i=1; i<=count; i++) {
      var uuid = '549447cc-1a19-4d8d-829b-bfb81cb5ecw';
      var activity = this.get_comment(uuid+i, ticket_pk, comment);
      response.push(activity);
    }
    return this.response(count, response);
  };
  factory.prototype.categories_only = function(ticket_pk, count) {
    var response = [];
    var count = count || 1;
    for (var i=1; i<=count; i++) {
      var uuid = '759447cc-1a19-4d8d-829b-bfb81cb6fdz';
      var activity = this.get_category(uuid+i, ticket_pk);
      response.push(activity);
    }
    return this.response(count, response);
  };
  factory.prototype.automation_categories_only = function(ticket_pk, count) {
    var response = [];
    var count = count || 1;
    for (var i=1; i<=count; i++) {
      var uuid = '759447cc-1a19-4d8d-829b-bfb81cb6fdz';
      var activity = this.get_categories_automation(uuid+i, ticket_pk);
      response.push(activity);
    }
    return this.response(count, response);
  };
  factory.prototype.categories_multiple_only = function(ticket_pk) {
    var response = [];
    var uuid = '859447cc-1a19-5d8d-929b-bfb81cb6fdz';
    var activity = this.get_category_multiple(uuid, ticket_pk);
    response.push(activity);
    return this.response(1, response);
  };
  factory.prototype.assignee_only = function(ticket_pk) {
    var response = [];
    for (var i=1; i <= 2; i++) {
      var uuid = '749447cc-1a19-4d8d-829b-bfb81cb5ece';
      var activity = this.get_assignee(uuid+i, ticket_pk);
      response.push(activity);
    }
    return this.response(2, response);
  };
  factory.prototype.automation_assignee_only = function(ticket_pk) {
    var response = [];
    for (var i=1; i <= 2; i++) {
      var uuid = '849447cc-1a19-4d8d-829b-bfb81cb5pcu';
      var activity = this.get_assignee_automation(uuid+i, ticket_pk);
      response.push(activity);
    }
    return this.response(2, response);
  };
  factory.prototype.status_only = function(ticket_pk) {
    var response = [];
    for (var i=1; i <= 3; i++) {
      var uuid = '849447cc-1a19-4d8d-829b-bfb81cb5ece';
      var activity = this.get_status(uuid+i, ticket_pk, i);
      response.push(activity);
    }
    return this.response(3, response);
  };
  factory.prototype.priority_only = function(ticket_pk) {
    var response = [];
    for (var i=1; i <= 3; i++) {
      var uuid = '049447cc-1a19-4d8d-829b-bfb81cb5ece';
      var activity = this.get_priority(uuid+i, ticket_pk);
      response.push(activity);
    }
    return this.response(3, response);
  };
  factory.prototype.cc_add_only = function(count, ticket_pk, multiple) {
    multiple = multiple || 1;
    var response = [];
    for (var i=1; i <= multiple; i++) {
      var uuid = '949447cc-1a19-4d8d-829b-bfb81cb5ece' + i;
      var activity = this.get_cc_add_remove(uuid, count, 'cc_add', ticket_pk);
      response.push(activity);
    }
    return this.response(multiple, response);
  };
  factory.prototype.automation_cc_add_only = function(count, ticket_pk) {
    var uuid = '949447cc-1a19-4d8d-829b-bfb81cb5ece1';
    var activity = this.get_automation_cc_add_remove(uuid, count, 'cc_add', ticket_pk);
    var response = [activity];
    return this.response(1, response);
  };
  factory.prototype.cc_remove_only = function(count, ticket_pk, multiple) {
    multiple = multiple || 1;
    var response = [];
    for (var i=1; i <= multiple; i++) {
      var uuid = '149447cc-1a19-4d8d-829b-bfb81cb5ecc' + i;
      var activity = this.get_cc_add_remove(uuid, count, 'cc_remove', ticket_pk);
      response.push(activity);
    }
    return this.response(multiple, response);
  };
  factory.prototype.send_sms_or_email_only = function(activity_name, count, ticket_pk, multiple) {
    // activity_name is either send_email or send_sms
    multiple = multiple || 1;
    var response = [];
    for (var i=1; i <= multiple; i++) {
      var uuid = '149447cc-1a19-4d8d-829b-bfb81cb5ecc' + i;
      var activity = this.get_send_sms_or_email(uuid, count, activity_name, ticket_pk);
      response.push(activity);
    }
    return this.response(multiple, response);
  };
  factory.prototype.attachment_add_only = function(count, ticket_pk) {
    var uuid = '449447cd-1a19-4d8d-829b-bfb81cb5jcw8';
    var activity = this.get_attachment_add_remove(uuid, count, 'attachment_add', ticket_pk);
    var response = [activity];
    return this.response(1, response);
  };
  factory.prototype.attachment_remove_only = function(count, ticket_pk) {
    var uuid = '449447cd-1a19-4d8d-829b-bfb81cb5jcw8';
    var activity = this.get_attachment_add_remove(uuid, count, 'attachment_remove', ticket_pk);
    var response = [activity];
    return this.response(1, response);
  };
  factory.prototype.response = function(count, response) {
    return {'count':count,'next':null,'previous':null,'results': response};
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var pd = require('../vendor/defaults/person');
  var td = require('../vendor/defaults/ticket');
  var ta = require('../vendor/defaults/ticket_activity');
  var cd = require('../vendor/defaults/category');
  var ad = require('../vendor/defaults/automation');
  var general = require('../vendor/defaults/general');
  module.exports = new TICKET_ACTIVITY_FACTORY(pd, td, cd, general, ta, ad);
} else {
  define('bsrs-ember/vendor/ticket_activity_fixtures', ['exports', 'bsrs-ember/vendor/defaults/person', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/defaults/category', 'bsrs-ember/vendor/defaults/general', 'bsrs-ember/vendor/defaults/ticket_activity', 'bsrs-ember/vendor/defaults/automation'], function (exports, pd, td, cd, general, ta, ad) {
    'use strict';
    var Factory = new TICKET_ACTIVITY_FACTORY(pd, td, cd, general, ta, ad);
    return {default: Factory};
  });
}
