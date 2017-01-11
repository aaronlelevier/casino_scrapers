from django.conf import settings
from django.contrib.auth.models import Permission

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.tests.factory import create_single_category
from location.models import Location, LocationLevel
from location.tests.factory import create_location_level
from person.helpers import PermissionInfo
from person.tests.factory import PASSWORD, create_person
from provider.tests.factory import create_provider
from ticket.models import Ticket
from utils.permissions import CrudPermissions


class CrudPermissionsTests(APITestCase):

    def setUp(self):
        super(CrudPermissionsTests, self).setUp()

        self.person = create_person()
        self.trade = create_single_category()

        PermissionInfo().setUp()
        self.location = mommy.make(Location)
        self.location_level = create_location_level()
        self.role = self.person.role
        self.ticket = mommy.make(Ticket)
        self.provider = create_provider(create_single_category())

        self.RESOUCE_MAP = {
            'category': ('admin/categories', self.trade.id),
            'location': ('admin/locations', self.location.id),
            'locationlevel': ('admin/location-levels', self.location_level.id),
            'person': ('admin/people', self.person.id),
            'provider': ('providers', self.provider.id),
            'role': ('admin/roles', self.role.id),
            'ticket': ('tickets', self.ticket.id)
        }

        self.METHOD_MAP = {
            'post': False,
            'put': True,
            'delete': True,
            'get': False
        }

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(CrudPermissionsTests, self).tearDown()
        self.client.logout()

    def test_exception_handler(self):
        self.assertEqual(
            settings.REST_FRAMEWORK['EXCEPTION_HANDLER'],
            'utils.permissions.exception_handler'
        )

    def test_perm_map(self):
        self.assertEqual(CrudPermissions.PERM_MAP['GET'], 'view')
        self.assertEqual(CrudPermissions.PERM_MAP['POST'], 'add')
        self.assertEqual(CrudPermissions.PERM_MAP['PUT'], 'change')
        self.assertEqual(CrudPermissions.PERM_MAP['DELETE'], 'delete')

    def test_not_authenticated(self):
        self.client.logout()
        for k,v in self.RESOUCE_MAP.items():
            sub_url, _ = v
            response = self.client.get('/api/{}/'.format(sub_url))
            self.assertEqual(response.status_code, 403,
                             '{} response != 403'.format(sub_url))

    def test_can_all(self):
        for codename in PermissionInfo.CODENAMES:
            self._add_perm(codename)
            self.assertIn(codename, self.person.permissions)

            method, model, response = self._access_resource(codename)

            self.assertNotEqual(response.status_code, 404,
                             "{} request for {} failed".format(method, model))

    def test_cant_all(self):
        for codename in PermissionInfo.CODENAMES:
            self.assertNotIn(codename, self.person.permissions)

            method, model, response = self._access_resource(codename)

            self.assertEqual(response.status_code, 404,
                             "{} request for {} failed".format(method, model))

    def _add_perm(self, codename):
        perm = Permission.objects.get(codename=codename)
        self.person.role.group.permissions.add(perm)

    def _access_resource(self, codename):
        # add, category
        perm, model = codename.split('_')
        # categories, self.trade.id
        sub_url, resource_id = self.RESOUCE_MAP[model]
        # 'post' - method was 'add' - was 'POST' but .lower() called
        idx = list(CrudPermissions.PERM_MAP.values()).index(perm)
        method = list(CrudPermissions.PERM_MAP.keys())[idx].lower()
        request_method = getattr(self.client, method)

        is_single = self.METHOD_MAP[method]

        if is_single:
            response = request_method('/api/{}/{}/'.format(
                sub_url, resource_id), {}, format='json')
        else:
            response = request_method('/api/{}/'.format(
                sub_url), {}, format='json')

        return (method, model, response)
