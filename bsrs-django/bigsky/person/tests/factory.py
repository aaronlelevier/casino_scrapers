import string
import random

from django.db import IntegrityError

from model_mommy import mommy

from accounting.models import Currency
from location.models import LocationLevel, Location
from location.tests.factory import create_locations
from person.models import Person, PersonStatus, Role
from util import create


PASSWORD = '1234'
LOCATION_LEVEL = 'region'

def create_role():
    "Single Role needed to create Person with Login privileges."

    currency = Currency.objects.default()

    try:
        location_level = LocationLevel.objects.get(name=LOCATION_LEVEL)
    except LocationLevel.DoesNotExist:
        location_level = mommy.make(LocationLevel, name=LOCATION_LEVEL)

    return mommy.make(Role, name=create._generate_chars(), location_level=location_level)


def create_roles():
    "Create a Role for each LocationLevel"
    # initial Locations
    try:
        create_locations()
    except IntegrityError:
        pass

    for location_level in LocationLevel.objects.all():
        mommy.make(Role, name='{}-role'.format(location_level.name),
            location_level=location_level)

    return Role.objects.all()


def create_single_person(username, role):
    return Person.objects.create_user(username, 'myemail@mail.com', PASSWORD,
        first_name=create._generate_chars(), role=role)


def update_login_person():
    aaron = Person.objects.get(username='aaron')
    aaron.set_password('1234')
    aaron.save()


def create_person(username=None, _many=1):
    '''
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    role = create_role()

    # Single User Create
    if username and _many != 1:
        raise Exception(
            "Can't specify more than 1 user with a specific username. "
            "You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        return create_single_person(username, role)
        
    # Multiple User Create
    for i in range(_many):
        username = ''.join([random.choice(string.ascii_letters) for x in range(10)])
        user = create_single_person(username, role)
    
    return user


def create_23_people():
    # initial Locations
    try:
        create_locations()
    except IntegrityError:
        pass

    # initial Roles
    roles = create_roles()

    # Person used to Login (so needs a 'password' set here)
    aaron = mommy.make(Person, username='aaron', role=roles[0])
    aaron.set_password('1234')
    aaron.save()

    # other Persons for Grid View
    count = Person.objects.count()
    while count < 23:
        try:
            username = create.random_lorem(words=1)
            role = random.choice(roles)
            locations = Location.objects.filter(location_level=role.location_level)
            mommy.make(Person, username=username, first_name=username, role=role,
                locations=locations)
        except IntegrityError:
            pass
        count = Person.objects.count()