json.array!(@story_status_types) do |story_status_type|
  json.extract! story_status_type, :id, :title, :description
  json.url story_status_type_url(story_status_type, format: :json)
end
