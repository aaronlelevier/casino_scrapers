import Base from 'bsrs-ember/components/mobile/base';
import injectRepo from 'bsrs-ember/utilities/inject';

export default Base.extend({
  personRepo: injectRepo('person'),
});