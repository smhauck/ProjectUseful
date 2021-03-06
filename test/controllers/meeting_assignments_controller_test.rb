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

class MeetingAssignmentsControllerTest < ActionController::TestCase
  setup do
    @meeting_assignment = meeting_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:meeting_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create meeting_assignment" do
    assert_difference('MeetingAssignment.count') do
      post :create, meeting_assignment: { meeting_id: @meeting_assignment.meeting_id, user_id: @meeting_assignment.user_id }
    end

    assert_redirected_to meeting_assignment_path(assigns(:meeting_assignment))
  end

  test "should show meeting_assignment" do
    get :show, id: @meeting_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @meeting_assignment
    assert_response :success
  end

  test "should update meeting_assignment" do
    patch :update, id: @meeting_assignment, meeting_assignment: { meeting_id: @meeting_assignment.meeting_id, user_id: @meeting_assignment.user_id }
    assert_redirected_to meeting_assignment_path(assigns(:meeting_assignment))
  end

  test "should destroy meeting_assignment" do
    assert_difference('MeetingAssignment.count', -1) do
      delete :destroy, id: @meeting_assignment
    end

    assert_redirected_to meeting_assignments_path
  end
end
