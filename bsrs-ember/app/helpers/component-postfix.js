import Ember from 'ember';

const map = Object.create(null); // if somebody passed a param of that is on the prototype of the object
map.assignee = 'to-from';
map.comment = 'comment-activity';
map.categories = 'categories-activity';
map.create = 'create-activity';
map.priority = 'to-from';
map.status = 'to-from';
map.cc_add = 'cc-add-remove';
map.cc_remove = 'cc-add-remove';
map.attachment_add = 'attachment-add-remove';
map.attachment_remove = 'attachment-add-remove';
map.send_sms = 'send-msg-ticket-activity';
map.send_email = 'send-msg-ticket-activity';

Object.freeze(map);

export default Ember.Helper.helper((params) => {
  return map[params[0]];
});
