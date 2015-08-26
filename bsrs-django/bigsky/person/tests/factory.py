import string
import random

from django.db import IntegrityError

from model_mommy import mommy

from accounting.models import Currency
from location.models import LocationLevel
from person.models import Person, PersonStatus, Role
from util import create


PASSWORD = '1234'


def create_role():
    currency = Currency.objects.default()
    location_level = mommy.make(LocationLevel)
    return mommy.make(Role, name=create._generate_chars(), location_level=location_level)


def create_single_person(username, role):
    return Person.objects.create_user(username, 'myemail@mail.com', PASSWORD,
        first_name=create._generate_chars(), role=role)


def create_person(username=None, _many=1):
    '''
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    role = create_role()

    # Single User Create
    if username and _many != 1:
        raise Exception("Can't specify more than 1 user with a specific username. \
You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        return create_single_person(username, role)
        
    # Multiple User Create
    for i in range(_many):
        username = ''.join([random.choice(string.ascii_letters) for x in range(10)])
        user = create_single_person(username, role)
    
    return user


def create_23_people():
    role = create_role()
    aaron = mommy.make(Person, username='aaron', role=role)
    aaron.set_password('1234')
    aaron.save()

    count = Person.objects.count()
    while count < 23:
        try:
            username = create.random_lorem(words=1)
            mommy.make(Person, username=username, first_name=username, role=role)
        except IntegrityError:
            pass
        count = Person.objects.count()