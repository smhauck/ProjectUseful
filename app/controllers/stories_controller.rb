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


class StoriesController < ApplicationController
  allow_unauthenticated_access only: [:index, :show, :active, :complete]
  before_action :resume_session
  before_action :set_story, only: [:show, :edit, :update, :destroy]

  # GET /stories
  # GET /stories.json
  def index
    if session[:user_id]
      @stories = Story.all
    else
      @stories = Story.joins(:product).where(products: { public: true })
    end
  end



  # GET /stories/active
  # GET /stories/active.json
  def active
   @stories = Story.joins(:status).where(story_status_types: { alive: true })
  end

  # GET /stories/complete
  # GET /stories/complete.json
  def complete
   @stories = Story.joins(:status).where(story_status_types: { code: 'complete'})
  end




  # GET /stories/1
  # GET /stories/1.json
  def show
    @story_assignment = StoryAssignment.new
  end

  # GET /stories/new
  def new
    @story = Story.new
    if params[:product]
      @story.product_id = params[:product]
    else
      @product = Product.new
    end
    @projects = Project.joins(:status).where(project_status_types: { alive: true }).order(:title)
    @products = Product.joins(:status).where(product_status_types: { alive: true }).order(:title)
    @sprints = Sprint.joins(:status).where(sprint_status_types: { alive: true }).order(:start_date)
  end

  # GET /stories/1/edit
  def edit
    @products = Product.joins(:status).where(product_status_types: { alive: true }).order(:title)
    @projects = Project.joins(:status).where(project_status_types: { alive: true }).order(:title)
    @sprints = Sprint.joins(:status).where(sprint_status_types: { alive: true }).order(:start_date)
  end

  # POST /stories
  # POST /stories.json
  def create
    @story = Story.new(story_params)
    @story.creator_id = session[:user_id]

    respond_to do |format|
      if @story.save
        format.html { redirect_to @story, notice: 'Story was successfully created.' }
        format.json { render action: 'show', status: :created, location: @story }
      else
        format.html { render action: 'new' }
        format.json { render json: @story.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /stories/1
  # PATCH/PUT /stories/1.json
  def update
    respond_to do |format|
      if @story.update(story_params)
        format.html { redirect_to @story, notice: 'Story was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @story.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /stories/1
  # DELETE /stories/1.json
  def destroy
    @story.destroy
    respond_to do |format|
      format.html { redirect_to stories_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_story
      @tmpstory = Story.find(params[:id])
      if session[:user_id]
        @story = @tmpstory
      elsif @tmpstory.product.public == true
        @story = @tmpstory
      else
        redirect_to root_url
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def story_params
      params.require(:story).permit(:alive, :story_status_type_id, :title, :description, :requestor_id, :completion_notes, :product_id, :project_id, :sprint_id, :estimated_hours, :points, :story_type_id)
    end
end
