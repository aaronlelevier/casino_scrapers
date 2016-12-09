import Ember from 'ember';
const { run } = Ember;
import Resolver from 'ember-resolver';
import Store from 'ember-cli-simple-store/store';

export default function(container, registry, keys = []) {
  const resolver = Resolver.create({namespace: {modulePrefix: 'bsrs-ember'}});
  const store = resolver.resolve('service:functional-store');
  registry.register('service:functional-store', store);
  registry.register('service:simpleStore', Store);
  keys.forEach((key) => {
    const factory = resolver.resolve('bsrs-ember@' + key);
    registry.register(key, factory);
  });
  return container.lookup('service:simpleStore');
}
