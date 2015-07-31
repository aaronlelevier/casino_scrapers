import resolver from './helpers/resolver';
import random from 'bsrs-ember/models/random';
import {
  setResolver
} from 'ember-qunit';

//global monkey patch to ensure random values are predictible
random.uuid = function() { return 'abc123'; };

setResolver(resolver);
