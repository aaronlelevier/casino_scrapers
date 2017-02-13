import random

from model_mommy import mommy

from category.models import Category
from provider.models import Provider
from utils.create import random_lorem
from utils.fake_data import person_names


def create_provider(category):
    """
    Create a provider
    make up a random value for the provider name (based on a list of names)
    requires foreign key for category (subscriber ?)
    names should be varied in a way so the provider list (per location/category) can be searched (fuzzy match)
    uuid for fbid value, may change depeding on FixxBook ids
    """
    first, middle, last = random.choice(person_names.ALL)
    num = Provider.objects.count()
    name = "{f} {m} {l} {n}".format(f=first, m=middle, l=last, n=num)
    provider = mommy.make(Provider, name=name)

    for field in ('logo', 'address1', 'address2', 'city',
                  'state', 'postal_code', 'phone', 'email'):
        setattr(provider, field, "{} {}".format(random_lorem(1), num))
    provider.save()

    provider.categories.add(category)
    return provider


PROVIDER_FIXTURE_DATA = {
    'address1': "8859 N. Southeast St.",
    'address2': "Unit 12",
    'city': "Manti",
    'email': "bobo@bobselectric.com",
    'logo': "https://s-media-cache-ak0.pinimg.com/736x/ce/5a/0d/ce5a0de26911f1db20158e5955039652.jpg",
    'name': "Joe's Wired Electrical Maintenance",
    'phone': "(435) 851-2045",
    'postal_code': "84642",
    'state': "UT"
}


def create_provider_with_all_categories():
    provider = mommy.make(Provider, **PROVIDER_FIXTURE_DATA)
    for category in Category.objects.filter(children__isnull=True):
        provider.categories.add(category)
    return provider


def create_providers():
    """
    actory object can be used in unit tests and app
    """
    # one Provider has all Categories
    create_provider_with_all_categories()

    # for every category generate a list of provider objects (random between 1 and 10)
    providers = []
    for trade in Category.objects.filter(children__isnull=True)[:5]:
        providers.append(create_provider(trade).id)
        providers.append(create_provider(trade).id)

    return Provider.objects.filter(id__in=providers)
