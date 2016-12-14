import copy

from rest_framework import serializers

from category.models import Category
from category.serializers import CategoryIDNameSerializer
from dtd.models import TreeField, TreeOption, TreeLink, TreeData
from dtd.validators import UniqueDtdFieldValidator
from generic.models import Attachment
from generic.serializers import AttachmentSerializer
from ticket.models import TicketPriority, TicketStatus
from utils import create
from utils.serializers import BaseCreateSerializer


class TreeOptionSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeOption
        fields = ('id', 'text', 'order',)


class TreeFieldSerializer(BaseCreateSerializer):

    options = TreeOptionSerializer(many=True, required=False)

    class Meta:
        model = TreeField
        fields = ('id', 'label', 'type', 'required', 'order', 'options',)


class TreeDataLeafNodeSerializer(BaseCreateSerializer):

    id = serializers.UUIDField(required=False)
    key = serializers.CharField(required=False)

    class Meta:
        model = TreeData
        fields = ('id', 'key',)


class TreeDataListSerializer(BaseCreateSerializer):

    class Meta:
        model = TreeData
        fields = ('id', 'key', 'description',)


class TreeLinkDetailSerializer(BaseCreateSerializer):

    categories = CategoryIDNameSerializer(many=True, required=False)
    destination = TreeDataListSerializer(required=False)
    priority_fk = serializers.PrimaryKeyRelatedField(queryset=TicketPriority.objects.all(), source='priority')
    status_fk = serializers.PrimaryKeyRelatedField(queryset=TicketStatus.objects.all(), source='status')
    dtd_fk = serializers.PrimaryKeyRelatedField(queryset=TreeData.objects.all(), source='dtd')

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header', 'categories',
                  'request', 'priority_fk', 'status_fk', 'dtd_fk', 'destination',)


class TreeLinkCreateUpdateSerializer(BaseCreateSerializer):

    categories = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(),
                                                    many=True, required=False)

    class Meta:
        model = TreeLink
        fields = ('id', 'order', 'text', 'action_button', 'is_header', 'categories',
                  'request', 'priority', 'status', 'dtd', 'destination',)


class TreeDataAttachmentToRepresentationMixin(object):

    def to_representation(self, obj):
        data = super(TreeDataAttachmentToRepresentationMixin, self).to_representation(obj)
        data['attachments'] = Attachment.objects.filter(object_id=data['id']).to_dict_full()
        return data


TREE_DATA_FIELDS = ('id', 'key', 'description', 'note', 'note_type',
                    'attachments', 'fields', 'prompt', 'link_type',
                    'links',)

class TreeDataDetailSerializer(TreeDataAttachmentToRepresentationMixin, BaseCreateSerializer):

    attachments = AttachmentSerializer(many=True, required=False)
    fields = TreeFieldSerializer(many=True, required=False)
    links = TreeLinkDetailSerializer(many=True, required=False)

    class Meta:
        model = TreeData
        fields = TREE_DATA_FIELDS


class TreeDataCreateUpdateSerializer(TreeDataAttachmentToRepresentationMixin, BaseCreateSerializer):

    attachments = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)
    fields = TreeFieldSerializer(many=True, required=False)
    links = TreeLinkCreateUpdateSerializer(many=True, required=False)

    class Meta:
        model = TreeData
        validators = [
            UniqueDtdFieldValidator()
        ]
        fields = TREE_DATA_FIELDS

    def create(self, validated_data):
        return self.process_all(validated_data=validated_data)

    def update(self, instance, validated_data):
        return self.process_all(instance, validated_data)

    def process_all(self, instance=None, validated_data=None):
        attachments = validated_data.pop('attachments', [])
        fields = validated_data.pop('fields', [])
        links = validated_data.pop('links', [])

        if instance:
            instance = create.update_model(instance, validated_data)
        else:
            instance = TreeData.objects.create(**validated_data)

        self.process_attachments(instance, attachments)
        self.process_fields(instance, fields)
        self.process_links(instance, links)

        return instance

    def process_removes(self, model, filters, excludes):
        model.objects.filter(**filters).exclude(**excludes).delete()

    def process_attachments(self, instance, attachments):
        # add/update
        for a in attachments:
            a = copy.copy(a)
            attachment = Attachment.objects.get(id=a.id)
            a.content_object = instance
            a.object_id = instance.id
            a.save()

        # remove
        filters = {'object_id': instance.id}
        excludes = {'id__in': [x.id for x in attachments]}
        self.process_removes(Attachment, filters, excludes)

    def process_fields(self, instance, fields):
        # add/update
        for f in fields:
            f = copy.copy(f)
            options = f.pop('options', [])

            try:
                field = TreeField.objects.get(id=f['id'])
                field = create.update_model(field, f)
            except TreeField.DoesNotExist:                
                f.update({'tree_data': instance})
                field = TreeField.objects.create(**f)
            finally:
                option_ids = self.process_options(field, options)
                TreeOption.objects.filter(id__in=option_ids).update(field=field)

        # remove
        filters = {'tree_data': instance}
        excludes = {'id__in': [f['id'] for f in fields]}
        self.process_removes(TreeField, filters, excludes)

    @staticmethod
    def process_options(field, options):
        # add/update
        option_ids = set()
        for o in options:
            try:
                option = TreeOption.objects.get(id=o['id'])
                create.update_model(option, o)
            except TreeOption.DoesNotExist:
                option = TreeOption.objects.create(**o)
            finally:
                option_ids.update([option.id])

        # remove
        field.options.exclude(id__in=option_ids).delete()

        return option_ids

    def process_links(self, instance, links):
        # add/update
        for x in links:
            x = copy.copy(x)
            categories = x.pop('categories', [])
            try:
                link = TreeLink.objects.get(id=x['id'])
                link = create.update_model(link, x)
            except TreeLink.DoesNotExist:
                link = TreeLink.objects.create(**x)
            finally:
                link.dtd = instance
                link.save()
                # Category
                # add
                if categories:
                    link.categories.add(*categories)
                # remove
                category_ids = [x.id for x in categories]
                categories_to_remove = Category.objects.filter(links__id=x['id']).exclude(id__in=category_ids)
                for c in categories_to_remove:
                    link.categories.remove(c)

        # remove
        filters = {'dtd': instance}
        excludes = {'id__in': [x['id'] for x in links]}
        self.process_removes(TreeLink, filters, excludes)
