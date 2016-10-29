import Ember from 'ember';
import windowProxy from 'bsrs-ember/utilities/window-proxy';

export default function errorFunction(xhr/*, textStatus, errorThrown, message*/) {
  if (xhr.status === 403) {
    windowProxy.changeLocation('/login/');
  } 
}
