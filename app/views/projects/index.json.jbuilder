json.array!(@projects) do |project|
  json.extract! project, :id, :title, :description, :sched_start_date, :actual_start_date, :sched_completion_date, :actual_completion_date, :product_id
  json.url project_url(project, format: :json)
end
