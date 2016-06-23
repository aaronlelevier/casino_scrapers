# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-23 23:09
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounting', '0001_initial'),
        ('dtd', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('company_code', models.CharField(help_text='Short code used to identify customer', max_length=100, unique=True)),
                ('company_name', models.CharField(help_text='Full customer company name', max_length=100)),
                ('dashboard_text', models.TextField(blank=True, default='Welcome', help_text='Converts to HTML for display on Welcome page. Role inherits this field')),
                ('test_mode', models.BooleanField(default=True, help_text='When in test mode all e-mail and other notifications will be sent to test addresses only')),
                ('default_currency', models.ForeignKey(help_text='key to default currency', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tenants', to='accounting.Currency')),
                ('dt_start', models.ForeignKey(help_text='key to starting decision tree record', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tenants', to='dtd.TreeData')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
