from django.test import TestCase
from provider.models import Provider


class ProviderTest:
    def test_required_fields(self):
        model = Provider.objects.create(name='Wyatt Earp')
        self.assertEqual(model.name, 'Wyatt Earp')

