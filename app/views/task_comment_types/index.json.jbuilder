json.array!(@task_comment_types) do |task_comment_type|
  json.extract! task_comment_type, :id, :title, :description
  json.url task_comment_type_url(task_comment_type, format: :json)
end
