json.array!(@story_assignments) do |story_assignment|
  json.extract! story_assignment, :id, :story_id, :user_id
  json.url story_assignment_url(story_assignment, format: :json)
end
