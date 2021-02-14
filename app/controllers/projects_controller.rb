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


class ProjectsController < ApplicationController
  skip_before_action :authorize, only: [:active, :complete, :index, :show]
  before_action :set_project, only: [:show, :edit, :update, :destroy]

  # GET /projects
  # GET /projects.json
  def index
    @projects = Project.all.order(:title)
  end

  # GET /projects/1
  # GET /projects/1.json
  def show
    @project_assignment = ProjectAssignment.new
  end

  def my
    @user = User.find(session[:user_id])
    @projects = @user.projects
  end

  def active
    @projects = Project.joins(:status).where(project_status_types: { alive: true })
  end

  def complete
    @projects = Project.joins(:status).where(project_status_types: { code: 'complete'})
  end

  def myactive
    @user = User.find(session[:user_id])
    @projects = @user.projects.joins(:status).where(project_status_types: { alive: '1'})
  end
 
  def mycomplete
    @user = User.find(session[:user_id])
    @projects = @user.projects.joins(:status).where(project_status_types: { id: 3 })
  end
 
  
  # GET /projects/new
  def new
    @project = Project.new
    if params[:product]
      @project.product_id = params[:product]
      @product = Product.find(params[:product])
      @product_selected = 1
    else
      @product = Product.new
    end
  end

  # GET /projects/1/edit
  def edit
  end

  # POST /projects
  # POST /projects.json
  def create
    @project = Project.new(project_params)

    respond_to do |format|
      if @project.save
        format.html { redirect_to @project, notice: 'Project was successfully created.' }
        format.json { render action: 'show', status: :created, location: @project }
      else
        format.html { render action: 'new' }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /projects/1
  # PATCH/PUT /projects/1.json
  def update
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to @project, notice: 'Project was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.json
  def destroy
    @project.destroy
    respond_to do |format|
      format.html { redirect_to projects_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_project
      @project = Project.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def project_params
      params.require(:project).permit(:title, :short_title, :description, :sched_start_date, :actual_start_date, :sched_completion_date, :actual_completion_date, :creator_id, :owner_id, :product_id, :project_status_type_id)
    end
end
