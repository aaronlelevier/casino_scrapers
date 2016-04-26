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
  nodejs v4.1+
  npm v2.14+
  bower v1.6+
  postgresql v9.4
  python v3.4
  pip v7.1+
  virtualenv v13.1+
  firefox 42+
  Xcode 7.1+ (homebrew requirement)
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

#### Naming conventions of `<fixtures.json>`

Follow the same naming convention for outputting the fixture.
  - A whole app should be `fixtures/<app_name>.json`
  - example: `fixtures/person.json`

For a single Model in an App, it should also follow same naming convention for outputting the fixture.
  - A single model should be `fixtures/<app_name.Model_name>.json`
  - example: `fixtures/person.Role.json`

#### Fixture Generation

Follow these two conventions:

A. If no dependencies, can generate as normal.

B. If has Foreign Keys to other Fixtures, then these need to be statically generated using the above function, so they are predictable, and won't cause any duplicate key errrors.


#### Regenerating Fixtures

Run `bash repopulate_jenkins_json.sh` to regenerate fixtures.

Then, to **test**, run `bash build_project.sh`.  This will do the same fixture upload that is done in the `deploy.sh` script, so if this works, then then `deploy.sh` will work.


#### Import Fixtures Notes
##### TRANSLATION
1. Output "en" document on [Google Drive](https://drive.google.com/drive/folders/0B7dl5Hhfqk0NfkZWUndwVEFzR2RhTUNPRnFRcVA1UVNWTEUxUEFyaU5ZSVpFeHBFMUZBeTg)
2. export to CSV and put in the file in `bsrs/bsrs-django/bigsky/media/translation` folder
3. ipython notebook or shell_plus and execute:

python commands

```python
from translation.models import Translation
Translation.objects.import_csv('en')
```

bash commands
```
rm -rf translation.json
./manage.py dumpdata translation --indent=2 > fixtures/translation.json
```

##### LOCATION
1. Open repopulate_jenkins_json.sh and comment out loaddata of fixtures/location.json
2. run bash repopulate_jenkins_json.sh
3. ./manage.py dumpdata location --indent=2 > fixtures/watt.json
4. Remove location.states and copy into location.State.json
5. uncomment out loaddata of fixtures/location.json and run bash repopulate_jenkins_json.sh

##### CATEGORY
1. run bash repopulate_jenkins_json.sh
2. go into shell_plus and do Category.objects.all().delete() and then run create_categories function
3. ./manage.py dumpdata category --indent=2 > fixtures/watt.json
4. Remove copy watt.json into category.json

#### Anti-Patterns
1. Write code as if the person who has to maintain it is a psycopath that know where you live.  This means, DONT write code without tests.
2. Blocking behavior that is rarely truthy.
3. Pushing code that you aren't confident in.  Always ask for a code review.  Nobody cares how many times your are pushing or what you are pushing.  They do care if they have to fix your commits.
4. Putting off refactors that have the possibility of impacting the team in the near future; including bugs, longer development timelines, ect.
5. Adding ad hoc code to the codebase just to get it in there.  Might as well be dead code.
6. Duplicating the same code.  Components are meant to provide reusability and a specified api.
7. Adding complicated logic w/o a test comment including a description, params, and if necessary why. 
8. Long functions are a sign that splitting up the function might remove bugs and improve understanding.
9. Model instances are mean for data.  Components are meant as a presentational layer. Thus don't include presentational logic in the model
