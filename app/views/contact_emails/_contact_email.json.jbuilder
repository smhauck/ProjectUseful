json.extract! contact_email, :id, :address, :contact_id, :email_type_id, :created_at, :updated_at
json.url contact_email_url(contact_email, format: :json)
