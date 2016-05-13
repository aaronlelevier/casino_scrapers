from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from contact.tests.factory import create_contacts
from third_party.models import ThirdParty, ThirdPartyStatus
from utils import create
from utils.tests.test_helpers import create_default


def create_third_party(number=1):
    # related objects
    create_categories()
    categories = Category.objects.all()[:2]

    # third party
    create_default(ThirdPartyStatus)

    for i in range(number):
        name = create._generate_chars()
        number = create._generate_ph()

        third_party = mommy.make(ThirdParty, name=name, number=number,
            categories=categories)

        create_contacts(third_party)

    return third_party
