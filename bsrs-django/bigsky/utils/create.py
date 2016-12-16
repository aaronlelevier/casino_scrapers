import random
import string

from django.db import IntegrityError
from django.contrib.auth.models import ContentType, Group, Permission

from utils.permissions import perms_map


LOREM_IPSUM_WORDS = u'''\
admin
a ac accumsan ad adipiscing aenean aliquam aliquet amet ante aptent arcu at
auctor augue bibendum blandit class commodo condimentum congue consectetuer
consequat conubia convallis cras cubilia cum curabitur curae cursus dapibus
diam dictum dictumst dignissim dis dolor donec dui duis egestas eget eleifend
elementum elit enim erat eros est et etiam eu euismod facilisi facilisis fames
faucibus felis fermentum feugiat fringilla fusce gravida habitant habitasse hac
hendrerit hymenaeos iaculis id imperdiet in inceptos integer interdum ipsum
justo lacinia lacus laoreet lectus leo libero ligula litora lobortis lorem
luctus maecenas magna magnis malesuada massa mattis mauris metus mi molestie
mollis montes morbi mus nam nascetur natoque nec neque netus nibh nisi nisl non
nonummy nostra nulla nullam nunc odio orci ornare parturient pede pellentesque
penatibus per pharetra phasellus placerat platea porta porttitor posuere
potenti praesent pretium primis proin pulvinar purus quam quis quisque rhoncus
ridiculus risus rutrum sagittis sapien scelerisque sed sem semper senectus sit
sociis sociosqu sodales sollicitudin suscipit suspendisse taciti tellus tempor
tempus tincidunt torquent tortor tristique turpis ullamcorper ultrices
ultricies urna ut varius vehicula vel velit venenatis vestibulum vitae vivamus
viverra volutpat vulputate'''


def random_lorem(words=5):
    msg = []
    for w in range(words):
        msg.append(random.choice(LOREM_IPSUM_WORDS.split()))
    return ' '.join(msg)


def _get_groups_and_perms():
    "contenttypes and sites must be added to installed_apps to use."
    ct = ContentType.objects.get(app_label='person', model='role')

    groups = ['Manager', 'SrManager']
    for ea in groups:
        group, created = Group.objects.get_or_create(name=ea)
        if created:
            perm = Permission.objects.create(
                name=ea, codename="is_" + ea, content_type=ct)
            group.permissions.add(perm)
            group.save()


def _create_model_view_permissions():
    '''
    Create 'view_(model_name)' Permission for all models.

    Run this when adding a new Model to the DB.
    '''
    for ct in ContentType.objects.all():

        name = 'Can view {}'.format(ct.name)
        codename = 'view_{}'.format(ct.name)

        # create a single instance to be used in all 3 view types
        for i in perms_map.keys():
            if i in ['HEAD', 'OPTIONS', 'GET']:
                try:
                    Permission.objects.create(
                        name=name, codename=codename, content_type=ct)
                except IntegrityError:
                    pass


def _generate_ph():
    return ''.join([str(random.randrange(0, 10)) for x in range(10)])


# copy method to new name for readablity in some tests that
# need int's and not ph's
_generate_int = _generate_ph


def _generate_chars(length=10):
    return ''.join([str(random.choice(string.ascii_letters)) for x in range(length)])


def model_to_simple_dict(instance):
    return {'id': instance.id, 'name': instance.name}


def update_model(instance, dict_):
    "Update a Model Object with all attrs from the dict_."
    for k,v in dict_.items():
        setattr(instance, k, v)
    instance.save()
    return instance
