from rest_framework.permissions import IsAuthenticated

from contact.serializers import (
    PhoneNumberTypeSerializer, PhoneNumberSerializer,
    AddressTypeSerializer, AddressSerializer,
    EmailTypeSerializer, EmailSerializer)
from contact.models import (
    PhoneNumber, PhoneNumberType, Address, AddressType, Email, EmailType)
from utils.views import BaseModelViewSet


class PhoneNumberTypeViewSet(BaseModelViewSet):

    model = PhoneNumberType
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberTypeSerializer
    queryset = PhoneNumberType.objects.all()


class PhoneNumberViewSet(BaseModelViewSet):

    model = PhoneNumber
    permission_classes = (IsAuthenticated,)
    serializer_class = PhoneNumberSerializer
    queryset = PhoneNumber.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]


class AddressTypeViewSet(BaseModelViewSet):

    model = AddressType
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressTypeSerializer
    queryset = AddressType.objects.all()


class AddressViewSet(BaseModelViewSet):

    model = Address
    permission_classes = (IsAuthenticated,)
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]


class EmailTypeViewSet(BaseModelViewSet):

    model = EmailType
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailTypeSerializer
    queryset = EmailType.objects.all()
    

class EmailViewSet(BaseModelViewSet):

    model = Email
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailSerializer
    queryset = Email.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]
