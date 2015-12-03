import json

from django.conf import settings
from django.test import TestCase

from person.models import Role
from person.tests.factory import create_role
from utils import choices
from utils.helpers import (model_to_json, model_to_json_select_related, choices_to_json,
    generate_uuid)


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

    def test_choices_to_json(self):
        ret = choices_to_json(choices.ROLE_TYPE_CHOICES)

        ret = json.loads(ret)
        self.assertEqual(
            ret,
            [c[0] for c in choices.ROLE_TYPE_CHOICES]
        )


class GenerateUuidTests(TestCase):

    def setUp(self):
        self.id = "27f530c4-ce6c-4724-9cfd-37a16e787000"
        self.base_id = "27f530c4-ce6c-4724-9cfd-37a16e787"
        self.init_number = "000"

    def test_setup(self):
        self.assertEqual(
            "{}{}".format(self.base_id, self.init_number),
            self.id
        )

    def test_generate_uuid__first_id(self):
        # should return ``self.id`` b/c not incrementing it, just returning
        # the concatenated UUID
        ret = generate_uuid(self.base_id)

        self.assertEqual(ret, self.id)

    def test_generate_uuid__incr(self):
        incr = 10

        ret = generate_uuid(self.base_id, incr=incr)

        self.assertEqual(ret, "{}{:03d}".format(self.base_id, incr))
