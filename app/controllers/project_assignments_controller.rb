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


class ProjectAssignmentsController < ApplicationController
  before_action :resume_session
  before_action :set_project_assignment, only: [:show, :edit, :update, :destroy]

  # GET /project_assignments
  # GET /project_assignments.json
  def index
    @project_assignments = ProjectAssignment.all
  end

  # GET /project_assignments/1
  # GET /project_assignments/1.json
  def show
  end

  # GET /project_assignments/new
  def new
    @project_assignment = ProjectAssignment.new
  end

  # GET /project_assignments/1/edit
  def edit
  end

  # POST /project_assignments
  # POST /project_assignments.json
  def create
    @project_assignment = ProjectAssignment.new(project_assignment_params)

    respond_to do |format|
      if @project_assignment.save
        format.html { redirect_to @project_assignment.project, notice: 'Project assignment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @project_assignment }
      else
        format.html { render action: 'new' }
        format.json { render json: @project_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /project_assignments/1
  # PATCH/PUT /project_assignments/1.json
  def update
    respond_to do |format|
      if @project_assignment.update(project_assignment_params)
        format.html { redirect_to @project_assignment, notice: 'Project assignment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @project_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /project_assignments/1
  # DELETE /project_assignments/1.json
  def destroy
    @project_assignment.destroy
    respond_to do |format|
      format.html { redirect_to request.referrer }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_project_assignment
      @project_assignment = ProjectAssignment.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def project_assignment_params
      params.require(:project_assignment).permit(:project_id, :user_id)
    end
end
