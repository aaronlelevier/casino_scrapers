import copy

from translation.models import Locale, Translation
from utils.create import random_lorem


### FACTORIES
LOCALES =['en', 'en-us', 'zh-cn', 'ja', 'es', 'fr']

def create_locales():
    locales = [
        'en',
        'en-us',
        'en-x-sephora'
    ]
    return [Locale.objects.create(locale=l, name=l)
            for l in locales]


def create_locale(name):
    return Locale.objects.create(locale=name, name=name)


def create_translations():
    locales = create_locales()

    for locale in locales:
        dict_ = create_empty_dict()

        Translation.objects.create(
            locale=locale,
            values=update_dict_values(dict_)
        )


### HELPER FUNCTIONS

def create_empty_dict(keys=50):
    d = {}
    while len(d) < keys:
        try:
            k = random_lorem(words=1)
            d[k] = None
        except KeyError:
            pass
    return d


def update_dict_values(dict_):
    dict_ = copy.copy(dict_)
    for k,v in dict_.items():
        dict_[k] = random_lorem(words=1)
    return dict_
