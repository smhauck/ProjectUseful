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


class NotePrivacyTypesController < ApplicationController
  before_action :set_note_privacy_type, only: [:show, :edit, :update, :destroy]

  # GET /note_privacy_types
  # GET /note_privacy_types.json
  def index
    @note_privacy_types = NotePrivacyType.all
  end

  # GET /note_privacy_types/1
  # GET /note_privacy_types/1.json
  def show
  end

  # GET /note_privacy_types/new
  def new
    @note_privacy_type = NotePrivacyType.new
  end

  # GET /note_privacy_types/1/edit
  def edit
  end

  # POST /note_privacy_types
  # POST /note_privacy_types.json
  def create
    @note_privacy_type = NotePrivacyType.new(note_privacy_type_params)

    respond_to do |format|
      if @note_privacy_type.save
        format.html { redirect_to @note_privacy_type, notice: 'Note privacy type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @note_privacy_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @note_privacy_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /note_privacy_types/1
  # PATCH/PUT /note_privacy_types/1.json
  def update
    respond_to do |format|
      if @note_privacy_type.update(note_privacy_type_params)
        format.html { redirect_to @note_privacy_type, notice: 'Note privacy type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @note_privacy_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /note_privacy_types/1
  # DELETE /note_privacy_types/1.json
  def destroy
    @note_privacy_type.destroy
    respond_to do |format|
      format.html { redirect_to note_privacy_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_note_privacy_type
      @note_privacy_type = NotePrivacyType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def note_privacy_type_params
      params.require(:note_privacy_type).permit(:title, :code, :description)
    end
end
