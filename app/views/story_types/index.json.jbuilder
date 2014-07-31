json.array!(@story_types) do |story_type|
  json.extract! story_type, :id, :title, :description
  json.url story_type_url(story_type, format: :json)
end
