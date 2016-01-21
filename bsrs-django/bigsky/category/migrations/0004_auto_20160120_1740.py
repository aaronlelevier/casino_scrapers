# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0003_auto_20160120_1725'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='subcategory_label',
            field=models.CharField(max_length=100, blank=True),
        ),
    ]
