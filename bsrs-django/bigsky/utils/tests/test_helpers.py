import json
import uuid

from django.contrib.auth.models import ContentType
from django.conf import settings
from django.test import TestCase

from person.models import Role
from person.tests.factory import create_role
from utils.helpers import (BASE_UUID, model_to_json, model_to_json_select_related,
     generate_uuid, get_content_type_number)


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
        ret = model_to_json_select_related(Role, select=['location_level'])

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
