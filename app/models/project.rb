# Copyright (C) 2015 William B. Hauck, http://www.wbhauck.com
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


class Project < ActiveRecord::Base

  validates :title, presence: true
  # validates :owner, presence: true


  has_many :tasks
  has_many :meetings
  has_many :notes
  has_many :wikis
  has_many :wiki_pages
  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :owner, class_name: "User", foreign_key: "owner_id"
  belongs_to :product, class_name: "Product", foreign_key: "product_id"
  belongs_to :status, class_name: "ProjectStatusType", foreign_key: "project_status_type_id"

  has_many :project_assignments
  has_many :users, through: :project_assignments
  accepts_nested_attributes_for :project_assignments

end
