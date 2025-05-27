# Copyright (C) Shannon M. Hauck, http://www.smhauck.com
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


class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :username, presence: true, uniqueness: { case_sensitive: false }

  has_many :requests, class_name: "Story", foreign_key: "requestor_id"
  has_many :notes, class_name: "Note", foreign_key: "creator_id"
  has_many :blogs, class_name: "Blog", foreign_key: "creator_id"
  has_many :wikis, class_name: "Wiki", foreign_key: "creator_id"

  has_many :meeting_assignments
  has_many :meetings, through: :meeting_assignments
  
  has_many :project_assignments
  has_many :projects, through: :project_assignments
  
  has_many :story_assignments
  has_many :stories, through: :story_assignments

  has_many :task_assignments
  has_many :tasks, through: :task_assignments
  
  has_many :task_comments
#  has_many :tasks, through: :task_comments
  accepts_nested_attributes_for :task_comments
  
  has_many :project_comments
#  has_many :projects, through: :project_comments
  accepts_nested_attributes_for :project_comments

end
