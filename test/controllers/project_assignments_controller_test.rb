# Copyright (C) 2020 Shannon M. Hauck, http://www.smhauck.com
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


require 'test_helper'

class ProjectAssignmentsControllerTest < ActionController::TestCase
  setup do
    @project_assignment = project_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:project_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create project_assignment" do
    assert_difference('ProjectAssignment.count') do
      post :create, project_assignment: { project_id: @project_assignment.project_id, user_id: @project_assignment.user_id }
    end

    assert_redirected_to project_assignment_path(assigns(:project_assignment))
  end

  test "should show project_assignment" do
    get :show, id: @project_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @project_assignment
    assert_response :success
  end

  test "should update project_assignment" do
    patch :update, id: @project_assignment, project_assignment: { project_id: @project_assignment.project_id, user_id: @project_assignment.user_id }
    assert_redirected_to project_assignment_path(assigns(:project_assignment))
  end

  test "should destroy project_assignment" do
    assert_difference('ProjectAssignment.count', -1) do
      delete :destroy, id: @project_assignment
    end

    assert_redirected_to project_assignments_path
  end
end
