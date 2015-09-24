from django.test import TestCase

from bigsky.urls import router, default_model_ordering
from person.models import Person


class UrlTests(TestCase):

    def test_default_model_ordering_key(self):
        ordering = default_model_ordering()
        self.assertIn(
            ".".join(router.registry[0][0].split('/'))+".index",
            ordering
        )

    def test_default_model_ordering_value(self):
        ordering = default_model_ordering()
        self.assertIn(
            Person._meta.ordering,
            [x for x in default_model_ordering().values()]
        )

    def test_default_model_ordering_all_values_populated(self):
        ordering = default_model_ordering()
        for k,v in ordering.items():
            try:
                assert v
            except AssertionError:
                print "No value: {}: {}".format(k,v)
                raise