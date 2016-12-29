import Ember from 'ember';

export const categories = function(activity) {
  let message_to = '';
  let message_from = '';
  const to = activity.get('categories_to');
  const length_to = to.get('length');
  to.forEach((cat, index) => {
    message_to = message_to + cat.get('name');
    if (index + 1 < length_to) {
      message_to = message_to + '/';
    }
  });
  const from = activity.get('categories_from');
  const length_from = from.get('length');
  from.forEach((cat, index) => {
    message_from = message_from + cat.get('name');
    if (index + 1 < length_from) {
      message_from = message_from + '/';
    }
  });
  return { name: 'activity.ticket.categories', translate_msgs_obj: { to: message_to, from: message_from } };
};

const cc_add = function(activity) {
  let message = '';
  const added = activity.get('added');
  const length = added.get('length');
  // concat string for each added category
  added.forEach((cc, index) => {
    message = message + cc.get('fullname');
    if(index + 1 < length) {
      message = message + ', ';
    }
  });
  return { name: 'activity.ticket.cc_add', translate_msgs_obj: { added: message } };
};

const cc_remove = function(activity) {
  let message = '';
  const removed = activity.get('removed');
  const length = removed.get('length');
  removed.forEach((cc, index) => {
    message = message + cc.get('fullname');
    if (index + 1 < length) {
      // TODO: use oxford-comma component
      message = message + ', ';
    }
  });
  return { name: 'activity.ticket.cc_remove', translate_msgs_obj: { removed: message } };
};

const attachment_add = function(activity) {
  let message = '';
  const added = activity.get('added_attachment');
  const length = added.get('length');
  added.forEach((attachment, index) => {
    message = message + attachment.get('filename');
    if (index + 1 < length) {
      message = message + ', ';
    }
  });
  return { name: 'activity.ticket.attachment_add', translate_msgs_obj: { count: length, added: message } };
};

const attachment_remove = function(activity) {
  let message = '';
  const removed = activity.get('removed_attachment');
  const length = removed.get('length');
  removed.forEach((attachment, index) => {
    message = message + attachment.get('filename');
    if (index + 1 < length) {
      message = message + ', ';
    }
  });
  return { name: 'activity.ticket.attachment_remove', translate_msgs_obj: { count: length, removed: message } };
};

const status_or_priority = function(type, to, from) {
  return function() {
    return { name: 'activity.ticket.to_from', translate_msgs_obj: { type: type, to: to, from: from } };
  };
};

const send_msg = function() {
  return { name: 'activity.ticket.msg_sent' };
};

const comment_func = function(comment) {
  return function() {
    return { name: 'activity.ticket.comment', translate_msgs_obj: { comment: comment } };
  };
};

const assignee = function(type, to, from) {
  return function() {
    return { name: 'activity.ticket.to_from', translate_msgs_obj: { type: type, to: to, from: from } };
  };
};

/**
 * Curried function that is partially applied with two required args
 * @method i18n_generate
 * @param {Function} i18n - curried
 * @param {Function} timestamp - curried
 * @return {String} - translated msg
 */
const i18n_generate = function(i18n, timestamp) {
  return function(args) {
    let { name: name, translate_msgs_obj: translate_msgs_obj = {} } = args;
    translate_msgs_obj['timestamp'] = timestamp;
    return i18n.t(name, translate_msgs_obj);
  };
};

/**
 * pipe is inteaded for partial application
 * Can take a variable number of functions that is needed to translate text
 * Reduce procedural boilerplate and not care about order
 * @method pipe
 * @param {Array} fns - functions to be reduced.  First function must take an 
 * @param {String} activity
 * activity model as the first argument
 * @return {Function} - method which accepts activity as a param
 */
const pipe = (fns) => {
  return (activity) => fns.reduce((v, f) => f(v), activity);
};

/** 
 * @method activity-description
 * create, categories, cc_add, cc_remove, attachment_add, attachment_remove, status, priority, assignee
 * used to build the i18n string, already translated, ready to pass to the respective activity component (to-from component)
 */
export default Ember.Helper.helper(function(params, addon) {
  let timestamp = addon.timestamp;
  let i18n = addon.i18n;
  const activity = params[0];
  const type = activity.get('type');
  const person = activity.get('person');
  let pipeFunctions;

  if (type === 'create') {
    return i18n.t('activity.ticket.create', { timestamp: timestamp });

  } else if (type === 'categories') {
    pipeFunctions = pipe([categories, i18n_generate(i18n, timestamp)]);

  } else if (type === 'cc_add') {
    pipeFunctions = pipe([cc_add, i18n_generate(i18n, timestamp)]);

  } else if (type === 'cc_remove') {
    pipeFunctions = pipe([cc_remove, i18n_generate(i18n, timestamp)]);

  } else if (type === 'attachment_add') {
    pipeFunctions = pipe([attachment_add, i18n_generate(i18n, timestamp)]);

  } else if (type === 'attachment_remove') {
    pipeFunctions = pipe([attachment_remove, i18n_generate(i18n, timestamp)]);

  } else if(type === 'comment') {
    const comment = activity.get('comment');
    pipeFunctions = pipe([comment_func(comment), i18n_generate(i18n, timestamp)]);

  } else if (type === 'status' || type === 'priority') {
    const to = activity.get('to.name');
    const from = activity.get('from.name');
    pipeFunctions = pipe([status_or_priority(type, i18n.t(to), i18n.t(from)), i18n_generate(i18n, timestamp)]);

  } else if (type === 'send_sms' || type === 'send_email') {
    // not sure I like this
    pipeFunctions = pipe([send_msg, i18n_generate(i18n, timestamp)]
    );
    // return i18n.t('activity.ticket.msg_sent', { timestamp: timestamp });

  } else if (type === 'assignee') {
    const to = activity.get('to.name');
    const from = activity.get('from.name');
    pipeFunctions = pipe([assignee(type, to, from), i18n_generate(i18n, timestamp)]);
  }

  return pipeFunctions(activity);
});
