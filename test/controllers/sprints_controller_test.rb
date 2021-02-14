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

class SprintsControllerTest < ActionController::TestCase
  setup do
    @sprint = sprints(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sprints)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sprint" do
    assert_difference('Sprint.count') do
      post :create, sprint: { alive: @sprint.alive, notes: @sprint.notes, start_date: @sprint.start_date, end_date: @sprint.end_date }
    end

    assert_redirected_to sprint_path(assigns(:sprint))
  end

  test "should show sprint" do
    get :show, id: @sprint
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @sprint
    assert_response :success
  end

  test "should update sprint" do
    patch :update, id: @sprint, sprint: { alive: @sprint.alive, notes: @sprint.notes, start_date: @sprint.start_date, end_date: @sprint.end_date }
    assert_redirected_to sprint_path(assigns(:sprint))
  end

  test "should destroy sprint" do
    assert_difference('Sprint.count', -1) do
      delete :destroy, id: @sprint
    end

    assert_redirected_to sprints_path
  end
end
