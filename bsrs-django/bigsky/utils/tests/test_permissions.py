from django.conf import settings
from django.contrib.auth.models import ContentType, Permission
from django.db import models
from django.test import TestCase

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.tests.factory import create_single_category
from location.models import Location, LocationLevel
from location.tests.factory import create_location
from person.tests.factory import PASSWORD, create_person
from provider.tests.factory import create_provider
from ticket.models import Ticket
from ticket.tests.factory import create_ticket
from utils.permissions import CrudPermissions, PermissionInfo
from work_order.tests.factory import create_work_order


class CrudPermissionsTests(APITestCase):

    def setUp(self):
        super(CrudPermissionsTests, self).setUp()

        self.person = create_person()
        self.trade = create_single_category()

        PermissionInfo().setUp()
        self.location = create_location()
        self.location_level = self.location.location_level
        self.role = self.person.role
        self.provider = create_provider(create_single_category())
        self.ticket = create_ticket()
        self.work_order = create_work_order()

        self.RESOUCE_MAP = {
            'category': ('admin/categories', self.trade.id),
            'location': ('admin/locations', self.location.id),
            'locationlevel': ('admin/location-levels', self.location_level.id),
            'person': ('admin/people', self.person.id),
            'provider': ('providers', self.provider.id),
            'role': ('admin/roles', self.role.id),
            'ticket': ('tickets', self.ticket.id),
            'workorder': ('work-orders', self.work_order.id)
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


class PermissionInfoTests(TestCase):

    def test_codenames(self):
        for p in PermissionInfo.PERMS:
            for m in PermissionInfo.MODELS:
                self.assertIn('{}_{}'.format(p, m),
                              PermissionInfo.CODENAMES)

    def test_all_defaults(self):
        raw_ret = {}
        for m in PermissionInfo.MODELS:
            for p in PermissionInfo.PERMS:
                raw_ret["{}_{}".format(p, m)] = False
        raw_ret['view_provider'] = False

        ret = PermissionInfo.ALL_DEFAULTS

        self.assertIsInstance(ret, dict)
        self.assertEqual(len(ret), 29, '29 possible permissions')
        for k,v in ret.items():
            self.assertFalse(v)
            self.assertEqual(v, raw_ret[k])

    def test_setUp(self):
        perm_info = PermissionInfo()

        self.assertEqual(
            Permission.objects.filter(codename__startswith='view_').count(), 0)

        perm_info.setUp()

        ret = perm_info.all()
        self.assertEqual(ret.count(), 29)
        for p in PermissionInfo.PERMS:
            for m in PermissionInfo.MODELS:
                self.assertIsInstance(ret.get(codename="{}_{}".format(p,m)),
                                      Permission)

    def test_all(self):
        perm_info = PermissionInfo()
        perm_info.setUp()

        ret = perm_info.all()

        self.assertIsInstance(ret, models.query.QuerySet)
        self.assertEqual(ret.count(), 29)
        for r in ret:
            self.assertIsInstance(r, Permission)
            perm, model = r.codename.split('_')
            # self.assertEqual(r.name, 'Can {} {}'.format(perm, model))
            self.assertIn(perm, PermissionInfo.PERMS)
            self.assertIn(model, PermissionInfo.MODELS + ['provider'])
            # ContentType
            content_type = ContentType.objects.get(model=model)
            self.assertEqual(content_type.model, model)
