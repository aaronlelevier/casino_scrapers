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

| Port | Build      | Service |
| ---- | ---------- | ------- |
| 8007 | Deploy     | Nginx   |
| 8008 | Persistent | Nginx   |


### Fixture Data

Fixture data should be predictable.  If Fixtures are going to be dynamically generated, then they need to have **static** UUIDs using this function: [generate_uuid](https://github.com/bigskytech/bsrs/blob/master/bsrs-django/bigsky/utils/helpers.py).

##### Naming conventions of `<fixtures.json>`

Follow the same naming convention for outputting the fixture.
  - A whole app should be `fixtures/<app_name>.json`
  - example: `fixtures/person.json`

For a single Model in an App, it should also follow same naming convention for outputting the fixture.
  - A single model should be `fixtures/<app_name.Model_name>.json`
  - example: `fixtures/person.Role.json`

##### Fixture Generation

Follow these two conventions:

A. If no dependencies, can generate as normal.

B. If has Foreign Keys to other Fixtures, then these need to be statically generated using the above function, so they are predictable, and won't cause any duplicate key errrors.
