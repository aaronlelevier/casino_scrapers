from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.utils.text import capfirst

from collections import namedtuple

from utils import classproperty


def update_group(person, group):
    "Will make sure the ``person`` is in one, and only one group."
    for g in person.groups.all():
        person.groups.remove(g)
    person.groups.add(group)
    return person


class PermissionInfo(object):

    # models that have permissions
    MODELS = ['ticket', 'person', 'role', 'location', 'locationlevel', 'category']
    # allowed permission types
    PERMS = ['view', 'add', 'change', 'delete']
    # models' content type fields
    CONTENT_TYPE_FIELDS = [
        ('ticket', 'ticket'),
        ('person', 'person'),
        ('person', 'role'),
        ('location', 'location'),
        ('location', 'locationlevel'),
        ('category', 'category')
    ]

    @classproperty
    def CODENAMES(cls):
        codenames = []
        for p in cls.PERMS:
            for m in cls.MODELS:
                codenames.append('{}_{}'.format(p, m))
        return codenames

    @classproperty
    def ALL_DEFAULTS(cls):
        ret = {}

        for p in cls.PERMS:
            for m in cls.MODELS:
                ret["{}_{}".format(p, m)] = False

        return ret

    def setUp(self):
        """
        Create "view_%" Permission records that don't exist by default
        """
        for x in self.__class__.CONTENT_TYPE_FIELDS:
            ModelFieldData = namedtuple('ModelFieldData', ['app_label', 'model'])
            data = ModelFieldData._make(x)._asdict()
            content_type = ContentType.objects.get(**data)

            Permission.objects.get_or_create(
                codename='view_{}'.format(data['model']),
                name='Can View {}'.format(capfirst(data['model'])),
                content_type=content_type,
            )

    def all(self):
        """
        :return QuerySet: all supported Permissions by the system
        """
        content_types = self.content_types().values_list('id', flat=True)
        return Permission.objects.filter(
            codename__in=self.__class__.CODENAMES,
            content_type__in=content_types,
        )

    def content_types(self):
        """
        :return QuerySet: of the ContentTypes used by supported Permissions
        """
        app_labels = []
        models = []

        for app_label, model in self.__class__.CONTENT_TYPE_FIELDS:
            app_labels.append(app_label)
            models.append(model)

        return ContentType.objects.filter(
            app_label__in=app_labels,
            model__in=models
        )
