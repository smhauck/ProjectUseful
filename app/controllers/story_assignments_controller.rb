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


class StoryAssignmentsController < ApplicationController
  before_action :set_story_assignment, only: [:show, :edit, :update, :destroy]

  # GET /story_assignments
  # GET /story_assignments.json
  def index
    @story_assignments = StoryAssignment.all
  end

  # GET /story_assignments/1
  # GET /story_assignments/1.json
  def show
  end

  # GET /story_assignments/new
  def new
    @story_assignment = StoryAssignment.new
  end

  # GET /story_assignments/1/edit
  def edit
  end

  # POST /story_assignments
  # POST /story_assignments.json
  def create
    @story_assignment = StoryAssignment.new(story_assignment_params)

    respond_to do |format|
      if @story_assignment.save
        format.html { redirect_to @story_assignment.story, notice: 'Story assignment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @story_assignment }
      else
        format.html { render action: 'new' }
        format.json { render json: @story_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /story_assignments/1
  # PATCH/PUT /story_assignments/1.json
  def update
    respond_to do |format|
      if @story_assignment.update(story_assignment_params)
        format.html { redirect_to @story_assignment, notice: 'Story assignment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @story_assignment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /story_assignments/1
  # DELETE /story_assignments/1.json
  def destroy
    @story_assignment.destroy
    respond_to do |format|
      format.html { redirect_to @story_assignment.story }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_story_assignment
      @story_assignment = StoryAssignment.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def story_assignment_params
      params.require(:story_assignment).permit(:story_id, :user_id)
    end
end
