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


class WikiPagesController < ApplicationController
  allow_unauthenticated_access only: [:index, :show]
  before_action :set_wiki_page, only: [:update, :destroy]

  # GET /wiki_pages
  # GET /wiki_pages.json
  def index
    @wiki_pages = WikiPage.all
  end

  # GET /wiki_pages/1
  # GET /wiki_pages/1.json
  def show

    @wiki = Wiki.find(params[:wiki_id])
    @wiki_page = @wiki.pages.where(title: params[:id]).take!



    @wiki_page.body.gsub!(/^# (.*)$/, '<h1>\1</h1>')
    @wiki_page.body.gsub!(/^## (.*)$/, '<h2>\1</h2>')
    @wiki_page.body.gsub!(/^### (.*)$/, '<h3>\1</h3>')
    @wiki_page.body.gsub!(/^#### (.*)$/, '<h4>\1</h4>')
    @wiki_page.body.gsub!(/^##### (.*)$/, '<h5>\1</h5>')
    @wiki_page.body.gsub!(/^###### (.*)$/, '<h6>\1</h6>')
    @wiki_page.body.gsub!(/\n\n/, '<br />')


    @wiki_page.body.gsub!(/\[\[(.*)\]\]/, '<a href="/wiki_pages/\1">\1</a>')

  end

  # GET /wiki_pages/new
  def new
    @wiki = Wiki.find(params[:wiki_id])
    @wiki_page = @wiki.pages.build
  end

  # GET /wiki_pages/1/edit
  def edit
    @wiki = Wiki.find(params[:wiki_id])
    @wiki_page = @wiki.pages.where(title: params[:id]).take!
  end

  # POST /wiki_pages
  # POST /wiki_pages.json
  def create
    @wiki = Wiki.find(params[:wiki_id])
    @wiki_page = @wiki.pages.build(wiki_page_params)
    @wiki_page.user_id = session[:user_id]
    @wiki_page.wiki_id = params[:wiki_id]
    @wiki_page.title.gsub!(/ /, '_')
    
    puts "\n\n\n\n"
    puts @wiki.id
    puts "\n\n\n\n"
    puts "\n\n\n\n"
    puts 'title' + @wiki_page.title
    puts 'body' + @wiki_page.body
    puts 'user_id' + @wiki_page.user_id.to_s
    puts 'wiki_id' + @wiki_page.wiki_id.to_s
    puts "\n\n\n\n"


    respond_to do |format|
      if @wiki_page.save
        format.html { redirect_to wiki_wiki_page_path(@wiki_page.wiki, @wiki_page.title), notice: 'Wiki page was successfully created.' }
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

  #  @title = params.require(:wiki_page).permit(:title)
  #  @body = params.require(:wiki_page).permit(:body)
  #  @wiki_page.title = @title[:title]
  #  @wiki_page.body = @body[:body]
  
    @new_data = wiki_page_params
    @new_data[:title].gsub!(/ /, '_')

    @wiki_page.user_id = session[:user_id]

    @wiki_page.update(@new_data)

    respond_to do |format|
      if @wiki_page.save
        format.html { redirect_to wiki_wiki_page_path(@wiki_page.wiki, @wiki_page.title), notice: 'Wiki page was successfully updated.' }
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
      params.require(:wiki_page).permit(:title, :body, :product_id, :story_id, :task_id)
    end
end
