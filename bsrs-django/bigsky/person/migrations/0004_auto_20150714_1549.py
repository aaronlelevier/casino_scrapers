# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0001_initial'),
        ('person', '0003_auto_20150714_1520'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='inv_autoapprove',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_close_wo',
            field=models.CharField(default=b'Do not display', max_length=255, choices=[(b'Do not display', b'Do not display'), (b'unchecked', b'unchecked'), (b'checked', b'checked')]),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_max_approval_amount',
            field=models.PositiveIntegerField(default=0, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_max_approval_currency',
            field=models.CharField(default=b'usd', max_length=25, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_req_attach',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_select_assign',
            field=models.CharField(default=b'all', max_length=255, choices=[(b'all', b'all'), (b'managers', b'managers')]),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_wait',
            field=models.PositiveIntegerField(default=1, blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='inv_wo_status',
            field=models.ForeignKey(blank=True, to='order.WorkOrderStatus', null=True),
        ),
        migrations.AddField(
            model_name='role',
            name='msg_address',
            field=models.BooleanField(default=False, help_text=b'Enable Addressing'),
        ),
        migrations.AddField(
            model_name='role',
            name='msg_copy_default',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='msg_copy_email',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='msg_stored_link',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='msg_viewall',
            field=models.BooleanField(default=False),
        ),
    ]
