from rest_framework.permissions import IsAuthenticated

from contact.serializers import (
    PhoneNumberTypeSerializer, PhoneNumberSerializer,
    AddressTypeSerializer, AddressSerializer,
    EmailTypeSerializer, EmailSerializer)
from contact.models import (
    PhoneNumber, PhoneNumberType, Address, AddressType, Email, EmailType)
from utils.views import BaseModelViewSet


class PhoneNumberTypeViewSet(BaseModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberTypeSerializer
    queryset = PhoneNumberType.objects.all()


class PhoneNumberViewSet(BaseModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberSerializer
    queryset = PhoneNumber.objects.all()
    model = PhoneNumber
    filter_fields = [f.name for f in model._meta.get_fields()]


class AddressTypeViewSet(BaseModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressTypeSerializer
    queryset = AddressType.objects.all()


class AddressViewSet(BaseModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
    model = Address
    filter_fields = [f.name for f in model._meta.get_fields()]


class EmailTypeViewSet(BaseModelViewSet):
    """
    API endpoint that allows location types to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailTypeSerializer
    queryset = EmailType.objects.all()
    

class EmailViewSet(BaseModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailSerializer
    queryset = Email.objects.all()
    model = Email
    filter_fields = [f.name for f in model._meta.get_fields()]