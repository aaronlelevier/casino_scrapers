var dtPathMunge = function(ticket, dtd, fieldsObj, simpleStore) {
  let dt_path = ticket.get('dt_path') || [];
  const dtd_ids = dt_path.mapBy('dtd.id');
  const indx = dtd_ids.indexOf(dtd.get('id'));
  // build fields array && build options array
  let fields = [];
  for (let obj of fieldsObj) {
    fields.push({id: obj[0], value: obj[1].value});
    //options id array that is used on init to set isChecked property.  presence of id indicates the value is checked
    if (obj.optionValues) {
      fields['options'] =  obj.optionValues;
    }
  }
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
  if (indx === 0) {
    // if modifying existing dt_path obj
    dt_path[indx] = {ticket: {}, dtd: {}};
    dt_path[indx]['ticket'] = new_ticket;
    dt_path[indx]['dtd'] = new_dtd;
  } else {
    dt_path = dt_path.concat([{
      ticket: new_ticket,
      dtd: new_dtd
    }]);
  }
  simpleStore.push('ticket', {id: ticket.get('id'), dt_path: dt_path});
};

export default dtPathMunge;
