from category.tests.factory import create_categories
from location.models import (
    Location, LocationLevel, LOCATION_COMPANY, LOCATION_REGION,
    LOCATION_DISTRICT, LOCATION_FMU, LOCATION_STORE)
from person.models import Role, Person
from person.tests.factory import grant_all_permissions


ROLE_ADMINISTRATOR = 'Administrator'
ROLE_REGION_MANAGER = 'Region Manager'
ROLE_DISTRICT_MANAGER = 'District Manager'
ROLE_FMU_MANAGER = 'Facilities Manager'
ROLE_STORE_MANAGER = 'Store Manager'


class TenantFixtures(object):
    """
    Create initial related records to the Tenant every time
    a new Tenant is added.
    """

    # New Tenants will start out with these LocationLevels
    LOCATION_LEVELS = [
        LOCATION_COMPANY,
        LOCATION_REGION,
        LOCATION_DISTRICT,
        LOCATION_STORE,
        LOCATION_FMU
    ]

    ROLES = [
        ROLE_ADMINISTRATOR,
        ROLE_REGION_MANAGER,
        ROLE_DISTRICT_MANAGER,
        ROLE_FMU_MANAGER,
        ROLE_STORE_MANAGER
    ]

    ROLE_LOCATION_LEVEL_MAP = {
        ROLE_ADMINISTRATOR: LOCATION_COMPANY,
        ROLE_REGION_MANAGER: LOCATION_REGION ,
        ROLE_DISTRICT_MANAGER: LOCATION_DISTRICT,
        ROLE_FMU_MANAGER: LOCATION_FMU,
        ROLE_STORE_MANAGER: LOCATION_STORE
    }

    def __init__(self, tenant):
        """
        :param tenant: Tenant instance
        """
        self.tenant = tenant

    def setUp(self):
        self._create_location_levels()
        self._create_roles()
        self._create_company_location()
        self._create_admin()
        self._create_categories()

    def _create_location_levels(self):
        for name in self.LOCATION_LEVELS:
            LocationLevel.objects.create(name=name, tenant=self.tenant)

    def _create_roles(self):
        for name in self.ROLES:
            location_level_name = self.ROLE_LOCATION_LEVEL_MAP[name]
            location_level = LocationLevel.objects.get(
                name=location_level_name, tenant=self.tenant)

            Role.objects.create(
                name=name,
                tenant=self.tenant,
                location_level=location_level
            )

    def _create_company_location(self):
        location_level = LocationLevel.objects.get(name=LOCATION_COMPANY, tenant=self.tenant)
        Location.objects.create(name=LOCATION_COMPANY, location_level=location_level)

    def _create_admin(self):
        role = Role.objects.get(name=ROLE_ADMINISTRATOR, tenant=self.tenant)

        admin = Person.objects.create(
            username=self.tenant.company_name,
            role=role,
            password=self.tenant.company_name,
            email=self.tenant.implementation_email.email
        )

        location_level = LocationLevel.objects.get(name=LOCATION_COMPANY, tenant=self.tenant)
        company_location = Location.objects.get(
                name=LOCATION_COMPANY, location_level=location_level)
        admin.locations.add(company_location)
        grant_all_permissions(admin)

    def _create_categories(self):
        categories = create_categories(tenant=self.tenant)
