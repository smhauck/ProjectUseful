json.array!(@stories) do |story|
  json.extract! story, :id, :alive, :title, :description, :product_id, :sprint_id
  json.url story_url(story, format: :json)
end
