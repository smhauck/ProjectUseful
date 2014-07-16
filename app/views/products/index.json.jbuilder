json.array!(@products) do |product|
  json.extract! product, :id, :alive, :title, :description
  json.url product_url(product, format: :json)
end
