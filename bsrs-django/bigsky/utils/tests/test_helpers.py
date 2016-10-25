import datetime
import json
import pytz
import uuid

from django.conf import settings
from django.contrib.auth.models import ContentType
from django.test import TestCase
from django.utils import timezone

from automation.models import AutomationFilter
from automation.tests.factory import (
    create_automation, create_ticket_priority_filter, create_ticket_categories_filter,
    create_automation_action_send_sms)
from location.models import LocationLevel
from person import config
from person.models import Role, PersonStatus
from person.tests.factory import create_role
from utils.helpers import (BASE_UUID, model_to_json, model_to_json_select_related,
    model_to_json_prefetch_related, generate_uuid, get_content_type_number, media_path,
    create_default, local_strftime, queryset_to_json, add_related, remove_related,
    clear_related, get_model_class, KwargsAsObject, get_person_and_role_ids)


class ModelToJsonTests(TestCase):

    def setUp(self):
        self.role = create_role(name=settings.DEFAULT_ROLE)

    def test_model_to_json(self):
        ret = model_to_json(Role)

        ret = json.loads(ret)
        self.assertEqual(len(ret), 1)
        self.assertEqual(ret[0]['id'], str(self.role.id))
        self.assertEqual(ret[0]['name'], self.role.name)
        self.assertEqual(ret[0]['location_level'], str(self.role.location_level.id))
        self.assertEqual(ret[0]['default'], True)

    def test_model_to_json_select_related(self):
        ret = model_to_json_select_related(Role, 'location_level')

        ret = json.loads(ret)
        self.assertEqual(len(ret), 1)
        self.assertEqual(ret[0]['id'], str(self.role.id))
        self.assertEqual(ret[0]['name'], self.role.name)
        self.assertEqual(ret[0]['location_level'], str(self.role.location_level.id))
        self.assertEqual(ret[0]['default'], True)

    def test_model_to_json_prefetch_related(self):
        location_level = self.role.location_level

        ret = model_to_json_prefetch_related(LocationLevel, 'children', 'parents')

        ret = json.loads(ret)
        self.assertEqual(len(ret), 1)
        self.assertEqual(ret[0]['id'], str(location_level.id))
        self.assertEqual(ret[0]['name'], location_level.name)
        self.assertIn('children', ret[0])
        self.assertIn('parents', ret[0])


class QuerySetToJsonTests(TestCase):

    def setUp(self):
        self.role = create_role(name=settings.DEFAULT_ROLE)

    def test_queryset_to_json(self):
        queryset = Role.objects.all()

        ret = queryset_to_json(queryset)

        ret = json.loads(ret)
        self.assertEqual(len(ret), 1)
        self.assertEqual(ret[0]['id'], str(self.role.id))
        self.assertEqual(ret[0]['name'], self.role.name)
        self.assertEqual(ret[0]['location_level'], str(self.role.location_level.id))
        self.assertEqual(ret[0]['default'], True)


class GenerateUuidTests(TestCase):

    def setUp(self):
        self.id = uuid.UUID("27f"+BASE_UUID+"000")
        self.model_number = "27f"
        self.init_number = "000"

    def test_setup(self):
        self.assertEqual(
            self.id,
            uuid.UUID("{model_number}{base_id}{init_number}"
                      .format(model_number=self.model_number, base_id=BASE_UUID,
                              init_number=self.init_number))
        )

    def test_get_content_type_number(self):
        instance = ContentType.objects.get(model='role')
        raw_number = "{:03d}".format(instance.id)

        ret = get_content_type_number(Role)

        self.assertEqual(raw_number, ret)

    def test_generate_uuid(self):
        model = Role
        model_number = get_content_type_number(model)
        number = "{:03d}".format(model.objects.count()+1)

        ret = generate_uuid(Role)

        self.assertEqual(
            uuid.UUID("{model_number}{base_id}{init_number}"
                      .format(model_number=model_number, base_id=BASE_UUID,
                              init_number=number)),
            ret
        )


class MediaPathTests(TestCase):

    def test_default(self):
        path = 'foo/bar.csv'

        ret = media_path(path)

        self.assertEqual(ret, "{}{}".format(settings.MEDIA_URL, path))

    def test_override_prefix(self):
        path = 'foo/bar.csv'
        prefix = '/some-other-media-prefix/'

        ret = media_path(path, prefix=prefix)

        self.assertEqual(ret, "{}{}".format(prefix, path))

    def test_path_is_none(self):
        path = None

        ret = media_path(path)

        self.assertEqual(ret, "")


class MiscTestHelperTests(TestCase):

    def test_create_default(self):
        ret = create_default(PersonStatus)
        self.assertIsInstance(ret, PersonStatus)
        self.assertEqual(ret.name, PersonStatus.default)
        self.assertEqual(ret.name, config.PERSON_STATUSES[0])

    def test_local_strftime(self):
        obj = create_role()
        d = obj.created
        # raw
        tzname = 'America/Los_Angeles'
        tzinfo = pytz.timezone(tzname)
        dt = datetime.datetime(d.year, d.month, d.day, d.hour, d.minute,
                               d.second, tzinfo=tzinfo)
        raw_ret = datetime.datetime.strftime(tzinfo.normalize(dt + dt.utcoffset()),
                                             "%Y-%m-%d %H:%M:%S")

        ret = local_strftime(obj.created, tzname)

        self.assertEqual(ret, raw_ret)


class RelatedModelCrudHelperTests(TestCase):

    def test_add_related(self):
        automation = create_automation(with_filters=False)
        automation_filter = create_ticket_priority_filter()
        self.assertNotEqual(automation_filter.automation, automation)

        add_related(automation_filter, 'automation', automation)

        self.assertEqual(automation_filter.automation, automation)

    def test_remove_related(self):
        automation_filter = create_ticket_priority_filter()
        automation = automation_filter.automation

        remove_related(automation_filter)

        with self.assertRaises(AutomationFilter.DoesNotExist):
            AutomationFilter.objects.get(id=automation_filter.id)

        self.assertEqual(automation.filters.count(), 0)

    def test_clear_related(self):
        automation_filter = create_ticket_priority_filter()
        automation = automation_filter.automation
        automation_filter_two = create_ticket_categories_filter(
            automation)
        self.assertEqual(automation.filters.count(), 2)

        clear_related(automation, 'filters')

        self.assertEqual(automation.filters.count(), 0)


class GetModelClassTests(TestCase):

    def test_main(self):
        self.assertEqual(get_model_class("role"), Role)


class KwargsAsObjectTests(TestCase):

    def test_main(self):
        class Car(object):
            def __init__(self, **kwargs):
                self.seat = KwargsAsObject(**kwargs)

        car = Car(color='red', comfortable=True)

        self.assertEqual(car.seat.color, 'red')
        self.assertEqual(car.seat.comfortable, True)


class GetPersonAndRoleIdsTests(TestCase):

    def test_main(self):
        action = create_automation_action_send_sms()

        person_ids, role_ids = get_person_and_role_ids(action.content)

        self.assertEqual(person_ids, [action.content['recipients'][0]['id']])
        self.assertEqual(role_ids, [action.content['recipients'][1]['id']])
