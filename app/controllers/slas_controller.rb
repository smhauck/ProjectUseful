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


class SlasController < ApplicationController
  before_action :set_sla, only: [:show, :edit, :update, :destroy]

  # GET /slas
  # GET /slas.json
  def index
    @slas = Sla.all
  end

  # GET /slas/1
  # GET /slas/1.json
  def show
  end

  # GET /slas/new
  def new
    @sla = Sla.new
  end

  # GET /slas/1/edit
  def edit
  end

  # POST /slas
  # POST /slas.json
  def create
    @sla = Sla.new(sla_params)

    respond_to do |format|
      if @sla.save
        format.html { redirect_to @sla, notice: 'Sla was successfully created.' }
        format.json { render action: 'show', status: :created, location: @sla }
      else
        format.html { render action: 'new' }
        format.json { render json: @sla.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /slas/1
  # PATCH/PUT /slas/1.json
  def update
    respond_to do |format|
      if @sla.update(sla_params)
        format.html { redirect_to @sla, notice: 'Sla was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @sla.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /slas/1
  # DELETE /slas/1.json
  def destroy
    @sla.destroy
    respond_to do |format|
      format.html { redirect_to slas_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sla
      @sla = Sla.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sla_params
      params.require(:sla).permit(:name, :description, :product_id, :response_due_at, :workaround_due_at, :solution_due_at)
    end
end
