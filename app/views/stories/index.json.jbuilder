json.array!(@stories) do |story|
  json.extract! story, :id, :alive, :title, :description, :Product_id, :Project_id, :Sprint_id
  json.url story_url(story, format: :json)
end
