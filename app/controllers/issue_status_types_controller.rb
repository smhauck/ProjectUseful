# Copyright (C) 2015 William B. Hauck, http://www.wbhauck.com
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


class IssueStatusTypesController < ApplicationController
  before_action :set_issue_status_type, only: [:show, :edit, :update, :destroy]

  # GET /issue_status_types
  # GET /issue_status_types.json
  def index
    @issue_status_types = IssueStatusType.all
  end

  # GET /issue_status_types/1
  # GET /issue_status_types/1.json
  def show
  end

  # GET /issue_status_types/new
  def new
    @issue_status_type = IssueStatusType.new
  end

  # GET /issue_status_types/1/edit
  def edit
  end

  # POST /issue_status_types
  # POST /issue_status_types.json
  def create
    @issue_status_type = IssueStatusType.new(issue_status_type_params)

    respond_to do |format|
      if @issue_status_type.save
        format.html { redirect_to @issue_status_type, notice: 'Issue status type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @issue_status_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @issue_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /issue_status_types/1
  # PATCH/PUT /issue_status_types/1.json
  def update
    respond_to do |format|
      if @issue_status_type.update(issue_status_type_params)
        format.html { redirect_to @issue_status_type, notice: 'Issue status type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @issue_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /issue_status_types/1
  # DELETE /issue_status_types/1.json
  def destroy
    @issue_status_type.destroy
    respond_to do |format|
      format.html { redirect_to issue_status_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_issue_status_type
      @issue_status_type = IssueStatusType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def issue_status_type_params
      params.require(:issue_status_type).permit(:title, :code, :description)
    end
end
