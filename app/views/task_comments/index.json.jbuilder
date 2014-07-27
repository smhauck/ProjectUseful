json.array!(@task_hours) do |task_hour|
  json.extract! task_hour, :id, :hours, :date_of_work, :task_id, :user_id
  json.url task_hour_url(task_hour, format: :json)
end
