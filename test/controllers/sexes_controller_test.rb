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

class SexesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @sex = sexes(:one)
  end

  test "should get index" do
    get sexes_url
    assert_response :success
  end

  test "should get new" do
    get new_sex_url
    assert_response :success
  end

  test "should create sex" do
    assert_difference('Sex.count') do
      post sexes_url, params: { sex: { active: @sex.active, description: @sex.description, name: @sex.name } }
    end

    assert_redirected_to sex_url(Sex.last)
  end

  test "should show sex" do
    get sex_url(@sex)
    assert_response :success
  end

  test "should get edit" do
    get edit_sex_url(@sex)
    assert_response :success
  end

  test "should update sex" do
    patch sex_url(@sex), params: { sex: { active: @sex.active, description: @sex.description, name: @sex.name } }
    assert_redirected_to sex_url(@sex)
  end

  test "should destroy sex" do
    assert_difference('Sex.count', -1) do
      delete sex_url(@sex)
    end

    assert_redirected_to sexes_url
  end
end
