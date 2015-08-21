json.array!(@project_status_types) do |project_status_type|
  json.extract! project_status_type, :id, :alive, :code, :title, :description
  json.url project_status_type_url(project_status_type, format: :json)
end
