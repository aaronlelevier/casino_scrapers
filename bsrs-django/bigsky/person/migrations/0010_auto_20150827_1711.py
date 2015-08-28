# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0009_auto_20150827_1038'),
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
            field=models.ForeignKey(blank=True, to='translation.Locale', help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_change',
            field=models.TextField(help_text='Tuple of (datetime of PW change, old PW)'),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_end_date',
            field=models.DateField(blank=True, max_length=100, verbose_name='Out of the Office Status End Date', null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_start_date',
            field=models.DateField(blank=True, max_length=100, verbose_name='Out of the Office Status Start Date', null=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_status',
            field=models.CharField(blank=True, max_length=100, verbose_name='Out of the Office Status', null=True),
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
            field=models.BooleanField(help_text='Allow document creation for all locations', default=False),
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
            field=models.CharField(blank=True, max_length=25, default='usd'),
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
            field=models.BooleanField(help_text='Enable Addressing', default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='name',
            field=models.CharField(help_text='Will be set to the Group Name', max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_char_types',
            field=models.CharField(help_text='Password characters allowed', max_length=100),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire',
            field=models.PositiveIntegerField(help_text='Number of days after setting password that it will expire.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire_alert',
            field=models.BooleanField(help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.", default=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_history_length',
            field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='proxy_set',
            field=models.BooleanField(help_text='Users in this Role can set their own proxy', default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(blank=True, max_length=29, default='Internal', choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')]),
        ),
    ]
