class IssueTypesController < ApplicationController
  before_action :set_issue_type, only: [:show, :edit, :update, :destroy]

  # GET /issue_types
  # GET /issue_types.json
  def index
    @issue_types = IssueType.all
  end

  # GET /issue_types/1
  # GET /issue_types/1.json
  def show
  end

  # GET /issue_types/new
  def new
    @issue_type = IssueType.new
  end

  # GET /issue_types/1/edit
  def edit
  end

  # POST /issue_types
  # POST /issue_types.json
  def create
    @issue_type = IssueType.new(issue_type_params)

    respond_to do |format|
      if @issue_type.save
        format.html { redirect_to @issue_type, notice: 'Issue type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @issue_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @issue_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /issue_types/1
  # PATCH/PUT /issue_types/1.json
  def update
    respond_to do |format|
      if @issue_type.update(issue_type_params)
        format.html { redirect_to @issue_type, notice: 'Issue type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @issue_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /issue_types/1
  # DELETE /issue_types/1.json
  def destroy
    @issue_type.destroy
    respond_to do |format|
      format.html { redirect_to issue_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_issue_type
      @issue_type = IssueType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def issue_type_params
      params.require(:issue_type).permit(:title, :description)
    end
end
