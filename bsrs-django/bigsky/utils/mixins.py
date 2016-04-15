from django.core.exceptions import FieldDoesNotExist, ObjectDoesNotExist
from django.db.models import CharField, TextField

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


class EagerLoadQuerySetMixin(object):
    """
    To prefetch related data on "read-only" serializers.

    When mixed into a ViewSet, must be the first "mixin".

    :eager_load_actions: override in ViewSet to actions.
    """
    eager_load_actions = ['retrieve', 'list']

    def get_queryset(self):
        queryset = super(EagerLoadQuerySetMixin, self).get_queryset()

        if self.action in self.eager_load_actions:
            queryset = self.get_serializer_class().eager_load(queryset)

        return queryset


class CheckIdCreateMixin(object):
    """
    Trying to Post a duplicate returns a 400 and not a 500 Server Error
    """
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # custom: start
        try:
            _id = serializer.validated_data['id']
            self.queryset.get(id=_id)
        except (KeyError, ObjectDoesNotExist):
            pass
        else:
            raise ValidationError("ID: {} already exists.".format(_id))
        # custom: end
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DestroyModelMixin(object):
    """
    Destroy a model instance, extended to handle `override` kwarg.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        override = request.data.get('override', None)
        self.perform_destroy(instance, override)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance, override):
        instance.delete(override)


class OrderingQuerySetMixin(object):
    """
    Return a case-insensitive ordered queryset for non-related Fields. 

    **Only works for fields on the Model. Does not work for related fields.**

    `StackOverflow link <http://stackoverflow.com/questions/3409047/django-orm-case-insensitive-order-by>`_

    :param: ordering
    """
    def get_queryset(self):
        queryset = super(OrderingQuerySetMixin, self).get_queryset()

        ordering = self.request.query_params.get('ordering', None)

        if ordering:
            queryset = self._get_ordered_queryset(queryset, ordering)

        return queryset

    def _get_ordered_queryset(self, queryset, ordering):
        select_dict = {}
        order_by_list = []

        for param in ordering.split(','):
            field, asc = self._get_field(param)

            if self._is_str_field(field):
                select_dict[self._get_key(field)] = self._get_value(field)
                order_by_list.append(self._get_asc_desc_value(field, asc))
            else:
                order_by_list.append(param)

        return queryset.extra(select=select_dict).order_by(*order_by_list)

    def _get_field(self, param):
        """
        :Return: (Field name only w/o '-', Boolean if field is ASC)
        """
        if param.startswith('-'):
            return (param[1:], False)
        else:
            return (param, True)

    def _is_str_field(self, param):
        """
        Only return `True` for str fields on the model.
        Return `False` for non-str fields, and related fields.
        """
        try:
            model_field = self.model._meta.get_field(param)
        except FieldDoesNotExist:
            return False

        if isinstance(model_field, (CharField, TextField,)):
            return True

    def _get_key(self, field):
        return "lower_{}".format(field)

    def _get_value(self, field):
        return "lower({})".format(field)

    def _get_asc_desc_value(self, field, asc):
        return "{}{}".format("" if asc else "-", self._get_key(field))


class FilterRelatedMixin(object):
    """
    Allow filterable by 'IN' keyword.

    ``filter_fields``: A list of filterable fields that uses the 
    Django ORM sytax. Must be defined on the ModelViewSet that is 
    implementing this feature.
    """
    queryset = None
    filter_fields = None

    def get_queryset(self):
        queryset = super(FilterRelatedMixin, self).get_queryset()
        queryset = self.filter_by_query_params(queryset)
        return queryset

    def filter_by_query_params(self, queryset):
        if self.filter_fields:
            kwargs = {}

            for param in self.request.query_params:
                if param.split("__")[0] in self.filter_fields:
                    if param.split("__")[-1] == "in":
                        value = self.request.query_params.get(param).split(',')
                    else:
                        value = self.request.query_params.get(param)

                    kwargs.update({param: value})

            return queryset.filter(**kwargs)
        return queryset


class SearchMultiMixin(object):
    """
    Search accross multiple fields with the `search` query param.

    `search_multi` method must be defined on the `Model.Manager` in order to use.
    """

    def get_queryset(self):
        """
        :search: will use the ``Q`` lookup class:

        https://docs.djangoproject.com/en/1.8/topics/db/queries/#complex-lookups-with-q-objects
        """
        queryset = super(SearchMultiMixin, self).get_queryset()

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.search_multi(keyword=search)

        return queryset
