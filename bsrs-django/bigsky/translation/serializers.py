from translation.models import Locale, Translation
from util.serializers import BaseCreateSerializer


class LocaleSerializer(BaseCreateSerializer):

    class Meta:
        model = Locale
        fields = ('id', 'language',)


class TranslationSerializer(BaseCreateSerializer):

    class Meta:
        model = Translation
        fields = ('id', 'language', 'values',)