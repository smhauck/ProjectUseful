json.array!(@projects) do |project|
  json.extract! project, :id, :alive, :title, :description, :Product_id
  json.url project_url(project, format: :json)
end
