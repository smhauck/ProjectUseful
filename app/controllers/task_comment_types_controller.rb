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


class TaskCommentTypesController < ApplicationController
  before_action :resume_session
  before_action :set_task_comment_type, only: [:show, :edit, :update, :destroy]

  # GET /task_comment_types
  # GET /task_comment_types.json
  def index
    @task_comment_types = TaskCommentType.all
  end

  # GET /task_comment_types/1
  # GET /task_comment_types/1.json
  def show
  end

  # GET /task_comment_types/new
  def new
    @task_comment_type = TaskCommentType.new
  end

  # GET /task_comment_types/1/edit
  def edit
  end

  # POST /task_comment_types
  # POST /task_comment_types.json
  def create
    @task_comment_type = TaskCommentType.new(task_comment_type_params)

    respond_to do |format|
      if @task_comment_type.save
        format.html { redirect_to @task_comment_type, notice: 'Task comment type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @task_comment_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @task_comment_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /task_comment_types/1
  # PATCH/PUT /task_comment_types/1.json
  def update
    respond_to do |format|
      if @task_comment_type.update(task_comment_type_params)
        format.html { redirect_to @task_comment_type, notice: 'Task comment type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task_comment_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /task_comment_types/1
  # DELETE /task_comment_types/1.json
  def destroy
    @task_comment_type.destroy
    respond_to do |format|
      format.html { redirect_to task_comment_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task_comment_type
      @task_comment_type = TaskCommentType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_comment_type_params
      params.require(:task_comment_type).permit(:title, :description)
    end
end
