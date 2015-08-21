class EmailToSmsGatewaysController < ApplicationController
  before_action :set_email_to_sms_gateway, only: [:show, :edit, :update, :destroy]

  # GET /email_to_sms_gateways
  # GET /email_to_sms_gateways.json
  def index
    @email_to_sms_gateways = EmailToSmsGateway.all
  end

  # GET /email_to_sms_gateways/1
  # GET /email_to_sms_gateways/1.json
  def show
  end

  # GET /email_to_sms_gateways/new
  def new
    @email_to_sms_gateway = EmailToSmsGateway.new
  end

  # GET /email_to_sms_gateways/1/edit
  def edit
  end

  # POST /email_to_sms_gateways
  # POST /email_to_sms_gateways.json
  def create
    @email_to_sms_gateway = EmailToSmsGateway.new(email_to_sms_gateway_params)

    respond_to do |format|
      if @email_to_sms_gateway.save
        format.html { redirect_to @email_to_sms_gateway, notice: 'Email to sms gateway was successfully created.' }
        format.json { render action: 'show', status: :created, location: @email_to_sms_gateway }
      else
        format.html { render action: 'new' }
        format.json { render json: @email_to_sms_gateway.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /email_to_sms_gateways/1
  # PATCH/PUT /email_to_sms_gateways/1.json
  def update
    respond_to do |format|
      if @email_to_sms_gateway.update(email_to_sms_gateway_params)
        format.html { redirect_to @email_to_sms_gateway, notice: 'Email to sms gateway was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @email_to_sms_gateway.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /email_to_sms_gateways/1
  # DELETE /email_to_sms_gateways/1.json
  def destroy
    @email_to_sms_gateway.destroy
    respond_to do |format|
      format.html { redirect_to email_to_sms_gateways_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_email_to_sms_gateway
      @email_to_sms_gateway = EmailToSmsGateway.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def email_to_sms_gateway_params
      params.require(:email_to_sms_gateway).permit(:name, :address, :description, :active)
    end
end
