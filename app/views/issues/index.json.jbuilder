json.array!(@issues) do |issue|
  json.extract! issue, :id, :title, :description, :product_id, :requestor, :issue_status_type_id
  json.url issue_url(issue, format: :json)
end
