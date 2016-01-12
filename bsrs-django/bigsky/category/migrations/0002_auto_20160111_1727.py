# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='level',
            field=models.IntegerField(default=0, blank=True, help_text='A count of how many parent categories that this Category has.'),
        ),
    ]
