json.array!(@meeting_assignments) do |meeting_assignment|
  json.extract! meeting_assignment, :id, :meeting_id, :user_id
  json.url meeting_assignment_url(meeting_assignment, format: :json)
end
