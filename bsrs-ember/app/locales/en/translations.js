export default {
	'menu': {
    	'home': 'Home'
	},
	'button': {
		'add': 'Add'
	},
	'modules':{
		'tickets':{
			'titleShort': 'Tickets'
		},
		'workOrders':{
			'titleShort': 'Work Orders'
		},
		'purchaseOrders':{
			'titleShort': 'Purchase Orders'
		},
		'tasks':{
			'titleShort': 'Tasks'
		},
		'projects':{
			'titleShort': 'Projects'
		},
		'rfqs':{
			'titleShort': 'RFQs'
		},
		'pms':{
			'titleShort': 'PM'
		},
		'assets':{
			'titleShort': 'Assets'
		},
		'invoices':{
			'titleShort': 'Invoices'
		}
	},
	'login': {
		'button_name': 'Login'
	},
	'crud': {
		'titles': {
			'new': 'New {{model}}',
			'edit': 'Edit {{model}}',
		},
		'create': {
			'button': 'Create',
			'success': '{{model}} created successfully.',
			'error': 'Error creating {{model}}.',
		},
		'save': {
			'button': 'Save',
			'success': '{{model}} saved successfully.',
			'error': 'Error saving {{model}}.',
		},
		'delete': {
			'button': 'Delete',
			'confirm': 'Are you sure you want to delete {{model}} \'{{record}}\'?',
			'success': '{{model}} deleted successfully.',
			'error': 'Error deleting {{model}}.',
		},
		'restore': {
			'button': 'Restore',
			'success': '{{model}} restored successfully.',
			'error': 'Error restoring {{model}}.',
		},
		'cancel': {
			'button': 'Cancel',
		}
	},
	'admin':{
		'title': 'Admin',
        'amount': 'Amount',
		'general': {
			'one': 'General Setting',
			'other': 'General Settings'
		},
		'setting': {
			'one': 'Setting',
			'other': 'Settings'
		},
		'notification': {
			'one': 'Notification Profile',
			'other': 'Notification Profiles'
		},
		'assignment': {
			'one': 'Assignment Profile',
			'other': 'Assignment Profiles'
		},
		'approval': {
			'one': 'Approval',
			'other': 'Approvals'
		},
		'template': {
			'one': 'Template',
			'other': 'Templates'
		},
		'users': {
			'one': 'User',
			'other': 'Users'
		},
		'role': {
			'one': 'Role',
			'other': 'Roles',
			'label': {
				'name': 'Role Name',
                'role_type': 'Role Type',
				'location_level': 'Location Organization',
                'category': 'Category',
				'number_users': '# of Users',
				'general': 'General'
			},
            'system_administrator': 'Administrator',
            'guest': 'Guest'
		},
		'address_type': {
			'office': 'Office',
			'shipping': 'Shipping'
		},
		'person': {
			'one': 'Person',
			'other': 'People',
			'label': {
				'name': 'Name',
				'username': 'Username',
				'password': 'Password',
				'change_password': 'Change',
				'title': 'Title',
				'employee_id': 'Employee No.',
				'role': 'Role',
				'auth_amount': 'Auth. Amount',
				'first_name': 'First Name',
				'middle_initial': 'Middle',
				'last_name': 'Last Name',
                'status': 'Status',
				'phone_number': {
					'one': 'Phone Number',
					'other': 'Phone Numbers'
				},
				'address': 'Address',
				'email': 'Email',
				'general': 'General',
				'credentials': 'Credentials',
				'contact': 'Contact'
			},
            'status': {
                'active': 'Active',
                'inactive': 'Inactive',
                'expired': 'Expired'
            }
		},
		'phone':{
			'number': 'Phone Number',
			'numbers': 'Phone Numbers',
			'add': 'Add Phone Number'
		},
		'address': {
			'label': 'Type',
			'address': 'Street Address',
			'city': 'City',
			'state': {
				'one': 'State',
				'other': 'States',
				'select': 'Select a State'
			},
			'postal_code': 'Zip',
			'country': {
				'one': 'Country',
				'other': 'Countries',
				'select': 'Select a Country'
			},
			'add': 'Add Address'
		},

		'location': {
			'one': 'Location',
			'other': 'Locations',
            'label': {
                'name': 'Name',
                'number': 'Number',
                'location_level': 'Organization',
                'status': 'Status',
                'general': 'General'
            },
            'status': {
                'open': 'Open',
                'closed': 'Future',
                'future': 'Closed'
            },
		},
		'category': {
			'one': 'Category',
			'other': 'Categories',
            'name': {
                'repair': 'Repair',
                'maintenance': 'Maintenance',
                'loss_prevention': 'Loss Prevention',
            },
            'status': {
                'active': 'Active'
            },
            'label': {
                'name': 'Name',
                'description': 'Description',
                'cost_currency': 'Cost Currency',
                'cost_amount': 'Cost Amount',
                'cost_code': 'Cost Code',
                'general': 'General',
                'label': 'Label',
                'subcategory_label': 'Sub Category Label'
            },
            'labelCat': {
                'type': 'Type',
                'trade': 'Trade',
                'issue': 'Issue'
            }
		},
		'categoryType':{
			'one': 'Category Type',
			'other': 'Category Types'
		},
		'contractor': {
			'one': 'Contractor',
			'other': 'Contractors'
		},
		'company': {
			'one': 'Company',
			'other': 'Companies'
		},
		'contractorAssignment': {
			'one': 'Contractor Assignment',
			'other': 'Assignments'
		},
		'phonenumbertype': {
			'office': 'Office',
			'mobile': 'Mobile'
		},
		'addresstype': {
			'office': 'Office',
			'mobile': 'Shipping'
		},
		'locationlevel':{
			'one': 'Location Level',
			'other': 'Location Levels',
			'department': 'Department',
			'company': 'Company',
			'fmd': 'Facility Management District',
			'fmu': 'Facility Management Region',
			'region': 'Region',
			'district': 'District',
			'store': 'Store',
            'label': {
                'name': 'Name',
                'general': 'General',
				'childOrg': 'Child Organization(s)'
            }
		}
	},
	'validation': {
		'valid': 'Valid',
		'invalid': 'Invalid'
	}
};
