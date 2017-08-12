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


class ProjectStatusTypesController < ApplicationController
  before_action :set_project_status_type, only: [:show, :edit, :update, :destroy]

  # GET /project_status_types
  # GET /project_status_types.json
  def index
    @project_status_types = ProjectStatusType.all
  end

  # GET /project_status_types/1
  # GET /project_status_types/1.json
  def show
  end

  # GET /project_status_types/new
  def new
    @project_status_type = ProjectStatusType.new
  end

  # GET /project_status_types/1/edit
  def edit
  end

  # POST /project_status_types
  # POST /project_status_types.json
  def create
    @project_status_type = ProjectStatusType.new(project_status_type_params)

    respond_to do |format|
      if @project_status_type.save
        format.html { redirect_to @project_status_type, notice: 'Project status type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @project_status_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @project_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /project_status_types/1
  # PATCH/PUT /project_status_types/1.json
  def update
    respond_to do |format|
      if @project_status_type.update(project_status_type_params)
        format.html { redirect_to @project_status_type, notice: 'Project status type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @project_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /project_status_types/1
  # DELETE /project_status_types/1.json
  def destroy
    @project_status_type.destroy
    respond_to do |format|
      format.html { redirect_to project_status_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_project_status_type
      @project_status_type = ProjectStatusType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def project_status_type_params
      params.require(:project_status_type).permit(:title, :alive, :code, :background_color, :text_color, :description)
    end
end
