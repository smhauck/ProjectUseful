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

class SlasControllerTest < ActionController::TestCase
  setup do
    @sla = slas(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:slas)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sla" do
    assert_difference('Sla.count') do
      post :create, sla: { description: @sla.description, name: @sla.name, product_id: @sla.product_id, response_due_at: @sla.response_due_at, solution_due_at: @sla.solution_due_at, workaround_due_at: @sla.workaround_due_at }
    end

    assert_redirected_to sla_path(assigns(:sla))
  end

  test "should show sla" do
    get :show, id: @sla
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @sla
    assert_response :success
  end

  test "should update sla" do
    patch :update, id: @sla, sla: { description: @sla.description, name: @sla.name, product_id: @sla.product_id, response_due_at: @sla.response_due_at, solution_due_at: @sla.solution_due_at, workaround_due_at: @sla.workaround_due_at }
    assert_redirected_to sla_path(assigns(:sla))
  end

  test "should destroy sla" do
    assert_difference('Sla.count', -1) do
      delete :destroy, id: @sla
    end

    assert_redirected_to slas_path
  end
end
