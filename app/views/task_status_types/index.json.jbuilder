<%
=begin
%>

Copyright (C) 2020 Shannon M. Hauck, http://www.smhauck.com

This file is part of Project Useful.

Project Useful is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Project Useful is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Project Useful.  If not, see <http://www.gnu.org/licenses/>.

<%
=end
%>


json.array!(@task_status_types) do |task_status_type|
  json.extract! task_status_type, :id, :title, :description
  json.url task_status_type_url(task_status_type, format: :json)
end
