json.array!(@issue_status_types) do |issue_status_type|
  json.extract! issue_status_type, :id, :title, :code, :description
  json.url issue_status_type_url(issue_status_type, format: :json)
end
