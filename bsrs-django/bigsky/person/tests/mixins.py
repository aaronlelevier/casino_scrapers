from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from person.serializers import RoleListSerializer
from person.tests.factory import PASSWORD, create_single_person, get_or_create_tenant
from utils.tests.mixins import MockPermissionsAllowAnyMixin


class RoleSetupMixin(MockPermissionsAllowAnyMixin):

    def setUp(self):
        super(RoleSetupMixin, self).setUp()
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
        serializer = RoleListSerializer(self.role)
        self.data = serializer.data

    def tearDown(self):
        super(RoleSetupMixin, self).tearDown()
        self.client.logout()
