# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150706_1700'),
    ]

    operations = [
        migrations.RenameField(
            model_name='person',
            old_name='acceptassign',
            new_name='accept_assign',
        ),
        migrations.RenameField(
            model_name='person',
            old_name='authamount',
            new_name='auth_amount',
        ),
        migrations.RenameField(
            model_name='person',
            old_name='empnumber',
            new_name='emp_number',
        ),
        migrations.RenameField(
            model_name='person',
            old_name='middleinitial',
            new_name='middle_initial',
        ),
    ]
