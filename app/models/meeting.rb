# Copyright (C) 2017 William B. Hauck, http://www.wbhauck.com
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


class Meeting < ActiveRecord::Base

  validates :owner, presence: true

  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :owner, class_name: "User", foreign_key: "owner_id"
  belongs_to :product
  belongs_to :project
  
  has_many :meeting_assignments
  has_many :users, through: :meeting_assignments
  accepts_nested_attributes_for :meeting_assignments
  
end
