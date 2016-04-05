/*
Debugging missing Roles

Log:
2016-04-05 11:55:45,636 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:45,689 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:45,698 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:45,922 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:45,930 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:45,974 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:45,982 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:46,142 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:46,151 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
2016-04-05 11:55:46,159 INFO utils_transform.trole.management.commands._etl_utils Category name: Not Found.
*/

-- Persistent query for missing Roles
SELECT R.*
FROM person_role AS R
LEFT JOIN person_role_categories AS RC ON R.id::text = RC.role_id::text
WHERE RC.role_id IS NULL;

-- Transforms query for DominoRoles that didn't transfer
SELECT id,
       name,
       selection,
       categories,
       manage_role_names,
       tsg_start_point
FROM trole_dominorole
WHERE categories = '';
