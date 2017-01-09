import random
from provider.models import Provider
from model_mommy import mommy
from utils.fake_data import person_names
from category.models import Category


# Create a provider
# make up a random value for the provider name (based on a list of names)
# requires foreign key for category (subscriber ?)
# names should be varied in a way so the provider list (per location/category) can be searched (fuzzy match)
# uuid for fbid value, may change depeding on FixxBook ids
def create_provider(category):
    first, middle, last = random.choice(person_names.ALL)
    num = Provider.objects.count()
    name = "{f} {m} {l} {n}".format(f=first, m=middle, l=last, n=num)
    return mommy.make(Provider, name=name, category=category)

def create_providers():
    # for every category generate a list of provider objects (random between 1 and 10)
    trade_set = Category.objects.filter(children__isnull=True)[:5]

    providers = []
    for trade in trade_set:
        providers.append(create_provider(trade).id)
        providers.append(create_provider(trade).id)

    return Provider.objects.filter(id__in=providers)

# Factory object can be used in unit tests and app
