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
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
<<<<<<< HEAD
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
=======
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
>>>>>>> master
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=100, null=True, blank=True)),
                ('label', models.CharField(max_length=100, editable=False, help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', null=True, blank=True)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(decimal_places=4, max_digits=15, default=0, blank=True)),
                ('cost_code', models.CharField(max_length=100, null=True, blank=True)),
                ('cost_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('parent', models.ForeignKey(to='category.Category', blank=True, null=True, related_name='children')),
            ],
            options={
                'ordering': ('id',),
<<<<<<< HEAD
=======
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CategoryStatus',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default=b'active', max_length=100, choices=[(b'active', b'active'), (b'two', b'two')])),
            ],
            options={
                'ordering': ('id',),
>>>>>>> master
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='category',
            name='status',
            field=models.ForeignKey(blank=True, to='category.CategoryStatus', null=True),
        ),
    ]
