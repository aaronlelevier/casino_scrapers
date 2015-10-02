import random

from django.db import IntegrityError

from model_mommy import mommy

from accounting.models import Currency
from location.models import LocationLevel, Location
from category.models import Category
from location.tests.factory import create_locations
from person.models import Person, PersonStatus, Role
from utils import create


PASSWORD = '1234'
LOCATION_LEVEL = 'region'
CATEGORY = 'repair'

def create_role():
    "Single Role needed to create Person with Login privileges."

    currency = Currency.objects.default()
    location_level, created = LocationLevel.objects.get_or_create(name=LOCATION_LEVEL)
    categories = mommy.make(Category, _quantity=2)

    return mommy.make(Role, name=create._generate_chars(), location_level=location_level, categories=categories)


def create_roles():
    "Create a Role for each LocationLevel"

    categories = mommy.make(Category, _quantity=2)
    
    # initial Locations
    try:
        create_locations()
    except IntegrityError:
        pass

    for location_level in LocationLevel.objects.all():
        mommy.make(Role, name='{}-role'.format(location_level.name),
            location_level=location_level, categories=categories)

    return Role.objects.all()


def create_single_person(name=None, role=None):
    name = name or random.choice(create.LOREM_IPSUM_WORDS.split())
    role = role or create_role()

    try:
        return Person.objects.get(username=name)
    except Person.DoesNotExist:
        return Person.objects.create_user(name, 'myemail@mail.com', PASSWORD,
            first_name=name, last_name=name, title=name, role=role)


def update_login_person(person):
    person.set_password('1234')
    person.is_superuser = True
    person.is_staff = True
    person.save()


def create_person(username=None, role=None, _many=1):
    '''
    # TODO: Change this method name to ``create_people`` b/c can
        create more than 1!
        
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    role = role or create_role()

    # Single User Create
    if username and _many != 1:
        raise Exception(
            "Can't specify more than 1 user with a specific username. "
            "You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        return create_single_person(username, role)
        
    # Multiple User Create
    for i in range(_many):
        name = random.choice(create.LOREM_IPSUM_WORDS.split())
        user = create_single_person(name, role)
    
    return user


"""
Boilerplate create in shell code:

from person.tests.factory import create_all_people
create_all_people()
"""
def create_all_people():

    # initial Locations
    try:
        create_locations()
    except IntegrityError:
        pass

    # initial Roles
    roles = create_roles()

    # other Persons for Grid View
    names = sorted(create.LOREM_IPSUM_WORDS.split())
    for name in names:
        kwargs = {}
        for ea in ['username', 'first_name', 'last_name', 'title']:
            kwargs[ea] = name

        role = random.choice(roles)
        locations = Location.objects.filter(location_level=role.location_level)
        # create
        person = mommy.make(Person, role=role,locations=locations, **kwargs)
        person.set_password(PASSWORD)
        person.save()

    # Person used to Login (so needs a 'password' set here)
    aaron = Person.objects.get(username="aaron")
    update_login_person(aaron)
