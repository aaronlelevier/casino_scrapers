var dtPathMunge = function(ticket, dtd, simpleStore) {
  let dt_path = ticket.get('dt_path') || [];
  const dtd_ids = dt_path.mapBy('dtd.id');
  const indx = dtd_ids.indexOf(dtd.get('id'));
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
  };
  if (indx === 0) {
    dt_path[indx] = new_ticket;
    dt_path[indx] = new_dtd;
  } else {
    dt_path = dt_path.concat([{
      ticket: new_ticket,
      dtd: new_dtd
    }]);
  }
  simpleStore.push('ticket', {id: ticket.get('id'), dt_path: dt_path});
};

export default dtPathMunge;
