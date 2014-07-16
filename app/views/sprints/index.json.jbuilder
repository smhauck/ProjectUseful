json.array!(@sprints) do |sprint|
  json.extract! sprint, :id, :alive, :title, :description, :Product_id, :Project_id
  json.url sprint_url(sprint, format: :json)
end
