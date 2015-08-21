json.array!(@email_to_sms_gateways) do |email_to_sms_gateway|
  json.extract! email_to_sms_gateway, :id, :name, :address, :description, :active
  json.url email_to_sms_gateway_url(email_to_sms_gateway, format: :json)
end
