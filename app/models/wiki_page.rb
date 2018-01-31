# Copyright (C) 2018 William B. Hauck, http://www.wbhauck.com
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


class WikiPage < ActiveRecord::Base
  
  validates :title, presence: true, uniqueness: { scope: :wiki, message: "Page titles must be unique within a given Wiki" }
  validates :wiki_id, presence: true


  belongs_to :wiki
  belongs_to :product
  belongs_to :story
  belongs_to :task
  belongs_to :user

  accepts_nested_attributes_for :wiki

end
