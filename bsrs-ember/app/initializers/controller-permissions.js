import Ember from 'ember';

const { Controller, inject, computed } = Ember;

export function initialize(/* application */) {
  Controller.reopen({
    personCurrent: inject.service(),
    permissions: computed.alias('personCurrent.permissions')
  });
}

export default {
  name: 'controller-permissions',
  initialize
};
