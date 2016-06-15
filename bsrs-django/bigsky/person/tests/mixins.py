from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from person.serializers import RoleSerializer
from person.tests.factory import PASSWORD, create_single_person, get_or_create_tenant
from setting.models import Setting
from setting.tests.factory import create_general_setting, create_role_setting


class RoleSetupMixin(object):

    def setUp(self):
        self.tenant = get_or_create_tenant()
        self.person = create_single_person()
        self.location = self.person.locations.first()
        self.categories = mommy.make(Category, _quantity=2)
        self.currency = Currency.objects.default()
        # Role
        self.role = self.person.role
        self.role.categories_ids = [str(c.id) for c in self.role.categories.all()]
        self.role.save()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # data
        serializer = RoleSerializer(self.role)
        self.data = serializer.data
        # general settings
        self.setting = Setting.objects.get(name='general')
        self.role_setting = self.role.settings

    def tearDown(self):
        self.client.logout()
