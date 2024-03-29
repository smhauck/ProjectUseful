# Copyright (C) 2023 Shannon M. Hauck, http://www.smhauck.com
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


class Task < ActiveRecord::Base
  
#  validates :story, presence: true
  validates :title, presence: true
#  validates :status, presence: true




  # 2023-01-09 added optional since not all tasks need a product, project, etc.
  belongs_to :product, optional: true
  belongs_to :project, optional: true
  belongs_to :sprint, optional: true
  belongs_to :story, optional: true
  belongs_to :status, class_name: "TaskStatusType", foreign_key: "task_status_type_id"
  belongs_to :task_type, optional: true
  has_many :notes

  has_many :task_assignments
  has_many :users, through: :task_assignments
  accepts_nested_attributes_for :task_assignments
  
  has_many :task_comments
  has_many :user_comments, through: :task_comments
  accepts_nested_attributes_for :task_comments

end
