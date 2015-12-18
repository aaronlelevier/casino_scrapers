import random

from django.conf import settings

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests.factory import create_single_category
from location.models import LocationLevel, Location
from location.tests.factory import create_location, create_locations
from person.models import Person, Role
from utils import create
from utils.helpers import generate_uuid


PASSWORD = '1234'
LOCATION_LEVEL = 'region'
CATEGORY = 'repair'


class DistrictManager(object):
    
    def __init__(self, *args, **kwargs):
        repair = Category.objects.create(name="Repair", subcategory_label="trade")

        self.location_level, _ = LocationLevel.objects.get_or_create(name='district')
        self.role = create_role('district-manager', self.location_level, category=repair)
        self.location = Location.objects.create(location_level=self.location_level,
                                                name='district-1', number='district-1')
        self.person = create_single_person('district-manager-1', self.role, self.location)        


def create_role(name=None, location_level=None, category=None):
    """
    Single Role needed to create Person with Login privileges.
    """
    name = name or create._generate_chars()
    category = category or create_single_category(create._generate_chars())

    Currency.objects.default()

    if not location_level:
        location_level, _ = LocationLevel.objects.get_or_create(name=LOCATION_LEVEL)

    role = mommy.make(Role, name=name, location_level=location_level)
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

def create_single_person(name=None, role=None, location=None):
    name = name or random.choice(create.LOREM_IPSUM_WORDS.split())
    role = role or create_role()
    location = location or create_location(location_level=role.location_level)

    incr = Person.objects.count()
    id = generate_uuid(PERSON_BASE_ID, incr+1)

    try:
        person = Person.objects.get(username=name)
    except Person.DoesNotExist:
        person = Person.objects.create_user(
            id=id,
            username=name,
            email='myemail@mail.com',
            password=PASSWORD,
            first_name=name,
            last_name=name,
            title=name,
            role=role
        )

    person.locations.add(location)

    return person


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
        location = random.choice(locations)
        # create
        create_single_person(name=name, role=role, location=location)

    # Person used to Login (so needs a 'password' set here)
    aaron = Person.objects.get(username="aaron")
    update_login_person(aaron)
