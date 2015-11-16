from django.test import TestCase

from utils.helpers import generate_uuid


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
