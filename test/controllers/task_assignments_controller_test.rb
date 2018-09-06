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


require 'test_helper'

class TaskAssignmentsControllerTest < ActionController::TestCase
  setup do
    @task_assignment = task_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_assignment" do
    assert_difference('TaskAssignment.count') do
      post :create, task_assignment: { task_id: @task_assignment.task_id, user_id: @task_assignment.user_id }
    end

    assert_redirected_to task_path(assigns(:task_id))
  end

  test "should show task_assignment" do
    get :show, id: @task_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_assignment
    assert_response :success
  end

  test "should update task_assignment" do
    patch :update, id: @task_assignment, task_assignment: { task_id: @task_assignment.task_id, user_id: @task_assignment.user_id }
    assert_redirected_to task_assignment_path(assigns(:task_assignment))
  end

  test "should destroy task_assignment" do
    assert_difference('TaskAssignment.count', -1) do
      delete :destroy, id: @task_assignment
    end

  end
end
