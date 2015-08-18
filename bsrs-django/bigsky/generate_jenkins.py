import os
import sys
from os.path import join, abspath, dirname

from django.db import IntegrityError

from model_mommy import mommy

from person.models import Person
from person.tests.factory import create_role
from util.create import random_lorem


def main():
    role = create_role()
    aaron = mommy.make(Person, username='aaron', role=role)
    aaron.set_password('1234')
    aaron.save()

    count = Person.objects.count()
    while count < 23:
        try:
            username = random_lorem(words=1)
            mommy.make(Person, username=username, first_name=username, role=role)
        except IntegrityError:
            pass
        count = Person.objects.count()

if __name__ == '__main__':
    sys.path.append(abspath(join(dirname(dirname(__file__)))))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings.ci")
    main()
