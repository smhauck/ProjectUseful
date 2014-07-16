class SprintStatusTypesController < ApplicationController
  before_action :set_sprint_status_type, only: [:show, :edit, :update, :destroy]

  # GET /sprint_status_types
  # GET /sprint_status_types.json
  def index
    @sprint_status_types = SprintStatusType.all
  end

  # GET /sprint_status_types/1
  # GET /sprint_status_types/1.json
  def show
  end

  # GET /sprint_status_types/new
  def new
    @sprint_status_type = SprintStatusType.new
  end

  # GET /sprint_status_types/1/edit
  def edit
  end

  # POST /sprint_status_types
  # POST /sprint_status_types.json
  def create
    @sprint_status_type = SprintStatusType.new(sprint_status_type_params)

    respond_to do |format|
      if @sprint_status_type.save
        format.html { redirect_to @sprint_status_type, notice: 'Sprint status type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @sprint_status_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @sprint_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /sprint_status_types/1
  # PATCH/PUT /sprint_status_types/1.json
  def update
    respond_to do |format|
      if @sprint_status_type.update(sprint_status_type_params)
        format.html { redirect_to @sprint_status_type, notice: 'Sprint status type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @sprint_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sprint_status_types/1
  # DELETE /sprint_status_types/1.json
  def destroy
    @sprint_status_type.destroy
    respond_to do |format|
      format.html { redirect_to sprint_status_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sprint_status_type
      @sprint_status_type = SprintStatusType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sprint_status_type_params
      params.require(:sprint_status_type).permit(:title, :description)
    end
end
