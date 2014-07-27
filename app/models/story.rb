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


class Story < ActiveRecord::Base
  
  validates :title, presence: true
  validates :requestor, presence: true
  validates :status, presence: true
  validates :product, presence: true
  validates :creator, presence: true



  belongs_to :product
  belongs_to :sprint
  belongs_to :status, class_name: "StoryStatusType", foreign_key: "story_status_type_id"
  belongs_to :requestor, class_name: "User", foreign_key: "requestor_id"
  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  has_many :tasks

  has_many :story_assignments
  has_many :users, through: :story_assignments
  accepts_nested_attributes_for :story_assignments

end
