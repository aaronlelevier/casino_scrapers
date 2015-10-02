# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='locale',
            field=models.ForeignKey(to='translation.Locale', help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_change',
            field=models.TextField(help_text='Tuple of (datetime of PW change, old PW)'),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_expire_date',
            field=models.DateField(help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_length',
            field=models.PositiveIntegerField(help_text='Store the length of the current password.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_end_date',
            field=models.DateField(max_length=100, null=True, blank=True, verbose_name='Out of the Office Status End Date'),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_start_date',
            field=models.DateField(max_length=100, null=True, blank=True, verbose_name='Out of the Office Status Start Date'),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_status',
            field=models.CharField(max_length=100, null=True, blank=True, verbose_name='Out of the Office Status'),
        ),
        migrations.AlterField(
            model_name='personstatus',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='personstatus',
            name='description',
            field=models.CharField(max_length=100, default='active', choices=[('active', 'active'), ('two', 'two')]),
        ),
        migrations.AlterField(
            model_name='proxyrole',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='create_all',
            field=models.BooleanField(default=False, help_text='Allow document creation for all locations'),
        ),
        migrations.AlterField(
            model_name='role',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_close_wo',
            field=models.CharField(max_length=255, default='Do not display', choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')]),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_max_approval_currency',
            field=models.CharField(max_length=25, default='usd', blank=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_options',
            field=models.CharField(max_length=255, default='new', choices=[('new', 'new'), ('draft', 'draft')]),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_select_assign',
            field=models.CharField(max_length=255, default='all', choices=[('all', 'all'), ('managers', 'managers')]),
        ),
        migrations.AlterField(
            model_name='role',
            name='msg_address',
            field=models.BooleanField(default=False, help_text='Enable Addressing'),
        ),
        migrations.AlterField(
            model_name='role',
            name='name',
            field=models.CharField(max_length=100, unique=True, help_text='Will be set to the Group Name'),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_char_types',
            field=models.CharField(max_length=100, help_text='Password characters allowed'),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire',
            field=models.IntegerField(default=90, help_text="Number of days after setting password that it will expire.If '0', password will never expire.", blank=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire_alert',
            field=models.BooleanField(default=True, help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires."),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_history_length',
            field=django.contrib.postgres.fields.ArrayField(default=[], base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'), blank=True, size=None),
        ),
        migrations.AlterField(
            model_name='role',
            name='proxy_set',
            field=models.BooleanField(default=False, help_text='Users in this Role can set their own proxy'),
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(max_length=29, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')], default='Internal', blank=True),
        ),
    ]
