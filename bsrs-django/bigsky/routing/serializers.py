from person.serializers_leaf import PersonIdUsernameSerializer
from routing.models import Assignment, ProfileFilter
from routing.validators import ProfileFilterFieldValidator, UniqueByTenantValidator
from utils.create import update_model
from utils.serializers import BaseCreateSerializer


ASSIGNMENT_FIELDS = ('id', 'tenant', 'order', 'description', 'assignee',)


class ProfileFilterSerializer(BaseCreateSerializer):

    class Meta:
        model = ProfileFilter
        validators = [ProfileFilterFieldValidator()]
        fields = ('id', 'key', 'context', 'field', 'criteria')


class RemoveTenantMixin(object):

    def to_representation(self, instance):
        data = super(RemoveTenantMixin, self).to_representation(instance)
        data.pop('tenant', None)
        return data


class AssignmentCreateUpdateSerializer(RemoveTenantMixin, BaseCreateSerializer):

    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        validators = [UniqueByTenantValidator('order'),
                      UniqueByTenantValidator('description')]
        fields = ASSIGNMENT_FIELDS + ('filters',)

    def create(self, validated_data):
        filters = validated_data.pop('filters')

        instance = super(AssignmentCreateUpdateSerializer, self).create(validated_data)

        if filters:
            for f in filters:
                try:
                    filter_object = ProfileFilter.objects.get(id=f['id'])
                except ProfileFilter.DoesNotExist:
                    filter_object = ProfileFilter.objects.create(**f)
                finally:
                    instance.filters.add(filter_object)

        return instance

    def update(self, instance, validated_data):
        filter_ids = []

        # create/update nested ProfileFilters
        filters = validated_data.pop('filters')
        if filters:
            for f in filters:
                try:
                    pf = ProfileFilter.objects.get(id=f['id'])
                except ProfileFilter.DoesNotExist:
                    pf = ProfileFilter.objects.create(**f)
                else:
                    update_model(pf, f)
                finally:
                    filter_ids.append(pf.id)
                    instance.filters.add(pf)

        # # hard delete if not sent
        for x in instance.filters.exclude(id__in=filter_ids):
            x.delete(override=True)

        return super(AssignmentCreateUpdateSerializer, self).update(instance, validated_data)


class AssignmentListSerializer(RemoveTenantMixin, BaseCreateSerializer):

    assignee = PersonIdUsernameSerializer()

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee')


class AssignmentDetailSerializer(RemoveTenantMixin, BaseCreateSerializer):

    assignee = PersonIdUsernameSerializer()
    filters = ProfileFilterSerializer(required=False, many=True)

    class Meta:
        model = Assignment
        fields = ASSIGNMENT_FIELDS + ('filters',)

    @staticmethod
    def eager_load(queryset):
        return queryset.select_related('assignee').prefetch_related('filters')
