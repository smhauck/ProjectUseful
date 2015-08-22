# Copyright (C) 2015 William B. Hauck, http://www.wbhauck.com
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


class TaskCommentsController < ApplicationController
  before_action :set_task_comment, only: [:show, :edit, :update, :destroy]

  # GET /task_comments
  # GET /task_comments.json
  def index
    @task_comments = TaskComment.all
  end

  # GET /task_comments/1
  # GET /task_comments/1.json
  def show
  end

  # GET /task_comments/new
  def new
    @task_comment = TaskComment.new
    if params[:task]
      @task_comment.task_id = params[:task]
      @task = Task.find(params[:task])
      @task_selected = 1
    else
      @task = Task.new
    end
  end

  # GET /task_comments/1/edit
  def edit
  end

  # POST /task_comments
  # POST /task_comments.json
  def create
    @task_comment = TaskComment.new(task_comment_params)
    @task_comment.user_id = session[:user_id]

    respond_to do |format|
      if @task_comment.save
        format.html { redirect_to @task_comment.task, notice: 'Task comment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @task_comment }
      else
        format.html { render action: 'new' }
        format.json { render json: @task_comment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /task_comments/1
  # PATCH/PUT /task_comments/1.json
  def update
    respond_to do |format|
      if @task_comment.update(task_comment_params)
        format.html { redirect_to @task_comment, notice: 'Task comment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task_comment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /task_comments/1
  # DELETE /task_comments/1.json
  def destroy
    @task_comment.destroy
    respond_to do |format|
      format.html { redirect_to task_comments_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task_comment
      @task_comment = TaskComment.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_comment_params
      params.require(:task_comment).permit(:comments, :date_of_work, :hours, :comment, :task_id, :user_id)
    end
end
