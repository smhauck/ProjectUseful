json.array!(@departments) do |department|
  json.extract! department, :id, :title, :description
  json.url department_url(department, format: :json)
end
