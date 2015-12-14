# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0003_auto_20151211_1314'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='address1',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='address',
            name='address2',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='address',
            name='city',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='address',
            name='country',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='address',
            name='state',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='address',
            name='zip',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='number',
            field=models.TextField(null=True, blank=True),
        ),
    ]
