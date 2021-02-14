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


class SexesController < ApplicationController
  before_action :set_sex, only: [:show, :edit, :update, :destroy]

  # GET /sexes
  # GET /sexes.json
  def index
    @sexes = Sex.all
  end

  # GET /sexes/1
  # GET /sexes/1.json
  def show
  end

  # GET /sexes/new
  def new
    @sex = Sex.new
  end

  # GET /sexes/1/edit
  def edit
  end

  # POST /sexes
  # POST /sexes.json
  def create
    @sex = Sex.new(sex_params)

    respond_to do |format|
      if @sex.save
        format.html { redirect_to @sex, notice: 'Sex was successfully created.' }
        format.json { render :show, status: :created, location: @sex }
      else
        format.html { render :new }
        format.json { render json: @sex.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /sexes/1
  # PATCH/PUT /sexes/1.json
  def update
    respond_to do |format|
      if @sex.update(sex_params)
        format.html { redirect_to @sex, notice: 'Sex was successfully updated.' }
        format.json { render :show, status: :ok, location: @sex }
      else
        format.html { render :edit }
        format.json { render json: @sex.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sexes/1
  # DELETE /sexes/1.json
  def destroy
    @sex.destroy
    respond_to do |format|
      format.html { redirect_to sexes_url, notice: 'Sex was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sex
      @sex = Sex.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sex_params
      params.require(:sex).permit(:name, :description, :active)
    end
end
