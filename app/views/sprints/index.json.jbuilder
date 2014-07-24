json.array!(@sprints) do |sprint|
  json.extract! sprint, :id, :alive, :title, :description, :product_id
  json.url sprint_url(sprint, format: :json)
end
