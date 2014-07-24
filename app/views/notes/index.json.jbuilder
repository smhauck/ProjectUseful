json.array!(@notes) do |note|
  json.extract! note, :id, :title, :body, :user_id, :product_id, :sprint_id, :story_id, :task_id
  json.url note_url(note, format: :json)
end
