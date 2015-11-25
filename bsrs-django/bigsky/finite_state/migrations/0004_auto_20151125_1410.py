# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0003_auto_20151125_1400'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(null=True, blank=True, to='finite_state.WorkRequestStatus'),
        ),
    ]
