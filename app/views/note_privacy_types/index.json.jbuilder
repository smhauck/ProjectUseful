json.array!(@note_privacy_types) do |note_privacy_type|
  json.extract! note_privacy_type, :id, :title, :code, :description
  json.url note_privacy_type_url(note_privacy_type, format: :json)
end
