from mock import patch

from django.test import TestCase

from category.models import Category
from location.models import (
    Location, LocationLevel, LOCATION_COMPANY, LOCATION_REGION,
    LOCATION_DISTRICT, LOCATION_FMU, LOCATION_STORE)
from person.models import Role, Person
from tenant.helpers import (
    TenantFixtures, ROLE_ADMINISTRATOR, ROLE_REGION_MANAGER, ROLE_DISTRICT_MANAGER,
    ROLE_FMU_MANAGER, ROLE_STORE_MANAGER)
from tenant.tests.factory import get_or_create_tenant
from utils.create import _generate_chars


class TenantFixturesTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()
        self.init_fixtures = TenantFixtures(self.tenant)

    def test_static__location_levels(self):
        raw_ret = [
            LOCATION_COMPANY,
            LOCATION_REGION,
            LOCATION_DISTRICT,
            LOCATION_STORE,
            LOCATION_FMU
        ]

        self.assertEqual(
            sorted(TenantFixtures.LOCATION_LEVELS),
            sorted(raw_ret)
        )

    def test_static__roles(self):
        raw_ret = [
            ROLE_ADMINISTRATOR,
            ROLE_REGION_MANAGER,
            ROLE_DISTRICT_MANAGER,
            ROLE_FMU_MANAGER,
            ROLE_STORE_MANAGER
        ]

        self.assertEqual(
            sorted(TenantFixtures.ROLES),
            sorted(raw_ret)
        )

    @patch("tenant.helpers.TenantFixtures._create_categories")
    @patch("tenant.helpers.TenantFixtures._create_admin")
    @patch("tenant.helpers.TenantFixtures._create_company_location")
    @patch("tenant.helpers.TenantFixtures._create_roles")
    @patch("tenant.helpers.TenantFixtures._create_location_levels")
    def test_setUp(self,
                   mock_create_location_levels,
                   mock_create_roles,
                   mock_create_company_location,
                   mock_create_admin,
                   mock_create_categories):

        self.init_fixtures.setUp()

        self.assertTrue(mock_create_location_levels.called)
        self.assertTrue(mock_create_roles.called)
        self.assertTrue(mock_create_company_location.called)
        self.assertTrue(mock_create_admin.called)
        self.assertTrue(mock_create_categories.called)

    def test_create_location_levels(self):
        self.assertEqual(
            LocationLevel.objects.filter(tenant=self.tenant).count(), 0)

        self.init_fixtures._create_location_levels()

        self.assertEqual(
            LocationLevel.objects.filter(tenant=self.tenant).count(), 5)
        for level in LocationLevel.objects.filter(tenant=self.tenant):
            self.assertIn(level.name, TenantFixtures.LOCATION_LEVELS)
            self.assertEqual(level.tenant, self.tenant)

    def test_create_roles(self):
        self.init_fixtures._create_location_levels()
        self.assertEqual(
            Role.objects.filter(tenant=self.tenant).count(), 0)

        self.init_fixtures._create_roles()

        self.assertEqual(
            Role.objects.filter(tenant=self.tenant).count(), 5)
        for role in Role.objects.filter(tenant=self.tenant):
            self.assertIn(role.name, TenantFixtures.ROLES)
            self.assertEqual(role.tenant, self.tenant)
            self.assertEqual(
                role.location_level.name,
                TenantFixtures.ROLE_LOCATION_LEVEL_MAP[role.name]
            )

    def test_create_company_location(self):
        self.init_fixtures._create_location_levels()
        location_level = LocationLevel.objects.get(name=LOCATION_COMPANY, tenant=self.tenant)
        self.assertEqual(
            Location.objects.filter(name=LOCATION_COMPANY,
                                    location_level=location_level).count(), 0)

        self.init_fixtures._create_company_location()

        self.assertIsInstance(
            Location.objects.get(name=LOCATION_COMPANY,
                                 location_level=location_level),
            Location
        )

    def test_create_admin(self):
        self.init_fixtures._create_location_levels()
        self.init_fixtures._create_roles()
        self.init_fixtures._create_company_location()
        location_level = LocationLevel.objects.get(name=LOCATION_COMPANY, tenant=self.tenant)
        self.assertFalse(
            Person.objects.filter(username=self.tenant.company_name,
                                  role__tenant=self.tenant).exists())

        self.init_fixtures._create_admin()

        admin = Person.objects.get(username=self.tenant.company_name,
                                   role__tenant=self.tenant)
        self.assertEqual(admin.email, self.tenant.implementation_email.email)
        self.assertIn(
            Location.objects.get(
                name=LOCATION_COMPANY, location_level=location_level),
            admin.locations.all()
        )
        self.assertEqual(
            admin.role,
            Role.objects.get(name=ROLE_ADMINISTRATOR, tenant=self.tenant)
        )
        self.assertEqual(len(admin.role.permissions), 25)

    def test_create_categories(self):
        self.assertEqual(Category.objects.filter(tenant=self.tenant).count(), 0)

        self.init_fixtures._create_categories()

        self.assertEqual(Category.objects.filter(tenant=self.tenant).count(), 65)

    def test_create_for_multiple_tenants(self):
        # confirms that there are no conflicts w/ unique name constraints
        # on columns, even though they're Tenant specific, etc...
        company_name_existing = _generate_chars()
        tenant_existing = get_or_create_tenant(company_name=company_name_existing)
        TenantFixtures(tenant_existing).setUp()
        # new Tenant
        company_name = _generate_chars()
        tenant = get_or_create_tenant(company_name=company_name)

        TenantFixtures(tenant).setUp()

        self.assertEqual(LocationLevel.objects.filter(tenant=tenant).count(), 5)
        self.assertEqual(Role.objects.filter(tenant=tenant).count(), 5)
        self.assertTrue(
            Location.objects.filter(name=LOCATION_COMPANY,
                                    location_level__tenant=tenant).count(), 1)
        self.assertEqual(
            Person.objects.filter(username=company_name,
                                  role__tenant=tenant).count(), 1)
        self.assertEqual(Category.objects.filter(tenant=tenant).count(), 65)
