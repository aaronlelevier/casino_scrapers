# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(blank=True, null=True, max_length=100)),
                ('label', models.CharField(blank=True, help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', editable=False, null=True, max_length=100)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(blank=True, max_digits=15, default=0, decimal_places=4)),
                ('cost_code', models.CharField(blank=True, null=True, max_length=100)),
                ('cost_currency', models.ForeignKey(to='accounting.Currency', null=True, blank=True)),
                ('parent', models.ForeignKey(related_name='children', to='category.Category', null=True, blank=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='CategoryStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(choices=[('active', 'active'), ('two', 'two')], default='active', max_length=100)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.AddField(
            model_name='category',
            name='status',
            field=models.ForeignKey(to='category.CategoryStatus', null=True, blank=True),
        ),
    ]
