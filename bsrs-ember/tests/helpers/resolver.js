import Resolver from 'ember/resolver';
import config from 'bsrs-ember/config/environment'; 

var resolver = Resolver.create();

resolver.namespace = {
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix
};

export default resolver;
