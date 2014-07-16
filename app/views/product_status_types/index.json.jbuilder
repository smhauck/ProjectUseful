json.array!(@product_status_types) do |product_status_type|
  json.extract! product_status_type, :id, :title, :description
  json.url product_status_type_url(product_status_type, format: :json)
end
