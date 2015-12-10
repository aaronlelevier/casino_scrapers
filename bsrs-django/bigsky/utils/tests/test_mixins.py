import json
import uuid
import random

from django.db.models.functions import Lower

from model_mommy import mommy
from rest_framework.test import APITestCase, APITransactionTestCase

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from location.models import LocationLevel
from person.models import Person, Role
from person.tests.factory import create_single_person, create_role, create_roles, PASSWORD
from utils import create


class CheckIdCreateMixinTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # Currency Obj
        self.currency = Currency.objects.first()
        serializer = CurrencySerializer(self.currency)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

    def test_create_duplicate(self):
        response = self.client.post('/api/admin/currencies/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 400)


class DestroyModelMixinTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.person2 = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_delete(self):
        people_all = Person.objects_all.count()
        # Init Person2
        self.assertIsNone(self.person2.deleted)
        self.assertEqual(self.client.session['_auth_user_id'], str(self.person.id))
        response = self.client.delete('/api/admin/people/{}/'.format(self.person2.pk))
        self.assertEqual(response.status_code, 204)
        # get the Person Back, and check their deleted flag
        self.assertEqual(Person.objects_all.count(), people_all)
        self.assertEqual(Person.objects.count(), people_all-1)

    def test_delete_override(self):
        # initial
        people = Person.objects_all.count()
        self.assertIsInstance(Person.objects_all.get(id=self.person2.id), Person)
        # delete
        response = self.client.delete('/api/admin/people/{}/'.format(self.person2.pk),
            {'override':True}, format='json')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Person.objects_all.count(), people-1)
        # DB Fails
        with self.assertRaises(Person.DoesNotExist):
            Person.objects_all.get(id=self.person2.id)


class OrderingQuerySetMixinTests(APITransactionTestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        # Person Records w/ specific Username
        for i in range(35):
            name = self._get_name(i)
            Person.objects.create_user(name, 'myemail@mail.com', PASSWORD,
                first_name=name, role=self.role)
            
        self.people = Person.objects.count()
        # Login
        self.person = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    @staticmethod
    def _get_name(record):
        # Generate regarless of letter case name/username function 
        # for "ordering" tests
        if record % 2 == 0:
            return "wat{}".format(chr(65+record))
        else:
            return "Wat{}".format(chr(65+record))

    def test_default_ordering(self):
        # Should start with ID Ascending order
        response = self.client.get('/api/admin/people/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['id'],
            str(Person.objects.first().id)
            )

    def test_ordering_first_name_data(self):
        response = self.client.get('/api/admin/people/?ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        record = 0
        self.assertEqual(data['results'][record]['first_name'], self._get_name(26))

    def test_ordering_first_name_data_reverse(self):
        response = self.client.get('/api/admin/people/?ordering=-first_name')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['first_name'],
            Person.objects.order_by(Lower('first_name')).reverse().first().first_name
            )

    def test_second_page(self):
        response = self.client.get('/api/admin/people/?page=2')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results']), 10)

    def test_ordering_second_page_ordering(self):
        # 11th Person, should be the 1st Person on Page=2
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['results'][0]['first_name'], self._get_name(16))

    def test_ordering_first_page_ordering_reverse(self):
        # The last name on the last page in descending order should
        # be the first record in normal ascending order
        response = self.client.get('/api/admin/people/?ordering=-first_name&page=2')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['results'][-1]['first_name'], self._get_name(26))

    def test_ordering_first_name_page_search(self):
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name&search=wat')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['results'][0]['first_name'], self._get_name(16))


class RelatedOrderingQuerySetMixinTests(APITransactionTestCase):

    def setUp(self):
        # Role
        self.store = mommy.make(LocationLevel, name='store')
        self.department = mommy.make(LocationLevel, name='department')

        self.role_admin = create_role(name="admin", location_level=self.store)
        self.role_mgr = create_role(name="Manager", location_level=self.store)
        self.role_staff = create_role(name="staff", location_level=self.department)

        self.admin = create_single_person(name=self.role_admin.name, role=self.role_admin)
        self.mgr = create_single_person(name=self.role_mgr.name, role=self.role_mgr)
        self.staff = create_single_person(name=self.role_staff.name, role=self.role_staff)

        # Login
        self.person = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_setup_data(self):
        self.assertEqual(LocationLevel.objects.count(), 2)
        self.assertEqual(Role.objects.count(), 3)
        self.assertEqual(Person.objects.count(), 3)

    def test_list(self):
        params = ["role__name"]
        response = self.client.get('/api/admin/people/?related_ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_reverse(self):
        params = ["-role__name"]
        response = self.client.get('/api/admin/people/?related_ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_multiple(self):
        params = ["role__name", "role__location_level__name"]
        response = self.client.get('/api/admin/people/?related_ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_multiple_with_non_related(self):
        params = ["username", "role__location_level__name"]
        response = self.client.get('/api/admin/people/?related_ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_reverse_multiple(self):
        params = ["-role__name", "role__location_level__name"]
        response = self.client.get('/api/admin/people/?related_ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )


class FilterRelatedMixinMixin(APITransactionTestCase):

    def setUp(self):
        self.roles = create_roles()
        self.role = self.roles[0]
        for role in self.roles:
            create_single_person(
                name=random.choice(create.LOREM_IPSUM_WORDS.split()),
                role=role
            )
        # Login User
        self.person = create_single_person(name="aaron", role=self.role)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    # FIELDS

    def test_field(self):
        username = self.person.username
        response = self.client.get('/api/admin/people/?username={}'.format(username))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(username=username).count())

    def test_field_with_arg(self):
        letter = 'T'
        response = self.client.get('/api/admin/people/?fullname__contains={}'
            .format(letter))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(fullname__contains=letter).count()
        )

    # RELATED

    def test_related_field(self):
        response = self.client.get('/api/admin/people/?role__name={}'.format(self.role.name))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(role__name=self.role.name).count())

    def test_related_field_with_arg(self):
        response = self.client.get('/api/admin/people/?role__name__icontains={}'
            .format(self.role.name[0]))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(role__name__icontains=self.role.name[0]).count()
        )

    def test_related_id_in(self):
        response = self.client.get('/api/admin/people/?role__id__in={}'.format(self.role.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(role__id__in=[self.role.id]).count()
        )

    def test_related_id_in_multiple(self):
        response = self.client.get('/api/admin/people/?role__id__in={},{}'
            .format(self.roles[0].id, self.roles[1].id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Person.objects.filter(role__id__in=[self.roles[0].id, self.roles[1].id]).count()
        )

    # IN

    def test_in_single(self):
        letter = self.person.username[0]
        response = self.client.get('/api/admin/people/?username__in={}'.format(letter))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(username__in=[letter]).count())

    def test_in_multiple(self):
        # Setup
        people = Person.objects.all()
        a = people[0].username
        b = people[1].username
        usernames = "{},{}".format(a,b)
        # Test
        response = self.client.get('/api/admin/people/?username__in={}'.format(usernames))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(username__in=[a,b]).count())

    def test_in_single_uuid(self):
        response = self.client.get('/api/admin/people/?id__in={}'.format(self.person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(id__in=[self.person.id]).count())

    def test_in_multiple_uuid(self):
        people = Person.objects.all()
        a = people[0]
        b = people[1]
        response = self.client.get('/api/admin/people/?id__in={},{}'.format(a.id, b.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Person.objects.filter(id__in=[a.id, b.id]).count())
