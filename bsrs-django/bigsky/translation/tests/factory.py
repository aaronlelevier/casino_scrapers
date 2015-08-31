import copy

from translation.models import Locale, Translation
from util.create import random_lorem


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


### FACTORIES

def create_locales():
    locales = [
        'en',
        'en-US',
        'en-x-Sephora'
    ]
    for l in locales:
        Locale.objects.create(locale=l, name=l)


def create_translations():
    create_locales()

    en = Locale.objects.get(locale='en')
    en_us = Locale.objects.get(locale='en-US')
    en_x_sephora = Locale.objects.get(locale='en-x-Sephora')

    dict_ = create_empty_dict()

    def_en = Translation.objects.create(
        locale = en,
        values = update_dict_values(dict_)
    )
    def_en_us = Translation.objects.create(
        locale = en_us,
        values = update_dict_values(dict_)
    )
    def_en_x_sephora = Translation.objects.create(
        locale = en_x_sephora,
        values = update_dict_values(dict_)
    )