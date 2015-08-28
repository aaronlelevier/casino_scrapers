from translation.models import Locale, Translation
from util.serializers import BaseCreateSerializer


class LocaleSerializer(BaseCreateSerializer):

    class Meta:
        model = Locale
        fields = ('id', 'default', 'locale', 'name', 'native_name',
            'presentation_name', 'rtl',)


class TranslationSerializer(BaseCreateSerializer):

    class Meta:
        model = Translation
        fields = ('id', 'locale', 'values', 'context', 'csv',)