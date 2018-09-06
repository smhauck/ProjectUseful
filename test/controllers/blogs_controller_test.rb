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

class BlogsControllerTest < ActionController::TestCase
  setup do
    @blog = blogs(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:blogs)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create blog" do
    assert_difference('Blog.count') do
      post :create, blog: { creator_id: @blog.creator_id, description: @blog.description, title: @blog.title }
    end

    assert_redirected_to blog_path(assigns(:blog))
  end

  test "should show blog" do
    get :show, id: @blog
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @blog
    assert_response :success
  end

  test "should update blog" do
    patch :update, id: @blog, blog: { creator_id: @blog.creator_id, description: @blog.description, title: @blog.title }
    assert_redirected_to blog_path(assigns(:blog))
  end

  test "should destroy blog" do
    assert_difference('Blog.count', -1) do
      delete :destroy, id: @blog
    end

    assert_redirected_to blogs_path
  end
end
