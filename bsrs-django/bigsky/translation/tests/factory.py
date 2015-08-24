from translation.models import Locale, Definition


def create_locales():
    locales = [
        'en',
        'en-US',
        'en-x-Sephora'
    ]
    for l in locales:
        Locale.objects.create(language=l)


def create_definitions():
    create_locales()
    
