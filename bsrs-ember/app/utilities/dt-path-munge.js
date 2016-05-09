var dtPathMunge = function(ticket, dtd, simpleStore) {
  let dt_path = ticket.get('dt_path') || [];
  dt_path = dt_path.concat([{
    ticket: {
      id: ticket.get('id'),
      requester: ticket.get('requester'),
      location: ticket.get('location.id'),
      status: ticket.get('status.id'),
      priority: ticket.get('priority.id'),
      request: ticket.get('request'),
      categories: ticket.get('categories_ids'),
      cc: ticket.get('cc_ids'),
      attachments: ticket.get('attachment_ids')
    },
    dt: {
      id: dtd ? dtd.get('id') : undefined
    }
  }]);
  simpleStore.push('ticket', {id: ticket.get('id'), dt_path: dt_path});
};

export default dtPathMunge;
