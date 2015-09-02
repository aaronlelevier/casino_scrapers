### README for Combined Project

Refer to separate README's for `Ember` + `Django`

- [bsrs-ember/README.md](https://github.com/bigskytech/bsrs/blob/master/bsrs-ember/README.md)
- [bsrs-django/README.md](https://github.com/bigskytech/bsrs/blob/master/bsrs-django/README.md)

To run the continuous integration script like jenkins

```
  bash ci.sh
```

The following dependencies are required to run the build script

```
  git
  nodejs v0.12+
  npm v2.10+
  bower v1.4+
  postgresql
  python v2.7.6+
  pip
  virtualenv
  firefox 38+
  Xcode 6.4+ (homebrew requirement)
```

If you need to provision a macbook pro checkout this installer

https://github.com/toranb/osx-workstation/blob/master/installer


### Jenkins Ports

* 8000 - Python 2 - deploy.sh
* 8002 - Python 2 - persistent.sh
* 8003 - Python 3 - deploy.sh (on python3 branch)