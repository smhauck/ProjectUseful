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


class TaskStatusTypesController < ApplicationController
  before_action :resume_session
  before_action :set_task_status_type, only: [:show, :edit, :update, :destroy]

  # GET /task_status_types
  # GET /task_status_types.json
  def index
    @task_status_types = TaskStatusType.all
  end

  # GET /task_status_types/1
  # GET /task_status_types/1.json
  def show
  end

  # GET /task_status_types/new
  def new
    @task_status_type = TaskStatusType.new
  end

  # GET /task_status_types/1/edit
  def edit
  end

  # POST /task_status_types
  # POST /task_status_types.json
  def create
    @task_status_type = TaskStatusType.new(task_status_type_params)

    respond_to do |format|
      if @task_status_type.save
        format.html { redirect_to @task_status_type, notice: 'Task status type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @task_status_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @task_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /task_status_types/1
  # PATCH/PUT /task_status_types/1.json
  def update
    respond_to do |format|
      if @task_status_type.update(task_status_type_params)
        format.html { redirect_to @task_status_type, notice: 'Task status type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /task_status_types/1
  # DELETE /task_status_types/1.json
  def destroy
    @task_status_type.destroy
    respond_to do |format|
      format.html { redirect_to task_status_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task_status_type
      @task_status_type = TaskStatusType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_status_type_params
      params.require(:task_status_type).permit(:title, :alive, :description)
    end
end
