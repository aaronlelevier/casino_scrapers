from translation.models import Locale, Definition
from util.serializers import BaseCreateSerializer


class LocaleSerializer(BaseCreateSerializer):

    class Meta:
        model = Locale
        fields = ('id', 'language',)


class DefinitionSerializer(BaseCreateSerializer):

    class Meta:
        model = Definition
        fields = ('id', 'language', 'values',)