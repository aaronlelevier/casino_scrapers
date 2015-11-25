from rest_framework import serializers
from rest_framework.exceptions import NotFound

from translation.models import Locale, Translation
from utils.serializers import BaseCreateSerializer


class LocaleSerializer(BaseCreateSerializer):

    class Meta:
        model = Locale
        fields = ('id', 'default', 'locale', 'name', 'native_name',
            'presentation_name', 'rtl',)


class TranslationBaseSerializer(serializers.ModelSerializer):

    locale = LocaleSerializer()

    class Meta:
        model = Translation
        fields = ('locale', 'values',)


class TranslationBootstrapSerializer(TranslationBaseSerializer):

    def to_representation(self, instance):
        ret = super(TranslationBootstrapSerializer, self).to_representation(instance)
        try:
            return {ret['locale']['locale'] : ret['values']}
        except KeyError:
            raise NotFound


class TranslationSerializer(TranslationBaseSerializer):
    pass


class TranslationListSerializer(TranslationBaseSerializer):

    def to_representation(self, data):
        return data
