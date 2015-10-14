# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('third_party', '0003_auto_20151014_1251'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thirdparty',
            name='categories',
            field=models.ManyToManyField(to='category.Category', blank=True),
        ),
    ]
