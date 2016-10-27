import Ember from 'ember';

/* @method dtPathMunge
 * @param ticket -
 * @param dtd -
 * @param fieldsObj -
 * @param link - used to determine if dt_path ahead of @indx needs to be wiped out.  User went back and decided to go a different path
 * @param simpleStore -
 */
var dtPathMunge = function(ticket, dtd, fieldsObj, link, simpleStore) {
  let dt_path = ticket.get('dt_path') || [];

  /* build fields array && build options array for a new dtd that is not in dt_path */
  /* options id array that is used on init to set isChecked property.  presence of id in array indicates the value is checked */
  let fields = [];
  for (let obj of fieldsObj) {
    fields.push({id: obj[0], label: obj[1].label, value: obj[1].value, required: obj[1].required, options: obj[1].optionValues ? obj[1].optionValues : undefined});
  }
  /* if not existing */
  const new_ticket = {
    id: ticket.get('id'),
    requester: ticket.get('requester'),
    location: ticket.get('location.id'),
    status: ticket.get('status.id'),
    priority: ticket.get('priority.id'),
    request: ticket.get('request'),
    categories: ticket.get('categories_ids'),
    cc: ticket.get('cc_ids'),
    attachments: ticket.get('attachments_ids')
  };
  const new_dtd = {
    id: dtd ? dtd.get('id') : undefined,
    description: dtd.get('description'),
    prompt: dtd.get('prompt'),
    note: dtd.get('note'),
    fields,
  };


  /* dt_path stores fields and their values at that time */
  /* if modifying existing dt_path obj */
  const dtd_ids = dt_path.mapBy('dtd.id');
  const indx = dtd_ids.indexOf(dtd.get('id'));
  if (indx === 0) {
    /* wipe out dt_path ahead of indx if link destination id is not in dt_path array of dtd (i.e. transitioned back and then took a different route)*/
    if (Ember.$.inArray(link.get('destination').get('id'), dtd_ids) < 0) {
      dt_path.splice(indx+1);
    }
    /* need to rebuild ticket request based on updated values in fieldsObj and all other ticket requests in the dt_path containing this value */
    // UP
    for (let i=indx; i<dt_path.length; i++) {
      let mod_existing_request = '';
      /* jshint ignore:start */
      // DOWN
      for (let sub=0; sub<=i; sub++) {
        mod_existing_request += dt_path[sub]['dtd']['fields'].reduce((prev, field) => {
          const fieldObj = fieldsObj.get(field.id);
          return prev += fieldObj.value ? ` ${fieldObj.label}: ${fieldObj.value},` : '';
        }, '');
      }
      mod_existing_request = mod_existing_request && mod_existing_request.trim().replace(/,+$/, '');
      const existing_ticket = {
        ...dt_path[i]['ticket'],
        request: mod_existing_request
      };
      /* redo fields on snapshot of dtd.  Existing Map obj should be around from dtd-preview init method and obj should be updated from onFieldUpdate method in dtd-preview */
      let fields = [];
      dt_path[i]['dtd']['fields'].forEach((field) => {
        const obj = fieldsObj.get(field.id);
        fields.push({ id: field.id, label: obj.label, value: obj.value, required: obj.required, options: obj.optionValues ? obj.optionValues : undefined});
      });

      const existing_dtd = {
        ...dt_path[i]['dtd'],
        fields
      };
      dt_path[i] = {ticket: {}, dtd: {}};
      dt_path[i]['ticket'] = existing_ticket;
      dt_path[i]['dtd'] = existing_dtd;
      simpleStore.push('ticket', {id: ticket.get('id'), request: mod_existing_request});
      /* jshint ignore:end */
    }

  } else {
    dt_path = dt_path.concat([{
      ticket: new_ticket,
      dtd: new_dtd
    }]);
  }
  simpleStore.push('ticket', {id: ticket.get('id'), dt_path: dt_path});
};

export default dtPathMunge;
