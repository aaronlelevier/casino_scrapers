import copy
import json
import uuid

from django.contrib.auth.models import Permission

from model_mommy import mommy
from rest_framework.test import APITestCase

from accounting.models import Currency
from category.models import Category
from location.models import LocationLevel
from person import config as person_config
from person.helpers import PermissionInfo
from person.models import Role
from person.serializers import RoleCreateUpdateSerializer
from person.tests.factory import create_role
from person.tests.mixins import RoleSetupMixin


class RoleListTests(RoleSetupMixin, APITestCase):

    def test_list(self):
        response = self.client.get('/api/admin/roles/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        role = data['results'][0]
        self.assertEqual(role['id'], str(self.role.pk))
        self.assertEqual(role['name'], self.role.name)
        self.assertEqual(role['role_type'], self.role.role_type)
        self.assertEqual(role['location_level'], str(self.location.location_level.id))

    def test_search(self):
        role = create_role()
        self.assertEqual(Role.objects.count(), 2)

        response = self.client.get('/api/admin/roles/?search={}'.format(role.name))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)


class RoleDetailTests(RoleSetupMixin, APITestCase):

    def test_detail(self):
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.role.pk))
        self.assertEqual(data['name'], self.role.name)
        self.assertEqual(data['role_type'], self.role.role_type)
        self.assertEqual(data['location_level'], str(self.location.location_level.id))
        self.assertEqual(data['auth_amount'], "{:.4f}".format(self.role.auth_amount))
        self.assertEqual(data['auth_currency'], None)
        self.assertNotIn('dashboard_text', data)
        self.assertIn(
            data['categories'][0]['id'],
            [str(c.id) for c in self.role.categories.all()]
        )
        self.assertIn('name', data['categories'][0])
        self.assertNotIn('status', data['categories'][0])
        self.assertNotIn('parent', data['categories'][0])

    def test_detail__inherited(self):
        self.role.dashboard_text = 'foo'
        self.role.auth_currency = mommy.make(Currency, code="FOO")
        self.role.save()
        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        # dashboard_text
        self.assertEqual(data['inherited']['dashboard_text']['value'], self.role.dashboard_text)
        self.assertEqual(data['inherited']['dashboard_text']['inherited_value'], self.role.tenant.dashboard_text)
        self.assertEqual(data['inherited']['dashboard_text']['inherits_from'], 'tenant')
        self.assertEqual(data['inherited']['dashboard_text']['inherits_from_id'], str(self.role.tenant.id))
        # auth_currency
        self.assertEqual(data['inherited']['auth_currency']['value'], str(self.role.auth_currency.id))
        self.assertEqual(data['inherited']['auth_currency']['inherited_value'], str(self.role.tenant.default_currency.id))
        self.assertEqual(data['inherited']['auth_currency']['inherits_from'], 'tenant')
        self.assertEqual(data['inherited']['auth_currency']['inherits_from_id'], str(self.role.tenant.id))

    def test_permissions__only_return_true_perms(self):
        all_perms = PermissionInfo().ALL_DEFAULTS
        perms = Permission.objects.filter(codename__in=['add_ticket', 'change_ticket'])
        self.assertEqual(perms.count(), 2)
        self.role.group.permissions.set([p for p in perms])

        response = self.client.get('/api/admin/roles/{}/'.format(self.role.pk))

        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data, dict)
        self.assertEqual(len(data['permissions']), 2)
        self.assertTrue(data['permissions'][perms[0].codename])
        self.assertTrue(data['permissions'][perms[1].codename])


