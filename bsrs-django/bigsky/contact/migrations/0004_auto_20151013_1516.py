# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0003_auto_20151013_1440'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='object_id',
            field=models.UUIDField(),
        ),
        migrations.AlterField(
            model_name='email',
            name='object_id',
            field=models.UUIDField(),
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='object_id',
            field=models.UUIDField(),
        ),
    ]
