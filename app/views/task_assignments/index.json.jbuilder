json.array!(@task_assignments) do |task_assignment|
  json.extract! task_assignment, :id, :task_id, :user_id
  json.url task_assignment_url(task_assignment, format: :json)
end
