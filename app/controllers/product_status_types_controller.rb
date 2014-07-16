class ProductStatusTypesController < ApplicationController
  before_action :set_product_status_type, only: [:show, :edit, :update, :destroy]

  # GET /product_status_types
  # GET /product_status_types.json
  def index
    @product_status_types = ProductStatusType.all
  end

  # GET /product_status_types/1
  # GET /product_status_types/1.json
  def show
  end

  # GET /product_status_types/new
  def new
    @product_status_type = ProductStatusType.new
  end

  # GET /product_status_types/1/edit
  def edit
  end

  # POST /product_status_types
  # POST /product_status_types.json
  def create
    @product_status_type = ProductStatusType.new(product_status_type_params)

    respond_to do |format|
      if @product_status_type.save
        format.html { redirect_to @product_status_type, notice: 'Product status type was successfully created.' }
        format.json { render action: 'show', status: :created, location: @product_status_type }
      else
        format.html { render action: 'new' }
        format.json { render json: @product_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /product_status_types/1
  # PATCH/PUT /product_status_types/1.json
  def update
    respond_to do |format|
      if @product_status_type.update(product_status_type_params)
        format.html { redirect_to @product_status_type, notice: 'Product status type was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @product_status_type.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /product_status_types/1
  # DELETE /product_status_types/1.json
  def destroy
    @product_status_type.destroy
    respond_to do |format|
      format.html { redirect_to product_status_types_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_product_status_type
      @product_status_type = ProductStatusType.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def product_status_type_params
      params.require(:product_status_type).permit(:title, :description)
    end
end
