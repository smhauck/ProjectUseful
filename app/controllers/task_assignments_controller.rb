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


class TaskAssignmentsController < ApplicationController
  before_action :set_task_assignment, only: [:show, :edit, :update, :destroy]

  # GET /task_assignments
  # GET /task_assignments.json
  def index
    @task_assignments = TaskAssignment.all
  end

  # GET /task_assignments/1
  # GET /task_assignments/1.json
  def show
  end

  # GET /task_assignments/new
  def new
    @task_assignment = TaskAssignment.new
  end

  # GET /task_assignments/1/edit
  def edit
  end

  # POST /task_assignments
  # POST /task_assignments.json
  def create
    @task_assignment = TaskAssignment.new(task_assignment_params)

    respond_to do |format|
      if @task_assignment.save
        format.html { redirect_to @task_assignment.task, notice: 'Task assignment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @task_assignment }
      else
        format.html { render action: 'new' }
        format.json { render json: @task_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /task_assignments/1
  # PATCH/PUT /task_assignments/1.json
  def update
    respond_to do |format|
      if @task_assignment.update(task_assignment_params)
        format.html { redirect_to @task_assignment, notice: 'Task assignment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /task_assignments/1
  # DELETE /task_assignments/1.json
  def destroy
    @task_assignment.destroy
    respond_to do |format|
      format.html { redirect_to request.referrer }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task_assignment
      @task_assignment = TaskAssignment.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_assignment_params
      params.require(:task_assignment).permit(:task_id, :user_id)
    end
end
