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
    provider.categories.add(category)
    return provider


def create_provider_with_all_categories():
    name = "Joe's " + random_lorem()
    provider = mommy.make(Provider, name=name)
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
