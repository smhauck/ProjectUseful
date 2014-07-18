# Copyright (C) 2014 William B. Hauck, http://www.wbhauck.com
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










class WikiPagesController < ApplicationController
	skip_before_action :authorize, only: [:index, :show]
  before_action :set_wiki_page, only: [:show, :edit, :update, :destroy]

  # GET /wiki_pages
  # GET /wiki_pages.json
  def index
    @wiki_pages = WikiPage.all
  end

  # GET /wiki_pages/1
  # GET /wiki_pages/1.json
  def show
  end

  # GET /wiki_pages/new
  def new
    @wiki_page = WikiPage.new
  end

  # GET /wiki_pages/1/edit
  def edit
  end

  # POST /wiki_pages
  # POST /wiki_pages.json
  def create
    @wiki_page = WikiPage.new(wiki_page_params)

    respond_to do |format|
      if @wiki_page.save
        format.html { redirect_to @wiki_page, notice: 'Wiki page was successfully created.' }
        format.json { render action: 'show', status: :created, location: @wiki_page }
      else
        format.html { render action: 'new' }
        format.json { render json: @wiki_page.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /wiki_pages/1
  # PATCH/PUT /wiki_pages/1.json
  def update
    respond_to do |format|
      if @wiki_page.update(wiki_page_params)
        format.html { redirect_to @wiki_page, notice: 'Wiki page was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @wiki_page.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /wiki_pages/1
  # DELETE /wiki_pages/1.json
  def destroy
    @wiki_page.destroy
    respond_to do |format|
      format.html { redirect_to wiki_pages_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_wiki_page
      @wiki_page = WikiPage.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def wiki_page_params
      params.require(:wiki_page).permit(:title, :body, :wiki_id, :version, :product_id, :project_id, :story_id, :task_id, :user_id)
    end
end