class RoleCreateTests(RoleSetupMixin, APITestCase):

    def setUp(self):
        super(RoleCreateTests, self).setUp()

        currency = mommy.make(Currency, code='foo')
        self.data = {
            "id": str(uuid.uuid4()),
            "name": "Admin",
            "role_type": person_config.ROLE_TYPES[0],
            "location_level": str(self.location.location_level.id),
            "categories": self.role.categories_ids,
            "auth_amount": 123,
            "auth_currency": str(currency.id),
            "dashboard_text": "foo"
        }

    def test_main(self):
        response = self.client.post('/api/admin/roles/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['name'], self.data['name'])
        self.assertEqual(data['role_type'], self.data['role_type'])
        self.assertEqual(data['location_level'], self.data['location_level'])
        self.assertEqual(data['auth_amount'], "{:.4f}".format(self.data['auth_amount']))
        self.assertEqual(data['auth_currency'], self.data['auth_currency'])
        self.assertEqual(data['dashboard_text'], self.data['dashboard_text'])
        self.assertEqual(sorted(data['categories']), sorted(self.data['categories']))

    def test_new_roles_tenant_set_to_logged_in_users_tenant(self):
        response = self.client.post('/api/admin/roles/', self.data, format='json')

        role = Role.objects.get(id=self.data['id'])
        self.assertEqual(role.tenant, self.person.role.tenant)

    def test_permissions(self):
        self.data['permissions'] = PermissionInfo.ALL_DEFAULTS
        self.data['permissions'].update({
            'add_ticket': True,
            'change_ticket': True
        })

        response = self.client.post('/api/admin/roles/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        for k,v in data['permissions'].items():
            if k in ['add_ticket', 'change_ticket']:
                self.assertTrue(v, "{}: {} != True".format(k,v))
            else:
                self.assertFalse(v, "{}: {} != False".format(k,v))
        # check db
        role = Role.objects.get(id=data['id'])
        self.assertEqual(role.group.permissions.count(), 2)


class RoleUpdateTests(RoleSetupMixin, APITestCase):

    def setUp(self):
        super(RoleUpdateTests, self).setUp()
        self.data = RoleCreateUpdateSerializer(self.role).data

    def test_update(self):
        category = mommy.make(Category)
        role_data = self.data
        role_data['name'] = 'new name here'
        role_data['auth_currency'] = str(mommy.make(Currency, code='FOO').id)
        role_data['dashboard_text'] = 'foo'
        role_data['categories'].append(str(category.id))

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            role_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.role.id))
        self.assertEqual(data['name'], role_data['name'])
        self.assertEqual(data['role_type'], self.role.role_type)
        self.assertEqual(data['location_level'], str(self.role.location_level.id))
        self.assertEqual(data['auth_amount'], "{:.4f}".format(self.role.auth_amount))
        self.assertEqual(data['auth_currency'], role_data['auth_currency'])
        self.assertEqual(data['dashboard_text'], role_data['dashboard_text'])
        self.assertIsInstance(data['categories'], list)

    def test_update__location_level(self):
        role_data = copy.copy(self.data)
        role_data['location_level'] = str(mommy.make(LocationLevel).id)
        self.assertNotEqual(
            self.data['location_level'],
            role_data['location_level']
        )

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            role_data, format='json')

        self.assertEqual(response.status_code, 200)
        new_role_data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            new_role_data['location_level'],
            str(Role.objects.get(id=self.data['id']).location_level.id)
        )

    def test_permissions__from_false_to_true(self):
        self.assertNotIn('add_ticket', self.role.permissions)
        self.assertNotIn('change_ticket', self.role.permissions)
        self.data['permissions'].update({
            'add_ticket': True,
            'change_ticket': True
        })

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(self.role.permissions['add_ticket'])
        self.assertTrue(self.role.permissions['change_ticket'])

    def test_permissions__from_true_to_false(self):
        # role's initial perms
        perms = Permission.objects.filter(codename__in=['add_ticket', 'change_ticket'])
        self.role.group.permissions.set([p for p in perms])
        # pre-test
        self.assertTrue(self.role.permissions['add_ticket'])
        self.assertTrue(self.role.permissions['change_ticket'])
        # remove 'change_ticket' only
        self.data['permissions'] = {
            'add_ticket': True
        }

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['permissions']['add_ticket'])
        self.assertNotIn('change_ticket', data['permissions'])

    def test_permissions__no_change__all_false(self):
        self.assertEqual(self.role.group.permissions.count(), 0)

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['permissions'] == self.data['permissions'])

    def test_permissions__add_true_to_existing(self):
        perms = Permission.objects.filter(codename__in=['add_ticket'])
        self.role.group.permissions.set([p for p in perms])
        # pre-test
        self.assertTrue(self.role.permissions['add_ticket'])
        self.assertNotIn('change_ticket', self.role.permissions)
        self.data['permissions'] = {
            'add_ticket': True,
            'change_ticket': True
        }

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.role.permissions['add_ticket'])
        self.assertTrue(self.role.permissions['change_ticket'])

    def test_permissions__send_true_for_true_perm_and_it_is_unaffected(self):
        perms = Permission.objects.filter(codename__in=['add_ticket'])
        self.role.group.permissions.set([p for p in perms])
        # pre-test
        self.assertTrue(self.role.permissions['add_ticket'])
        self.data['permissions'] = {
            'add_ticket': True
        }

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.role.permissions['add_ticket'])

    def test_permissions__send_false_for_false_perm_and_it_is_unaffected(self):
        self.assertEqual(self.role.group.permissions.count(), 0)
        self.data['permissions'] = {
            'add_ticket': False
        }

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn('add_ticket', data['permissions'])
        self.assertEqual(self.role.group.permissions.count(), 0)


class RoleRouteDataTests(RoleSetupMixin, APITestCase):

    def test_settings_data(self):
        response = self.client.get('/api/admin/roles/route-data/new/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 1)
        self.assertEqual(
            data['settings'],
            {'dashboard_text': self.tenant.dashboard_text}
        )
