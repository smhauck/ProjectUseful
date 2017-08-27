json.extract! email_type, :id, :name, :description, :created_at, :updated_at
json.url email_type_url(email_type, format: :json)
