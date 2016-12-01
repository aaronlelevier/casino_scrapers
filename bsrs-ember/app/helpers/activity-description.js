import Ember from 'ember';

export default Ember.Helper.helper(function(params, addon) {
  let timestamp = addon.timestamp;
  let i18n = addon.i18n;
  const activity = params[0];
  const type = activity.get('type');
  const person = activity.get('person');
  if(type === 'create') {
    return i18n.t('activity.ticket.create', {timestamp:timestamp});
  }else if(type === 'categories') {
    let message_to = '';
    let message_from = '';
    const to = activity.get('categories_to');
    const length_to = to.get('length');
    to.forEach((cat, index) => {
      message_to = message_to + cat.get('name');
      if(index + 1 < length_to) {
        message_to = message_to + '/';
      }
    });
    const from = activity.get('categories_from');
    const length_from = from.get('length');
    from.forEach((cat, index) => {
      message_from = message_from + cat.get('name');
      if(index + 1 < length_from) {
        message_from = message_from + '/';
      }
    });
    return i18n.t('activity.ticket.categories', {to:message_to, from:message_from, timestamp:timestamp});
  }else if(type === 'cc_add') {
    let message = '';
    const added = activity.get('added');
    const length = added.get('length');
    added.forEach((cc, index) => {
      message = message + cc.get('fullname');
      if(index + 1 < length) {
        message = message + ', ';
      }
    });
    return i18n.t('activity.ticket.cc_add', {added:message, timestamp:timestamp});
  }else if(type === 'cc_remove') {
    let message = '';
    const removed = activity.get('removed');
    const length = removed.get('length');
    removed.forEach((cc, index) => {
      message = message + cc.get('fullname');
      if(index + 1 < length) {
        message = message + ', ';
      }
    });
    return i18n.t('activity.ticket.cc_remove', {removed:message, timestamp:timestamp});
  }else if(type === 'attachment_add') {
    let message = '';
    const added = activity.get('added_attachment');
    const length = added.get('length');
    added.forEach((attachment, index) => {
      message = message + attachment.get('filename');
      if(index + 1 < length) {
        message = message + ', ';
      }
    });
    return i18n.t('activity.ticket.attachment_add', {count:length, added:message, timestamp:timestamp});
  }else if(type === 'attachment_remove') {
    let message = '';
    const removed = activity.get('removed_attachment');
    const length = removed.get('length');
    removed.forEach((attachment, index) => {
      message = message + attachment.get('filename');
      if(index + 1 < length) {
        message = message + ', ';
      }
    });
    return i18n.t('activity.ticket.attachment_remove', {count:length, removed:message, timestamp:timestamp});
  }else if(type === 'comment') {
    const comment = activity.get('comment');
    return i18n.t('activity.ticket.comment', {timestamp:timestamp, comment:comment});    
  }

  // if type is none of the above
  const to = activity.get('to.name');
  const from = activity.get('from.name');
  return i18n.t('activity.ticket.to_from', {type:type, to:to, from:from, timestamp:timestamp});
});
