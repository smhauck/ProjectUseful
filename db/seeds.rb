# Copyright (C) 2014 William B. Hauck, http://www.wbhauck.com
# 
# This file is part of Project Useful.
# 
# Project Useful is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Project Useful is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with Project Useful.  If not, see <http://www.gnu.org/licenses/>.



#     Create the default issue_status_types
IssueStatusType.create(title: 'Waiting', alive: "1", code: 'waiting')
IssueStatusType.create(title: 'Accepted', alive: "0", code: 'accepted')
IssueStatusType.create(title: 'Denied', alive: "0", code: 'denied')


#     Create the default issue_types
IssueType.create(title: 'Bug')
IssueType.create(title: 'Feature Request')
IssueType.create(title: 'Enhance Feature')
IssueType.create(title: 'New Documentation')
IssueType.create(title: 'Documentation Bug')
IssueType.create(title: 'Other')


#     Create the default product_status_types
ProductStatusType.create(title: "Waiting", alive: "1", code: 'waiting')
ProductStatusType.create(title: "In Progress", alive: "1", code: 'in_progress')
ProductStatusType.create(title: "Complete", alive: "0", code: 'complete')
ProductStatusType.create(title: "Cancelled", alive: "0", code: 'cancelled')


#     Create the default sprint_status_types
SprintStatusType.create(title: "Waiting", alive: "1", code: 'waiting')
SprintStatusType.create(title: "In Progress", alive: "1", code: 'in_progress')
SprintStatusType.create(title: "Complete", alive: "0", code: 'complete')
SprintStatusType.create(title: "Cancelled", alive: "0", code: 'cancelled')

 
#     Create the default task_status_types
TaskStatusType.create(title: "Waiting", alive: "1", code: "waiting")
TaskStatusType.create(title: "In Progress", alive: "1", code: "in_progress")
TaskStatusType.create(title: "Testing", alive: "1", code: "testing")
TaskStatusType.create(title: "Complete", alive: "0", code: "complete")
TaskStatusType.create(title: "Cancelled", alive: "0", code: "cancelled")


#     Create the default story_status_types
StoryStatusType.create(title: "Waiting", alive: "1", code: "waiting")
StoryStatusType.create(title: "In Progress", alive: "1", code: "in_progress")
StoryStatusType.create(title: "Product Owner Review", alive: "1", code: "product_owner_review")
StoryStatusType.create(title: "Product Owner Reject", alive: "1", code: "product_owner_reject")
StoryStatusType.create(title: "Product Owner Accept", alive: "1", code: "product_owner_accept")
StoryStatusType.create(title: "Client Review", alive: "1", code: "client_review")
StoryStatusType.create(title: "Client Reject", alive: "1", code: "client_reject")
StoryStatusType.create(title: "Client Accept", alive: "1", code: "client_accept")
StoryStatusType.create(title: "Production Push", alive: "1", code: "production_push")
StoryStatusType.create(title: "Production Review", alive: "1", code: "production_review")
StoryStatusType.create(title: "Complete", alive: "0", code: "complete")
StoryStatusType.create(title: "Cancelled", alive: "0", code: "cancelled")


#     Create the default story_types
StoryType.create(title: 'Bug')
StoryType.create(title: 'New Feature Request')
StoryType.create(title: 'Existing Feature Enhancement')
StoryType.create(title: 'Documentation Request')
StoryType.create(title: 'Documentation Bug')
StoryType.create(title: 'Other')



##################################################################
#     Create the default administrator user                      #
#     BE SURE TO CHANGE THE admin password and contact_email     #
##################################################################
User.create(username: "admin", password: "SECRET", password_confirmation: "SECRET", contact_email: "FIXME@example.com")


