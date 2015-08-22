json.array!(@project_assignments) do |project_assignment|
  json.extract! project_assignment, :id, :project_id, :user_id
  json.url project_assignment_url(project_assignment, format: :json)
end
