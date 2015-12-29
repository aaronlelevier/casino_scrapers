# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
        ('location', '0003_auto_20151228_1544'),
        ('person', '0001_initial'),
        ('translation', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('work_order', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='inv_wo_status',
            field=models.ForeignKey(null=True, blank=True, to='work_order.WorkOrderStatus'),
        ),
        migrations.AddField(
            model_name='role',
            name='location_level',
            field=models.ForeignKey(null=True, blank=True, to='location.LocationLevel'),
        ),
        migrations.AddField(
            model_name='proxyrole',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='auth_currency',
            field=models.ForeignKey(null=True, blank=True, to='accounting.Currency'),
        ),
        migrations.AddField(
            model_name='person',
            name='groups',
            field=models.ManyToManyField(to='auth.Group', blank=True, verbose_name='groups', help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user'),
        ),
        migrations.AddField(
            model_name='person',
            name='locale',
            field=models.ForeignKey(null=True, blank=True, help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", to='translation.Locale'),
        ),
        migrations.AddField(
            model_name='person',
            name='locations',
            field=models.ManyToManyField(blank=True, related_name='people', to='location.Location'),
        ),
        migrations.AddField(
            model_name='person',
            name='next_approver',
            field=models.ForeignKey(null=True, blank=True, related_name='nextapprover', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='person',
            name='proxy_user',
            field=models.ForeignKey(null=True, blank=True, related_name='coveringuser', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='person',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='status',
            field=models.ForeignKey(null=True, blank=True, to='person.PersonStatus'),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(to='auth.Permission', blank=True, verbose_name='user permissions', help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user'),
        ),
    ]
