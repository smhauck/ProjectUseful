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


class StoryStatusTypesController < ApplicationController
  before_action :set_story_status_type, only: [:show, :edit, :update, :destroy]

  # GET /story_status_types
  # GET /story_status_types.json
  def index
    @story_status_types = StoryStatusType.all
  end

  # GET /story_status_types/1
  # GET /story_status_types/1.json
  def show
  end

  # GET /story_status_types/new
  def new
    @story_status_type = StoryStatusType.new
  end

  # GET /story_status_types/1/edit
  def edit
  end

  # POST /story_status_types
  # POST /story_status_types.json
  def create
    @story_status_type = StoryStatusType.new(story_status_type_params)

    respond_to do |format|
      if @story_status_type.save
        format.html { redirect_to @story_status_type, notice: 'Story status type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @story_status_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @story_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /story_status_types/1
  # PATCH/PUT /story_status_types/1.json
  def update
    respond_to do |format|
      if @story_status_type.update(story_status_type_params)
        format.html { redirect_to @story_status_type, notice: 'Story status type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @story_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /story_status_types/1
  # DELETE /story_status_types/1.json
  def destroy
    @story_status_type.destroy
    respond_to do |format|
      format.html { redirect_to story_status_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_story_status_type
      @story_status_type = StoryStatusType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def story_status_type_params
      params.require(:story_status_type).permit(:title, :description)
    end
end
