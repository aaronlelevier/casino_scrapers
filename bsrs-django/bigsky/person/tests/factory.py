import random

from django.conf import settings
from django.core.exceptions import ValidationError

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category, CategoryStatus
from category.tests.factory import create_single_category, create_repair_category
from location.models import (LocationLevel, Location, LocationStatus, LocationType,
    LOCATION_COMPANY, LOCATION_DISTRICT, LOCATION_REGION,)
from location.tests.factory import (
    create_location, create_locations, create_location_level, create_location_levels)
from person.models import Role, Person, PersonStatus
from tenant.tests.factory import get_or_create_tenant
from translation.tests.factory import create_locale, LOCALES
from translation.models import Locale
from utils import create
from utils.helpers import generate_uuid


PASSWORD = '1234'
PERSON_STATUSES = [
    'admin.person.status.active',
    'admin.person.status.inactive',
    'admin.person.status.expired',
]


class DistrictManager(object):

    def __init__(self, *args, **kwargs):
        self.repair = create_repair_category()

        self.location_level = create_location_level(LOCATION_DISTRICT)
        self.role = create_role('district-manager', self.location_level, category=self.repair)

        LocationStatus.objects.get_or_create(name=LocationStatus.default)
        LocationType.objects.get_or_create(name=LocationType.default)
        self.location = Location.objects.create(location_level=self.location_level,
                                                name='district-1', number='district-1')

        self.person = create_single_person('district-manager-1', self.role, self.location)


def create_role(name=None, location_level=None, category=None):
    """
    Single Role needed to create Person with Login privileges.
    """
    name = name or create._generate_chars()
    category = category or create_single_category(create._generate_chars())

    # system default models needed
    currency = Currency.objects.default()

    if not location_level:
        location_level = create_location_level(LOCATION_REGION)

    tenant = location_level.tenant

    try:
        role = Role.objects.get(name=name)
    except Role.DoesNotExist:
        role = mommy.make(Role, tenant=tenant, name=name, location_level=location_level)

    role.categories.add(category)

    return role


def create_roles():
    "Create a Role for each LocationLevel"

    category = Category.objects.first()

    if not LocationLevel.objects.first():
        create_location_levels()

    for location_level in LocationLevel.objects.all():

        if location_level.name == settings.DEFAULT_LOCATION_LEVEL:
            name = settings.DEFAULT_ROLE
        else:
            name = '{}-role'.format(location_level.name)

        try:
            role = Role.objects.get(name=name, location_level=location_level)
        except Role.DoesNotExist:
            tenant = get_or_create_tenant()
            role = mommy.make(Role, tenant=tenant, name=name, location_level=location_level)
            if category:
                role.categories.add(category)

    return Role.objects.all()


def create_single_person(name=None, role=None, location=None, status=None, locale=None):
    args_required_together = [role, location]
    if not all(args_required_together) and any(args_required_together):
        raise ValidationError("These arguments must all be passed together")

    name = name or random.choice(create.LOREM_IPSUM_WORDS.split())
    role = role or create_role()
    status = status or create_person_status(random.choice(PERSON_STATUSES))
    location = location or create_location(location_level=role.location_level)
    locale = locale or Locale.objects.first() or create_locale(random.choice(LOCALES))

    # incr = Person.objects.count()
    id = generate_uuid(Person)

    try:
        person = Person.objects.get(username=name)
    except Person.DoesNotExist:
        person = Person.objects.create_user(
            id=id,
            username=name,
            password=PASSWORD,
            first_name=name,
            last_name=name,
            title=name,
            role=role,
            status=status,
            locale=locale,
            employee_id=create._generate_ph()
        )
        person.locations.add(location)

    return person


def create_person(username=None, _many=1):
    '''
    Create all ``Person`` objects using this function.  ( Not mommy.make(<object>) )

    Return: the last user created from the `forloop`
    '''
    # role = role or create_role()

    # Single User Create
    if username and _many != 1:
        raise Exception(
            "Can't specify more than 1 user with a specific username. "
            "You specified {} user(s) with username: {}".format(_many, username))
    elif username:
        return create_single_person(username)

    # Multiple User Create
    for i in range(_many):
        username = random.choice(create.LOREM_IPSUM_WORDS.split())
        user = create_single_person(username)

    return user


def update_login_person(person, new_password=None):
    """
    Will allow 'person' to login to Django admin.
    """
    person.is_superuser = True
    person.is_staff = True
    if new_password:
        person.set_password(new_password)
    person.save()


def update_admin(person):
    """
    Update the Person with all Locations where:
    ``location.location_level == person.role.location_level``
    And all Parent Categories, so they can view all Tickets.
    """
    update_login_person(person)
    add_top_level_location(person)
    remove_any_categories(person)
    update_locale(person)


def update_locale(person):
    person.locale = Locale.objects.get(locale='en')
    person.save()


def remove_any_categories(person):
    for c in person.role.categories.all():
        person.role.categories.remove(c)


def add_top_level_location(person):
    """
    `person.Role.location_level` must match `Location.location_level`
    """
    remove_all_locations(person)

    location = Location.objects.create_top_level()
    person.role = Role.objects.get(location_level__name=settings.DEFAULT_LOCATION_LEVEL)
    person.save()

    person.locations.add(location)


def remove_all_locations(person):
    for x in person.locations.all():
        person.locations.remove(x)


def create_all_people():
    if not Location.objects.filter(name=LOCATION_COMPANY):
        create_locations()

    # initial Roles
    create_roles()

    # other Persons for Grid View
    names = sorted(create.LOREM_IPSUM_WORDS.split())
    for name in names:
        kwargs = {}
        for ea in ['username', 'first_name', 'last_name', 'title']:
            kwargs[ea] = name

        location = Location.objects.order_by("?")[0]
        status = PersonStatus.objects.order_by("?")[0]
        role = Role.objects.filter(location_level=location.location_level).order_by("?")[0]
        # create
        person = create_single_person(name=name, role=role, location=location, status=status)

    # # Update Persons to login as
    person = Person.objects.get(username='admin')
    update_admin(person)


def create_person_status(name=None):
    id = generate_uuid(PersonStatus)
    if not name:
        name = random.choice(PERSON_STATUSES)
    try:
        obj = PersonStatus.objects.get(name=name)
    except PersonStatus.DoesNotExist:
        obj = PersonStatus.objects.create(id=id, name=name)
    return obj


def create_person_statuses():
    return [create_person_status(s) for s in PERSON_STATUSES]
