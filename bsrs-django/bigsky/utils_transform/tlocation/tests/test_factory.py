from django.test import TestCase

from model_mommy import mommy

from utils_transform.tlocation.models import LocationRegion, LocationDistrict, LocationStore


# class LocationRegionTests(TestCase):

#     # def setUp(self):
#         # self.fields = [x.name for x in LocationDistrict._meta.get_fields()]
#         # self.location = mommy.make(LocationRegion, _fill_optional=self.fields)

#     def test_all_fields_populated(self):
#         location = LocationRegion.objects.create(name='a', number='b')

#         self.assertIsInstance(location, LocationRegion)
#         # for f in self.fields:
#         #     self.assertTrue(getattr(self.location, f))
