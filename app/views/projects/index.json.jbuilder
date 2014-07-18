json.array!(@projects) do |project|
  json.extract! project, :id, :alive, :title, :description, :product_id
  json.url project_url(project, format: :json)
end
