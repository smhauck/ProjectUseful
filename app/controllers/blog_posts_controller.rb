# Copyright (C) 2017 William B. Hauck, http://www.wbhauck.com
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


class BlogPostsController < ApplicationController
  before_action :set_blog
  before_action :set_blog_post, only: [:show, :edit, :update, :destroy]
  skip_before_action :authorize, only: [:index, :show]

  # GET /blog_posts
  # GET /blog_posts.json
  def index
    @blog_posts = BlogPost.all
  end

  # GET /blog_posts/1
  # GET /blog_posts/1.json
  def show
  end

  # GET /blog_posts/new
  def new
    @blog_post = BlogPost.new
  end

  # GET /blog_posts/1/edit
  def edit
  end

  # POST /blog_posts
  # POST /blog_posts.json
  def create
    @blog_post = BlogPost.new(blog_post_params)
    @blog_post.user_id = session[:user_id]
    @blog_post.blog_id = @blog.id

      if @blog_post.save
        redirect_to @blog, notice: 'Blog post was successfully created.'
      else
        render action: 'new' 
      end
  end

  def update

    # only update if original author (user_id) is submitting it
    if @blog_post.user_id = session[:user_id]
      respond_to do |format|
        if @blog_post.update(blog_post_params)
          format.html { redirect_to [@blog, @blog_post], notice: 'Blog post was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: 'edit' }
          format.json { render json: @blog_post.errors, status: :unprocessable_entity }
        end
      end
    end
  end

  def destroy
    @blog_post.destroy
    respond_to do |format|
      format.html { redirect_to blog_posts_url }
      format.json { head :no_content }
    end
  end

  private
    def set_blog
      @blog = Blog.find(params[:blog_id])
    end

    def set_blog_post
      @blog_post = BlogPost.find(params[:id])
    end

    def blog_post_params
      params.require(:blog_post).permit(:title, :body, :publish_date, :blog_id)
    end
end
