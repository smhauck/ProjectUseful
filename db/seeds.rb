# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
#
#

# ProductStatusType.create(title: "Waiting", alive: "1")
# ProductStatusType.create(title: "In Progress", alive: "1")
# ProductStatusType.create(title: "Complete", alive: "0")
# 
# 
# SprintStatusType.create(title: "Waiting", alive: "1")
# SprintStatusType.create(title: "In Progress", alive: "1")
# SprintStatusType.create(title: "Complete", alive: "0")
# SprintStatusType.create(title: "Cancelled", alive: "0")
# SprintStatusType.create(title: "Deleted", alive: "0")
# 
# 
# 
# 
# TaskStatusType.create(title: "Waiting", alive: "1")
# TaskStatusType.create(title: "In Progress", alive: "1")
# TaskStatusType.create(title: "Testing", alive: "1")
# TaskStatusType.create(title: "Complete", alive: "0")
# 
# 
# User.create(username: "admin", password: "admin", password_confirmation: "admin")






StoryStatusType.create(title: "Waiting", alive: "1", code: "waiting")
StoryStatusType.create(title: "In Progress", alive: "1", code: "in_progres")
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
StoryStatusType.create(title: "Deleted", alive: "0", code: "deleted")
