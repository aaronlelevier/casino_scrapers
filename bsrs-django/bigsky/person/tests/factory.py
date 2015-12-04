import random

from django.conf import settings
from django.db import IntegrityError

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from location.models import LocationLevel, Location
from location.tests.factory import create_locations
from person.models import Person, Role
from utils import create
from utils.helpers import generate_uuid


PASSWORD = '1234'
LOCATION_LEVEL = 'region'
CATEGORY = 'repair'


def create_role(name=None, location_level=None):
    """
    Single Role needed to create Person with Login privileges.
    """
    name = name or create._generate_chars()

    Currency.objects.default()

    if not location_level:
        location_level, _ = LocationLevel.objects.get_or_create(name=LOCATION_LEVEL)

    category = Category.objects.first()

    role = mommy.make(Role, name=name, location_level=location_level)
    if category:
        role.categories.add(category)

    return role


def create_roles():
    "Create a Role for each LocationLevel"

    category = Category.objects.first()
    
    if not Location.objects.first():
        create_locations()

    for location_level in LocationLevel.objects.all():
        if location_level.name != settings.DEFAULT_LOCATION_LEVEL:
            role = mommy.make(Role, name='{}-role'.format(location_level.name),
                location_level=location_level)
        else:
            role = mommy.make(Role, name=settings.DEFAULT_ROLE, location_level=location_level)

        if category:
            role.categories.add(category)

    return Role.objects.all()


PERSON_BASE_ID = "30f530c4-ce6c-4724-9cfd-37a16e787"

def create_single_person(name=None, role=None):
    name = name or random.choice(create.LOREM_IPSUM_WORDS.split())
    role = role or create_role()

    incr = Person.objects.count()
    id = generate_uuid(PERSON_BASE_ID, incr+1)

    try:
        return Person.objects.get(username=name)
    except Person.DoesNotExist:
        return Person.objects.create_user(
            id=id,
            username=name,
            email='myemail@mail.com',
            password=PASSWORD,
            first_name=name,
            last_name=name,
            title=name,
            role=role
        )


def update_login_person(person):
    person.is_superuser = True
    person.is_staff = True
    person.save()


def create_person(username=None, role=None, _many=1):
    '''
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

    if not Location.objects.first():
        create_locations()

    # initial Roles
    create_roles()
    roles = Role.objects.all()

    # other Persons for Grid View
    names = sorted(create.LOREM_IPSUM_WORDS.split())
    for name in names:
        kwargs = {}
        for ea in ['username', 'first_name', 'last_name', 'title']:
            kwargs[ea] = name

        role = random.choice(roles)
        locations = Location.objects.filter(location_level=role.location_level)
        # create
        person = create_single_person(name=name, role=role)
        person.locations.add(*locations)
        person.save()        

    # Person used to Login (so needs a 'password' set here)
    aaron = Person.objects.get(username="aaron")
    update_login_person(aaron)
