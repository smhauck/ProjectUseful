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

class BlogPostsControllerTest < ActionController::TestCase
  setup do
    @blog_post = blog_posts(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:blog_posts)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create blog_post" do
    assert_difference('BlogPost.count') do
      post :create, blog_post: { blog_id: @blog_post.blog_id, body: @blog_post.body, publish_date: @blog_post.publish_date, title: @blog_post.title, user_id: @blog_post.user_id }
    end

    assert_redirected_to blog_post_path(assigns(:blog_post))
  end

  test "should show blog_post" do
    get :show, id: @blog_post
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @blog_post
    assert_response :success
  end

  test "should UPDATE blog_post" do
    patch :update, id: @blog_post, blog_post: { blog_id: @blog_post.blog_id, body: @blog_post.body, publish_date: @blog_post.publish_date, title: @blog_post.title, user_id: @blog_post.user_id }
    assert_redirected_to blog_post_path(assigns(:blog_post))
  end

  test "should destroy blog_post" do
    assert_difference('BlogPost.count', -1) do
      delete :destroy, id: @blog_post
    end

    assert_redirected_to blog_posts_path
  end
end
