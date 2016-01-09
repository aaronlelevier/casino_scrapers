# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0006_require_contenttypes_0002'),
        ('location', '0001_initial'),
        ('translation', '0001_initial'),
        ('work_order', '0001_initial'),
        ('person', '0001_initial'),
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='inv_wo_status',
            field=models.ForeignKey(to='work_order.WorkOrderStatus', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='role',
            name='location_level',
            field=models.ForeignKey(to='location.LocationLevel', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='proxyrole',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='auth_currency',
            field=models.ForeignKey(to='accounting.Currency', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='groups',
            field=models.ManyToManyField(related_query_name='user', related_name='user_set', help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', blank=True, verbose_name='groups', to='auth.Group'),
        ),
        migrations.AddField(
            model_name='person',
            name='locale',
            field=models.ForeignKey(to='translation.Locale', help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='locations',
            field=models.ManyToManyField(blank=True, to='location.Location', related_name='people'),
        ),
        migrations.AddField(
            model_name='person',
            name='next_approver',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='nextapprover', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='proxy_user',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='coveringuser', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='status',
            field=models.ForeignKey(to='person.PersonStatus', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(related_query_name='user', related_name='user_set', help_text='Specific permissions for this user.', blank=True, verbose_name='user permissions', to='auth.Permission'),
        ),
    ]
