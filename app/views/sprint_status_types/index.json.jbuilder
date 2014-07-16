json.array!(@sprint_status_types) do |sprint_status_type|
  json.extract! sprint_status_type, :id, :title, :description
  json.url sprint_status_type_url(sprint_status_type, format: :json)
end
