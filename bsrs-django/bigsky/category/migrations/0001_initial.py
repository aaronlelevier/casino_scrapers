# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
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
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('label', models.CharField(editable=False, blank=True, max_length=100, help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', null=True)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(default=0, decimal_places=4, max_digits=15, blank=True)),
                ('cost_code', models.CharField(blank=True, max_length=100, null=True)),
                ('level', models.IntegerField(default=0, blank=True)),
                ('cost_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('parent', models.ForeignKey(to='category.Category', blank=True, related_name='children', null=True)),
            ],
            options={
                'ordering': ('level',),
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
            ],
            options={
                'verbose_name_plural': 'Category Statuses',
            },
        ),
        migrations.AddField(
            model_name='category',
            name='status',
            field=models.ForeignKey(to='category.CategoryStatus', blank=True, null=True),
        ),
    ]
