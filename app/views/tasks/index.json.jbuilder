json.array!(@tasks) do |task|
  json.extract! task, :id, :alive, :title, :description, :product_id, :project_id, :sprint_id, :story_id
  json.url task_url(task, format: :json)
end
