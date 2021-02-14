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


class EmailTypesController < ApplicationController
  before_action :set_email_type, only: [:show, :edit, :update, :destroy]

  # GET /email_types
  # GET /email_types.json
  def index
    @email_types = EmailType.all
  end

  # GET /email_types/1
  # GET /email_types/1.json
  def show
  end

  # GET /email_types/new
  def new
    @email_type = EmailType.new
  end

  # GET /email_types/1/edit
  def edit
  end

  # POST /email_types
  # POST /email_types.json
  def create
    @email_type = EmailType.new(email_type_params)

    respond_to do |format|
      if @email_type.save
        format.html { redirect_to @email_type, notice: 'Email type was successfully created.' }
        format.json { render :show, status: :created, location: @email_type }
      else
        format.html { render :new }
        format.json { render json: @email_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /email_types/1
  # PATCH/PUT /email_types/1.json
  def update
    respond_to do |format|
      if @email_type.update(email_type_params)
        format.html { redirect_to @email_type, notice: 'Email type was successfully updated.' }
        format.json { render :show, status: :ok, location: @email_type }
      else
        format.html { render :edit }
        format.json { render json: @email_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /email_types/1
  # DELETE /email_types/1.json
  def destroy
    @email_type.destroy
    respond_to do |format|
      format.html { redirect_to email_types_url, notice: 'Email type was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_email_type
      @email_type = EmailType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def email_type_params
      params.require(:email_type).permit(:name, :description)
    end
end
