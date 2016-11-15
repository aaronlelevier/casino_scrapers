from django.conf import settings

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    page_size = settings.PAGE_SIZE
    max_page_size = settings.MAX_PAGE_SIZE
    page_size_query_param = settings.PAGE_SIZE_QUERY_PARAM

class LargeResultsSetPagination(StandardPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 10000
