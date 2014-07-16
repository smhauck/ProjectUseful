json.array!(@tasks) do |task|
  json.extract! task, :id, :alive, :title, :description, :Product_id, :Project_id, :Sprint_id, :Story_id
  json.url task_url(task, format: :json)
end
