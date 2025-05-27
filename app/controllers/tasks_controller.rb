# Copyright (C) Shannon M. Hauck, http://www.smhauck.com
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


class TasksController < ApplicationController
  allow_unauthenticated_access only: [:active, :complete, :index, :search, :show]
  before_action :set_task, only: [:show, :edit, :update, :destroy]
  before_action :resume_session


  # GET /tasks
  # GET /tasks.json
  def index
    if session[:user_id]
      @tasks = Task.all
    else
      @tasks = Task.joins(story: :product).where(products: { public: true })
    end
  end

  def alltoday
    time = Time.new
    the_date = time.strftime("%Y-%m-%d")
    @tasks = Task.where("sched_start_date <= ? OR actual_start_date <= ?", the_date, the_date).joins(:status).where(task_status_types: {alive: true})
  end
  
  def mytoday
    time = Time.new
    the_date = time.strftime("%Y-%m-%d")
    @user = User.find(session[:user_id])
    @tasks = @user.tasks.where("sched_start_date <= ? OR actual_start_date <= ?", the_date, the_date).joins(:status).where(task_status_types: {alive: true})
  end




  # GET /tasks/my
  # GET /tasks/my.json
  def my
    @user = User.find(session[:user_id])
    @tasks = @user.tasks
  end

  # GET /tasks/active
  # GET /tasks/active.json
  def active
    @tasks = Task.joins(:status).where(task_status_types: { alive: true })
  end

  # GET /tasks/complete
  # GET /tasks/complete.json
  def complete
    @tasks = Task.joins(:status).where(task_status_types: { code: 'complete'})
  end

  # GET /tasks/myactive
  def myactive
    @user = User.find(session[:user_id])
    @tasks = @user.tasks.joins(:status).where(task_status_types: { alive: '1'})
  end
 
  # GET /tasks/mycomplete
  def mycomplete
    @user = User.find(session[:user_id])
    @tasks = @user.tasks.joins(:status).where(task_status_types: { id: 4 })
  end
 
  

  def search
    @tasks = Task.where('MATCH (title,description) AGAINST (? in boolean mode)',params[:criteria])
  end


  
  # GET /tasks/1
  # GET /tasks/1.json
  def show
    @task_assignment = TaskAssignment.new
    @task_comment = TaskComment.new
  end

  # GET /tasks/new
  def new
    @task = Task.new
    if params[:project]
      @task.project_id = params[:project]
      @project = Project.find(params[:project])
      @project_selected = 1
    else
      @project = Project.new
    end
    if params[:story]
      @task.story_id = params[:story]
      @story = Story.find(params[:story])
      @story_selected = 1
    else
      @story = Story.new
    end
  end

  # GET /tasks/1/edit
  def edit
  end

  # POST /tasks
  # POST /tasks.json
  def create
    @task = Task.new(task_params)

    respond_to do |format|
      if @task.save
        format.html { redirect_to @task, notice: 'Task was successfully created.' }
        format.json { render action: 'show', status: :created, location: @task }
      else
        format.html { render action: 'new' }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tasks/1
  # PATCH/PUT /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params)
        format.html { redirect_to @task, notice: 'Task was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.json
  def destroy
    @task.destroy
    respond_to do |format|
      format.html { redirect_to tasks_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task
      @tmptask = Task.find(params[:id])
      if session[:user_id]
        @task = @tmptask
      elsif @tmptask.&story.product.public == true
        @task = @tmptask
      else
        redirect_to root_url
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_params
      params.require(:task).permit(:alive, :task_status_type_id, :estimated_hours, :title, :description, :product_id, :project_id, :sprint_id, :story_id, :sched_start_date, :actual_start_date, :sched_completion_date, :actual_completion_date)
    end
end
