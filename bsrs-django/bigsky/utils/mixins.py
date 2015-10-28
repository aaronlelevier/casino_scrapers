from rest_framework import status
from rest_framework.response import Response


# VIEWS

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


# QUERYSETS

class OrderingQuerySetMixin(object):

    """
    Return a case-insensitive ordered queryset.

    `StackOverflow link <http://stackoverflow.com/questions/3409047/django-orm-case-insensitive-order-by>`_
    """
    def get_queryset(self):
        queryset = self.queryset
        ordering = self.request.query_params.get('ordering', None)

        if ordering:
            queryset = self._get_ordered_queryset(queryset, ordering)

        return queryset

    def _get_ordered_queryset(self, queryset, ordering):
        select_dict = {}
        order_by_list = []

        for param in ordering.split(','):
            field, asc = self._get_field(param)
            select_dict[self._get_key(field)] = self._get_value(field)
            order_by_list.append(self._get_asc_desc_value(field, asc))

        return queryset.extra(select=select_dict).order_by(*order_by_list)

    def _get_field(self, param):
        """
        :Return: (Field name only w/o '-', Boolean if field is ASC)
        """
        if param.startswith('-'):
            return (param[1:], False)
        else:
            return (param, True)

    def _get_key(self, field):
        return "lower_{}".format(field)

    def _get_value(self, field):
        return "lower({})".format(field)

    def _get_asc_desc_value(self, field, asc):
        return "{}{}".format("" if asc else "-", self._get_key(field))
