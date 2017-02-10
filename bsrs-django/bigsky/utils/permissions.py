from collections import namedtuple
from itertools import product

from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.http import Http404
from django.utils import six
from django.utils.translation import ugettext_lazy as _
from rest_framework import exceptions, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from utils import classproperty


class CrudPermissions(permissions.BasePermission):

    PERM_MAP = {
        'GET': 'view',
        'POST': 'add',
        'PUT': 'change',
        'DELETE': 'delete',
        'OPTIONS': '',
        'PATCH': '',
    }

    def has_permission(self, request, view):
        perm = self.PERM_MAP[request.method]
        model = self._get_model_name(view.model)
        return "{}_{}".format(perm, model) in request.user.permissions

    def _get_model_name(self, model):
        return model.__name__.lower()


def exception_handler(exc, context):
    """
    Custom override the default `rest_framework.views.exception_handler`
    So NotFound and PermissionDenied both return a 404 response.
    """
    if isinstance(exc, (Http404, PermissionDenied)):
        msg = _('Not found.')
        data = {'detail': six.text_type(msg)}
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    elif isinstance(exc, exceptions.APIException):
        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait

        if isinstance(exc.detail, (list, dict)):
            data = exc.detail
        else:
            data = {'detail': exc.detail}

        return Response(data, status=exc.status_code, headers=headers)

    # Note: Unhandled exceptions will raise a 500 error.
    return None


class PermissionInfo(object):

    # models that have permissions
    MODELS = ['ticket', 'person', 'role', 'location', 'locationlevel', 'category',
              'workorder', 'provider']
    # allowed permission types
    PERMS = ['view', 'add', 'change', 'delete']
    # models' content type fields
    CONTENT_TYPE_FIELDS = [
        ('ticket', 'ticket'),
        ('person', 'person'),
        ('person', 'role'),
        ('provider', 'provider'),
        ('location', 'location'),
        ('location', 'locationlevel'),
        ('category', 'category'),
        ('work_order', 'workorder')
    ]

    @classproperty
    def CODENAMES(cls):
        return list(cls.names())

    @classproperty
    def ALL_DEFAULTS(cls):
        return dict.fromkeys(cls.names(), False)

    @classmethod
    def names(cls):
        return ['_'.join(x) for x in product(cls.PERMS, cls.MODELS)]

    def setUp(self):
        """
        Create "view_%" Permission records that don't exist by default
        """
        for x in self.__class__.CONTENT_TYPE_FIELDS:
            ModelFieldData = namedtuple('ModelFieldData', ['app_label', 'model'])
            data = ModelFieldData._make(x)._asdict()
            content_type = ContentType.objects.get(**data)
            verbose_name = content_type.model_class()._meta.verbose_name

            for perm in self.__class__.PERMS:
                try:
                    Permission.objects.get(
                        codename='{}_{}'.format(perm, data['model']))
                except Permission.MultipleObjectsReturned:
                    pass
                except Permission.DoesNotExist:
                    Permission.objects.create(
                        codename='{}_{}'.format(perm, data['model']),
                        name='Can {} {}'.format(perm, verbose_name),
                        content_type=content_type,
                    )

    def all(self):
        """
        :return QuerySet: all supported Permissions by the system
        """
        return Permission.objects.filter(
            codename__in=self.__class__.CODENAMES)
