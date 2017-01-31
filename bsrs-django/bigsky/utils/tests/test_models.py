from mock import patch

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.contrib.auth.models import ContentType, Permission
from django.core.exceptions import ObjectDoesNotExist

from model_mommy import mommy

from contact.models import Country
from location.models import LocationType, Location
from person.models import Person, PersonQuerySet
from person.tests.factory import create_single_person, create_role
from translation.tests.factory import create_translation_keys_for_fixtures
from ticket.models import TicketStatus
from ticket.tests.factory_related import create_ticket_priority
from utils import create
from utils.helpers import create_default


class BaseManagerTests(TestCase):

    def setUp(self):
        self.person = create_single_person('b')
        self.person_two = create_single_person('a')

    def test_filter_export_data(self):
        query_params = {'username': self.person.username}
        fields = Person.EXPORT_FIELDS

        ret = Person.objects.filter_export_data(query_params)

        self.assertIsInstance(ret, PersonQuerySet)
        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret[0].id, self.person.id)
        self.assertEqual(ret[0].username, self.person.username)

    def test_filter_export_data__none_field_arg(self):
        query_params = {'_': 'foo'}

        ret = Person.objects.filter_export_data(query_params)

        self.assertIsInstance(ret, PersonQuerySet)
        self.assertEqual(ret.count(), Person.objects.count())

    @patch("person.models.PersonQuerySet.search_multi")
    def test_filter_export_data__search(self, mock_func):
        query_params = {'search': 'a'}

        Person.objects.filter_export_data(query_params)

        self.assertEqual(mock_func.call_args[0][0], 'a')

    def test_filter_export_data__ordering(self):
        self.assertTrue(self.person_two.username < self.person.username)
        query_params = {'ordering': 'username'}

        ret = Person.objects.filter_export_data(query_params)

        self.assertEqual(ret.count(), 2)
        self.assertEqual(ret[0].username, self.person_two.username)
        self.assertEqual(ret[1].username, self.person.username)


class BaseModelTests(TestCase):

    # The 'Country' is arbitrarily picked here to test the
    # behavior of the BaseModel

    def setUp(self):
        # default ``objects`` model manager should only
        # return non-deleted objects
        self.t_del = mommy.make(Country, deleted=timezone.now())
        self.t_ok = mommy.make(Country)

    def test_objects(self):
        self.assertEqual(Country.objects.count(), 1)

    def test_objects_all(self):
        self.assertEqual(Country.objects_all.count(), 2)

    def test_str(self):
        self.assertEqual(
            str(self.t_ok),
            "id: {t.id}; class: {t.__class__.__name__}; deleted: {t.deleted}".format(t=self.t_ok)
        )

    def test_delete__default(self):
        self.assertIsNone(self.t_ok.deleted)

    def test_delete__soft_delete(self):
        self.t_ok.delete()
        self.assertIsNotNone(self.t_ok.deleted)
        self.assertIsInstance(Country.objects_all.get(id=self.t_ok.id), Country)

    def test_delete__hard_delete(self):
        country = mommy.make(Country)
        country.delete(override=True)

        with self.assertRaises(ObjectDoesNotExist):
            Country.objects_all.get(id=country.id)

    def test_to_dict(self):
        self.assertIsInstance(self.t_ok.to_dict(), dict)

    def test_model_fields__explicit(self):
        self.assertEqual(Person.MODEL_FIELDS, ['id', 'username'])

        self.assertEqual(Person.model_fields, Person.MODEL_FIELDS)

    def test_model_fields__all_fields(self):
        # if MODEL_FIELDS isn't set on the Model, then return all fields
        with self.assertRaises(AttributeError):
            Country.MODEL_FIELDS

        self.assertEqual(
            Country.export_fields,
            [x.name for x in Country._meta.get_fields()]
        )

    def test_export_fields__explicit(self):
        self.assertEqual(
            Person.EXPORT_FIELDS,
            ['status_name', 'fullname', 'username', 'title', 'role_name']
        )

        self.assertEqual(Person.export_fields, Person.EXPORT_FIELDS)

    def test_export_fields__all_fields(self):
        # if EXPORT_FIELDS isn't set on the Model, then return all fields
        with self.assertRaises(AttributeError):
            Country.EXPORT_FIELDS

        self.assertEqual(
            Country.export_fields,
            [x.name for x in Country._meta.get_fields()]
        )

    def test_get_i18n_value(self):
        create_translation_keys_for_fixtures()
        status = create_default(TicketStatus)

        ret = status.get_i18n_value('name')

        self.assertEqual(ret, TicketStatus.DEFAULT.split('.')[-1])

    def test_get_i18n_value__locale_arg(self):
        locale = 'es'
        create_translation_keys_for_fixtures(locale)
        status = create_default(TicketStatus)

        ret = status.get_i18n_value('name', locale)

        self.assertEqual(ret, TicketStatus.DEFAULT.split('.')[-1])

    def test_get_i18n_value__not_a_field(self):
        create_translation_keys_for_fixtures()
        status = create_default(TicketStatus)

        ret = status.get_i18n_value('foo')

        self.assertEqual(ret, '')

    def test_get_i18n_value__not_i18n_key(self):
        create_translation_keys_for_fixtures()
        status = mommy.make(TicketStatus, name='foo')

        ret = status.get_i18n_value('name')

        self.assertEqual(ret, status.name)

    def test_ambiguous_field_names(self):
        self.assertEqual(
            sorted(['name', 'number']),
            sorted(list(Location.ambiguous_field_names))
        )


class SimpleNameMixinTests(TestCase):

    def test_simple_name(self):
        priority = create_ticket_priority()

        ret = priority.simple_name

        self.assertEqual(ret, priority.name.split('.')[-1])


class BaseNameModelTests(TestCase):

    def setUp(self):
        self.x = mommy.make(LocationType)

    def test_str(self):
        self.assertEqual(str(self.x), self.x.name)

    def test_to_dict(self):
        self.assertEqual(
            self.x.to_dict(),
            {'id': str(self.x.id), 'name': self.x.name}
        )


class DefaultToDictMixinTests(TestCase):

    def setUp(self):
        self.status = create_default(TicketStatus)

    def test_to_dict(self):
        ret = self.status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(self.status.id))
        self.assertEqual(ret['name'], self.status.name)
        self.assertTrue(ret['default'])

    def test_to_dict_id_name(self):
        ret = self.status.to_dict_id_name()

        self.assertEqual(len(ret), 2)
        self.assertEqual(ret['id'], str(self.status.id))
        self.assertEqual(ret['name'], self.status.name)


class UpdateTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.role1 = create_role()
        self.role2 = create_role()

    def test_update_model(self):
        new_username = "new_username"
        self.assertNotEqual(self.person.username, new_username)
        self.person = create.update_model(instance=self.person, dict_={'username':new_username})
        self.assertEqual(self.person.username, new_username)
