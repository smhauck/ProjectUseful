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


class MeetingAssignmentsController < ApplicationController
  before_action :set_meeting_assignment, only: [:show, :edit, :update, :destroy]

  # GET /meeting_assignments
  # GET /meeting_assignments.json
  def index
    @meeting_assignments = MeetingAssignment.all
  end

  # GET /meeting_assignments/1
  # GET /meeting_assignments/1.json
  def show
  end

  # GET /meeting_assignments/new
  def new
    @meeting_assignment = MeetingAssignment.new
  end

  # GET /meeting_assignments/1/edit
  def edit
  end

  # POST /meeting_assignments
  # POST /meeting_assignments.json
  def create
      @meeting_assignment = MeetingAssignment.new(meeting_assignment_params)

    respond_to do |format|
      if @meeting_assignment.save
        format.html { redirect_to @meeting_assignment.meeting, notice: 'Meeting assignment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @meeting_assignment }
      else
        format.html { render action: 'new' }
        format.json { render json: @meeting_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /meeting_assignments/1
  # PATCH/PUT /meeting_assignments/1.json
  def update
    respond_to do |format|
      if @meeting_assignment.update(meeting_assignment_params)
        format.html { redirect_to @meeting_assignment, notice: 'Meeting assignment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @meeting_assignment.errors, status: :unprocessable_entity }
      end
    end
  end
  
  # DELETE /meeting_assignments/1
  # DELETE /meeting_assignments/1.json
  def destroy
    @meeting_assignment.destroy
    respond_to do |format|
      format.html { redirect_to request.referrer }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_meeting_assignment
      @meeting_assignment = MeetingAssignment.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def meeting_assignment_params
      params.require(:meeting_assignment).permit(:meeting_id, :user_id)
    end
end
