json.array!(@meetings) do |meeting|
  json.extract! meeting, :id, :scheduled, :title, :subject, :description, :notes, :user_id
  json.url meeting_url(meeting, format: :json)
end
