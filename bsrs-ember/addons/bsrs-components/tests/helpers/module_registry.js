import Resolver from 'ember-resolver';
import Store from 'ember-cli-simple-store/store';

export default function(container, registry, keys) {
  var resolver = Resolver.create({namespace: {modulePrefix: 'dummy'}});
  registry.register('service:simpleStore', Store);
  keys.forEach(function(key) {
    var factory = resolver.resolve('dummy@' + key);
    registry.register(key, factory);
  });
  return container.lookup('service:simpleStore');
}
