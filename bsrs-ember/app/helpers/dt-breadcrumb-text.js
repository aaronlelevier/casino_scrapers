import Ember from 'ember';

export function dtBreadcrumbText(params) {
  const dt = params[0];
  if (dt) {
    if (dt.description) {
      return dt.description.substring(0,12);
    } else if (dt.prompt) {
      return dt.prompt.substring(0,12);
    } else if (dt.note) {
      return dt.note.substring(0,12);
    }
  }
}

export default Ember.Helper.helper(dtBreadcrumbText);
