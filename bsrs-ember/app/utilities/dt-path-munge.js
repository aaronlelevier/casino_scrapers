var dtPathMunge = function(ticket, dtd, fieldsObj, simpleStore) {
  let dt_path = ticket.get('dt_path') || [];

  // build fields array && build options array for a new dtd that is not in dt_path
  let fields = [];
  for (let obj of fieldsObj) {
    fields.push({id: obj[0], label: obj[1].label, value: obj[1].value, required: obj[1].required, options: obj.optionValues ? obj.optionValues : undefined});
    //options id array that is used on init to set isChecked property.  presence of id indicates the value is checked
    if (obj.optionValues) {
      fields['options'] =  obj.optionValues;
    }
  }
  // if not existing
  const new_ticket = {
    id: ticket.get('id'),
    requester: ticket.get('requester'),
    location: ticket.get('location.id'),
    status: ticket.get('status.id'),
    priority: ticket.get('priority.id'),
    request: ticket.get('request'),
    categories: ticket.get('categories_ids'),
    cc: ticket.get('cc_ids'),
    attachments: ticket.get('attachment_ids')
  };
  const new_dtd = {
    id: dtd ? dtd.get('id') : undefined,
    description: dtd.get('description'),
    prompt: dtd.get('prompt'),
    note: dtd.get('note'),
    fields,
  };


  // fieldObjs values build up current ticket request value
  // dt_path stores fields and their values at that time
  // if on old dtd
  const dtd_ids = dt_path.mapBy('dtd.id');
  const indx = dtd_ids.indexOf(dtd.get('id'));
  if (indx === 0) {
    // if modifying existing dt_path obj
    // need to rebuild ticket request based on updated values in fieldsObj and all other ticket requests in the dt_path containing this value
    let mod_existing_request = dt_path[indx]['dtd']['fields'].reduce((prev, field) => {
      const fieldObj = fieldsObj.get(field.id);
      return prev += ` ${fieldObj.label}: ${fieldObj.value},`;
    }, '');
    mod_existing_request = mod_existing_request && mod_existing_request.trim().replace(/,+$/, '');
    /* jshint ignore:start */
    const existing_ticket = {
      ...dt_path[indx]['ticket'],
      request: mod_existing_request
    };
    const existing_dtd = {
      ...dt_path[indx]['dtd']
    };
    dt_path[indx] = {ticket: {}, dtd: {}};
    dt_path[indx]['ticket'] = existing_ticket;
    dt_path[indx]['dtd'] = existing_dtd;
    //loop through remaining dt_paths
    for(let i=indx+1; i<dt_path.length; i++) {
      let mod_existing_request = dt_path[i]['dtd']['fields'].reduce((prev, field) => {
        const fieldObj = fieldsObj.get(field.id);
        return prev += ` ${fieldObj.label}: ${fieldObj.value},`;
      }, '');
      mod_existing_request = mod_existing_request && mod_existing_request.trim().replace(/,+$/, '');
      const existing_ticket = {
        ...dt_path[i]['ticket'],
        request: mod_existing_request
      };
      const existing_dtd = {
        ...dt_path[i]['dtd']
      };
      dt_path[i] = {ticket: {}, dtd: {}};
      dt_path[i]['ticket'] = existing_ticket;
      dt_path[i]['dtd'] = existing_dtd;
    }

    /* jshint ignore:end */
  } else {
    dt_path = dt_path.concat([{
      ticket: new_ticket,
      dtd: new_dtd
    }]);
  }
  simpleStore.push('ticket', {id: ticket.get('id'), dt_path: dt_path});
};

export default dtPathMunge;
