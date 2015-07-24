import Ember from 'ember';
import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

//global monkey patch to ensure random values are predictible
Ember.uuid = function() { return 'abc123'; };

setResolver(resolver);
