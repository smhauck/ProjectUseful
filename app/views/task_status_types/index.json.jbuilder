json.array!(@task_status_types) do |task_status_type|
  json.extract! task_status_type, :id, :title, :description
  json.url task_status_type_url(task_status_type, format: :json)
end
