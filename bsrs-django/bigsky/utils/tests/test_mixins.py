import json
import random

from django.db.models.functions import Lower

from model_mommy import mommy
from rest_framework.test import APITestCase

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from location.models import LocationLevel
from location.tests.factory import create_location, create_location_level
from person.models import Person, Role
from person.tests.factory import create_single_person, create_role, create_roles, PASSWORD
from utils import create
from utils.tests.mixins import MockPermissionsAllowAnyMixin


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


class DestroyModelMixinTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(DestroyModelMixinTests, self).setUp()
        self.person = create_single_person()
        self.person2 = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(DestroyModelMixinTests, self).tearDown()
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


class OrderingQuerySetMixinTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(OrderingQuerySetMixinTests, self).setUp()
        # Role
        self.role = create_role()
        # Person Records w/ specific Username
        for i in range(20):
            name = self._get_name(i)
            create_single_person(name)
            
        self.people = Person.objects.count()
        # Login
        self.person = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(OrderingQuerySetMixinTests, self).tearDown()
        self.client.logout()

    @staticmethod
    def _get_name(record):
        # Generate regarless of letter case name/username function 
        # for "ordering" tests
        if record % 2 == 0:
            return "wat{}".format(chr(65+record))
        else:
            return "Wat{}".format(chr(65+record))

    def test_ordering_first_name_data(self):
        response = self.client.get('/api/admin/people/?ordering=first_name')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        record = 0

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
        self.assertEqual(data['results'][0]['first_name'], self._get_name(10))

    def test_ordering_first_page_ordering_reverse(self):
        # The last name on the last page in descending order should
        # be the first record in normal ascending order
        response = self.client.get('/api/admin/people/?ordering=-first_name&page=2')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['results'][-1]['first_name'], self._get_name(0))

    def test_ordering_first_name_page_search(self):
        response = self.client.get('/api/admin/people/?page=2&ordering=first_name&search=wat')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['results'][0]['first_name'], self._get_name(10))

    def test_ordering_data_type__date(self):
        create_single_person()
        create_single_person()
        raw_qs_first = Person.objects.order_by('created').first()

        response = self.client.get('/api/admin/people/?ordering=created')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(str(raw_qs_first.id), data['results'][0]['id'])

    def test_ordering_data_type__int(self):
        role = create_role()
        role.auth_amount = 1
        role.save()
        role_two = create_role()
        role_two.auth_amount = 2
        role.save()
        raw_qs_first = Role.objects.order_by('-auth_amount').first()

        response = self.client.get('/api/admin/roles/?ordering=-auth_amount')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(str(raw_qs_first.id), data['results'][0]['id'])


class RelatedOrderingTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(RelatedOrderingTests, self).setUp()
        # Role
        self.store = create_location_level('store')
        self.department = create_location_level('department')

        self.role_admin = create_role(name="admin", location_level=self.store)
        self.role_mgr = create_role(name="Manager", location_level=self.store)
        self.role_staff = create_role(name="staff", location_level=self.department)

        self.admin_location = create_location(location_level=self.role_admin.location_level)
        self.mgr_location = create_location(location_level=self.role_mgr.location_level)
        self.staff_location = create_location(location_level=self.role_staff.location_level)

        self.admin = create_single_person(name=self.role_admin.name, role=self.role_admin,
            location=self.admin_location)
        self.mgr = create_single_person(name=self.role_mgr.name, role=self.role_mgr,
            location=self.mgr_location)
        self.staff = create_single_person(name=self.role_staff.name, role=self.role_staff,
            location=self.staff_location)

        # Login
        self.person = Person.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(RelatedOrderingTests, self).tearDown()
        self.client.logout()

    def test_list(self):
        params = ["role__name"]
        response = self.client.get('/api/admin/people/?ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_reverse(self):
        params = ["-role__name"]
        response = self.client.get('/api/admin/people/?ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_multiple(self):
        params = ["role__name", "role__location_level__name"]
        response = self.client.get('/api/admin/people/?ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_multiple_with_non_related(self):
        params = ["username", "role__location_level__name"]
        response = self.client.get('/api/admin/people/?ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.extra(select={'lower_username': 'lower(username)'})
                              .order_by("lower_username", "role__location_level__name")
                              .first().role.id)
        )

    def test_list_reverse_multiple(self):
        params = ["-role__name", "role__location_level__name"]
        response = self.client.get('/api/admin/people/?ordering={}'
            .format(','.join(params)))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['role'],
            str(Person.objects.order_by(*params).first().role.id)
        )

    def test_list_related__date(self):
        raw_qs_first = Person.objects.order_by('role__created').first()

        response = self.client.get('/api/admin/people/?ordering=role__created')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(str(raw_qs_first.role.id), data['results'][0]['role'])

    def test_list_related__int(self):
        # assumes this is the highest, so 'desc' will return 1st
        self.role_admin.password_min_length = 100
        self.role_admin.save()

        response = self.client.get('/api/admin/people/?ordering=-role__password_min_length')
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(str(self.role_admin.id), data['results'][0]['role'])


class FilterRelatedMixinMixin(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(FilterRelatedMixinMixin, self).setUp()
        self.person = create_single_person()
        self.role = self.person.role

        self.roles = create_roles()
        for role in self.roles:
            location = create_location(location_level=role.location_level)
            create_single_person(name=random.choice(create.LOREM_IPSUM_WORDS.split()),
                role=role, location=location)

        # Login User
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(FilterRelatedMixinMixin, self).tearDown()
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
