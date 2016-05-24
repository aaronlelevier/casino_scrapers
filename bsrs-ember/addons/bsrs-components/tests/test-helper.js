import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

setResolver(resolver);

import Ember from 'ember';
Ember.MODEL_FACTORY_INJECTIONS = true;
