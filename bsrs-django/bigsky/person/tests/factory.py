import random

from django.conf import settings
from django.core.exceptions import ValidationError

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests.factory import create_single_category, create_repair_category
from generic.tests.factory import create_image_attachment
from location.models import (LocationLevel, Location, LocationStatus, LocationType,
    LOCATION_COMPANY, LOCATION_DISTRICT, LOCATION_REGION,)
from location.tests.factory import (
    create_location, create_locations, create_location_level, create_location_levels)
from person.helpers import PermissionInfo
from person.models import Role, Person, PersonStatus
from tenant.tests.factory import get_or_create_tenant
from translation.tests.factory import create_locale, LOCALES
from translation.models import Locale
from utils import create
from utils.fake_data import person_names
from utils.helpers import generate_uuid


PASSWORD = 'tangobravo'
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
    category = category or create_single_category()

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

    if name:
        if isinstance(name, tuple):
            first_name, middle_initial, last_name = name
        else:
            first_name = name
            middle_initial = name[:1]
            last_name = name
    else:
        first_name, middle_initial, last_name = random.choice(person_names.ALL)

    role = role or create_role()
    status = status or create_person_status(random.choice(PERSON_STATUSES))
    location = location or create_location(location_level=role.location_level)
    locale = locale or Locale.objects.first() or create_locale(random.choice(LOCALES))

    id = generate_uuid(Person)

    try:
        person = Person.objects.get(username=first_name)
    except Person.DoesNotExist:
        person = Person.objects.create_user(
            id=id,
            username=first_name,
            password=PASSWORD,
            first_name=first_name,
            middle_initial=middle_initial,
            last_name=last_name,
            title=role.name if '-' not in role.name else role.name.split('-')[0],
            role=role,
            status=status,
            locale=locale,
            employee_id=create._generate_ph(),
            photo=create_image_attachment()
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
    grant_all_permissions(person)


def grant_all_permissions(person):
    perm_info = PermissionInfo()
    perm_info.setUp()
    perms = perm_info.all()
    person.role.group.permissions.set([p for p in perms])


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
    names = sorted(person_names.ALL)
    for name in names:
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
