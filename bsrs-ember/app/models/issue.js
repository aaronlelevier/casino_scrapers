import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import { belongs_to, change_belongs_to } from 'bsrs-ember/utilities/belongs-to';

export default Ember.Object.extend({
    store: inject('main'),
    tags: belongs_to('issues', 'tag'),
    tag: Ember.computed.alias('tags.firstObject'),
    change_tag: change_belongs_to('issues', 'tag'),
});
