class TaskTypesController < ApplicationController
  before_action :set_task_type, only: [:show, :edit, :update, :destroy]

  # GET /task_types
  # GET /task_types.json
  def index
    @task_types = TaskType.all
  end

  # GET /task_types/1
  # GET /task_types/1.json
  def show
  end

  # GET /task_types/new
  def new
    @task_type = TaskType.new
  end

  # GET /task_types/1/edit
  def edit
  end

  # POST /task_types
  # POST /task_types.json
  def create
    @task_type = TaskType.new(task_type_params)

    respond_to do |format|
      if @task_type.save
        format.html { redirect_to @task_type, notice: 'Task type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @task_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @task_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /task_types/1
  # PATCH/PUT /task_types/1.json
  def update
    respond_to do |format|
      if @task_type.update(task_type_params)
        format.html { redirect_to @task_type, notice: 'Task type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @task_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /task_types/1
  # DELETE /task_types/1.json
  def destroy
    @task_type.destroy
    respond_to do |format|
      format.html { redirect_to task_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_task_type
      @task_type = TaskType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def task_type_params
      params.require(:task_type).permit(:title, :description)
    end
end
