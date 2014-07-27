class User < ActiveRecord::Base
  has_secure_password
  has_many :requests, class_name: "Story", foreign_key: "requestor_id"
  has_many :blogs, class_name: "Blog", foreign_key: "creator_id"


  has_many :story_assignments
  has_many :stories, through: :story_assignments

  has_many :task_assignments
  has_many :tasks, through: :task_assignments
  
  has_many :task_comments
  has_many :tasks, through: :task_comments
  accepts_nested_attributes_for :task_comments


end
